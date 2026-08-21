/**
 * ステップ8でDB接続に置き換えるまでの暫定キー。
 * UI側は useLocalCollection のインターフェースのみに依存する。
 */
export const STORAGE_KEYS = {
  tanks: "aqualife:tanks",
  creatures: "aqualife:creatures",
} as const;
