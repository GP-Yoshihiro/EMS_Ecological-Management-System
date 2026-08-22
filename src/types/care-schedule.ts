export type CareScheduleUnit = "year" | "month" | "week" | "day";

export interface CareSchedule {
  /** N回/単位。未設定の場合はnull(自動算出にフォールバック) */
  count: number | null;
  unit: CareScheduleUnit;
  /** 曜日指定(0=日〜6=土)。unit==="week"の場合のみ有効。 */
  weekdays: number[];
}

export const DEFAULT_CARE_SCHEDULE: CareSchedule = {
  count: null,
  unit: "week",
  weekdays: [],
};

export const CARE_SCHEDULE_UNIT_LABELS: Record<CareScheduleUnit, string> = {
  year: "年",
  month: "月",
  week: "週",
  day: "日",
};

export const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"] as const;
