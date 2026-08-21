export type TankCategory = "aquarium" | "cage" | "terrarium" | "other";

export const TANK_CATEGORY_LABELS: Record<TankCategory, string> = {
  aquarium: "水槽",
  cage: "ケージ",
  terrarium: "テラリウム",
  other: "その他",
};

export interface Tank {
  id: string;
  name: string;
  category: TankCategory;
  widthCm: number;
  depthCm: number;
  heightCm: number;
  volumeLiters: number;
  location: string;
  /** 底床・フィルター・ヒーター・照明などの機材構成メモ */
  layoutNotes: string;
  createdAt: string;
}
