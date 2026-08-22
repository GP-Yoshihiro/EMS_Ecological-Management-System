import type { CareSchedule } from "./care-schedule";

export type TankCategory = "aquarium" | "cage" | "terrarium" | "other";

export const TANK_CATEGORY_LABELS: Record<TankCategory, string> = {
  aquarium: "水槽",
  cage: "ケージ",
  terrarium: "テラリウム",
  other: "その他",
};

export type LightType = "led" | "uv" | "infrared";

export const LIGHT_TYPE_LABELS: Record<LightType, string> = {
  led: "LED",
  uv: "紫外線",
  infrared: "赤外線",
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
  /** 「オリジナル」並び替え用の手動順序(小さいほど先) */
  sortOrder: number;
  /** 清掃スケジュールの手動設定(未設定の場合は自動算出) */
  cleaningSchedule: CareSchedule;
  /** 気温(℃、任意) */
  ambientTemperatureC: number | null;
  /** 湿度(%、任意) */
  humidityPercent: number | null;
  /** 水温(℃、任意) */
  waterTemperatureC: number | null;
  /** 使用しているライトの種類(複数選択可) */
  lightTypes: LightType[];
  /** ライト使用時間帯の開始時刻(24時間表記 "HH:MM"、任意) */
  lightStartTime: string | null;
  /** ライト使用時間帯の終了時刻(24時間表記 "HH:MM"、任意) */
  lightEndTime: string | null;
  heaterEnabled: boolean;
  heaterStartTime: string | null;
  heaterEndTime: string | null;
  fanEnabled: boolean;
  fanStartTime: string | null;
  fanEndTime: string | null;
  createdAt: string;
}
