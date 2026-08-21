"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "./client";

interface UseSupabaseTableOptions {
  orderBy?: string;
}

/**
 * Supabaseの1テーブルを読み書きするための汎用フック。
 * 個人利用(単一ユーザー)前提のため、サーバーからの取得は初回マウント時のみ行い、
 * 追加/更新/削除の直後はローカルのitemsを直接更新する(楽観的更新)。
 */
export function useSupabaseTable<T extends { id: string }>(
  table: string,
  options?: UseSupabaseTableOptions
) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const orderBy = options?.orderBy;

  const refetch = useCallback(async () => {
    setLoading(true);
    let query = supabase.from(table).select("*");
    if (orderBy) {
      query = query.order(orderBy, { ascending: true });
    }
    const { data, error: fetchError } = await query;
    if (fetchError) {
      setError(fetchError.message);
    } else {
      setItems((data ?? []) as T[]);
      setError(null);
    }
    setLoading(false);
  }, [table, orderBy]);

  useEffect(() => {
    // Supabase(外部システム)からの初回データ取得という
    // useEffectの正当な用途のため、set-state-in-effectのルールを無効化する。
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refetch();
  }, [refetch]);

  const upsert = useCallback(
    async (item: T) => {
      const { error: upsertError } = await supabase.from(table).upsert(item);
      if (upsertError) {
        setError(upsertError.message);
        return;
      }
      setError(null);
      setItems((prev) => {
        const exists = prev.some((existing) => existing.id === item.id);
        return exists
          ? prev.map((existing) => (existing.id === item.id ? item : existing))
          : [...prev, item];
      });
    },
    [table]
  );

  const remove = useCallback(
    async (id: string) => {
      const { error: deleteError } = await supabase.from(table).delete().eq("id", id);
      if (deleteError) {
        setError(deleteError.message);
        return;
      }
      setError(null);
      setItems((prev) => prev.filter((existing) => existing.id !== id));
    },
    [table]
  );

  return { items, loading, error, upsert, remove, refetch };
}
