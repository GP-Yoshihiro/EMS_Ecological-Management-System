export type CreatureCategory = "fish" | "reptile" | "insect" | "other";

export const CREATURE_CATEGORY_LABELS: Record<CreatureCategory, string> = {
  fish: "魚",
  reptile: "爬虫類",
  insect: "昆虫",
  other: "その他",
};

export interface Creature {
  id: string;
  category: CreatureCategory;
  /** 種名 */
  speciesName: string;
  /** 個体名 */
  individualName: string;
  /** 導入日 (YYYY-MM-DD) */
  introducedAt: string;
  /** 所属する水槽/ケージのID(未割り当ての場合はnull) */
  tankId: string | null;
  /** 特記事項・成長記録・体調メモ */
  notes: string;
  createdAt: string;
}
