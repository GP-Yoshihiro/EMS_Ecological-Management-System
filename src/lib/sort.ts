export type SortMode = "kana" | "original";
export type SortDirection = "asc" | "desc";

/**
 * 五十音(名前のlocaleCompare)またはオリジナル(手動設定したsortOrder)で並び替え、
 * 昇順/降順を適用する。
 */
export function sortItems<T>(
  items: T[],
  mode: SortMode,
  direction: SortDirection,
  getName: (item: T) => string,
  getOrder: (item: T) => number
): T[] {
  const sorted = [...items].sort((a, b) =>
    mode === "kana" ? getName(a).localeCompare(getName(b), "ja") : getOrder(a) - getOrder(b)
  );
  return direction === "desc" ? sorted.reverse() : sorted;
}
