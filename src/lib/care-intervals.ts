import type { CreatureCategory } from "@/types/creature";

/** 生体分類ごとの基準給餌間隔(日)。種ごとの詳細設定は将来の拡張候補。 */
export const FEEDING_INTERVAL_DAYS: Record<CreatureCategory, number> = {
  fish: 1,
  reptile: 3,
  insect: 2,
  other: 2,
};
