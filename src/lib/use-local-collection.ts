"use client";

import { useCallback, useSyncExternalStore } from "react";

interface CacheEntry<T> {
  raw: string | null;
  items: T[];
}

const cache = new Map<string, CacheEntry<unknown>>();
const listeners = new Map<string, Set<() => void>>();
const EMPTY: unknown[] = [];

function readRaw(key: string): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(key);
}

/**
 * localStorageの生文字列が変化していない限り、同じ配列参照を返す。
 * useSyncExternalStore は getSnapshot の参照比較で再レンダーを判断するため、
 * 変化がないのに新しい配列を返すと無限ループになる。
 */
function getSnapshot<T>(key: string): T[] {
  const raw = readRaw(key);
  const cached = cache.get(key) as CacheEntry<T> | undefined;
  if (cached && cached.raw === raw) {
    return cached.items;
  }
  const items = raw ? (JSON.parse(raw) as T[]) : [];
  cache.set(key, { raw, items });
  return items;
}

/** SSR時は常に同じ空配列参照を返す(サーバー/クライアント初回描画を一致させる) */
function getServerSnapshot<T>(): T[] {
  return EMPTY as T[];
}

function writeCollection<T>(key: string, items: T[]) {
  window.localStorage.setItem(key, JSON.stringify(items));
  listeners.get(key)?.forEach((callback) => callback());
}

function subscribe(key: string, callback: () => void) {
  const set = listeners.get(key) ?? new Set();
  set.add(callback);
  listeners.set(key, set);
  return () => {
    set.delete(callback);
  };
}

/**
 * localStorageを永続化先とする簡易コレクションフック。
 * ステップ8でDB接続に差し替える際は、同じ戻り値の形を保ったまま
 * 内部実装(fetch/Supabaseクライアント等)を入れ替える想定。
 */
export function useLocalCollection<T extends { id: string }>(key: string) {
  const items = useSyncExternalStore(
    (callback) => subscribe(key, callback),
    () => getSnapshot<T>(key),
    getServerSnapshot<T>
  );

  const upsert = useCallback(
    (item: T) => {
      const current = getSnapshot<T>(key);
      const exists = current.some((existing) => existing.id === item.id);
      const next = exists
        ? current.map((existing) => (existing.id === item.id ? item : existing))
        : [...current, item];
      writeCollection(key, next);
    },
    [key]
  );

  const remove = useCallback(
    (id: string) => {
      const current = getSnapshot<T>(key);
      const next = current.filter((existing) => existing.id !== id);
      writeCollection(key, next);
    },
    [key]
  );

  return { items, upsert, remove };
}
