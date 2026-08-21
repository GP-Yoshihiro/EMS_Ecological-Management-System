"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "./client";

interface UseSupabaseTableOptions {
  orderBy?: string;
}

/**
 * Supabaseの1テーブルをリアルタイム同期するための汎用フック。
 * 別タブ・別端末での変更も postgres_changes 経由で反映される。
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
    // Supabase(外部システム)からの初回データ取得 + リアルタイム変更購読という
    // useEffectの正当な用途のため、set-state-in-effectのルールを無効化する。
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refetch();

    const channel = supabase
      .channel(`${table}-changes`)
      .on("postgres_changes", { event: "*", schema: "public", table }, () => {
        refetch();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch, table]);

  const upsert = useCallback(
    async (item: T) => {
      const { error: upsertError } = await supabase.from(table).upsert(item);
      if (upsertError) {
        setError(upsertError.message);
        return;
      }
      await refetch();
    },
    [table, refetch]
  );

  const remove = useCallback(
    async (id: string) => {
      const { error: deleteError } = await supabase.from(table).delete().eq("id", id);
      if (deleteError) {
        setError(deleteError.message);
        return;
      }
      await refetch();
    },
    [table, refetch]
  );

  return { items, loading, error, upsert, remove, refetch };
}
