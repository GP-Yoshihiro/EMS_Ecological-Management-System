export type ScheduleEventType = "feeding" | "cleaning";

export interface ScheduleEvent {
  id: string;
  /** ISO date (YYYY-MM-DD) */
  date: string;
  type: ScheduleEventType;
  title: string;
  targetName: string;
  /** feedingの場合はcreatureId、cleaningの場合はtankId */
  targetId: string;
  /** この予定に対応すると判定された実施記録のID(前後の許容範囲内で一致したもの) */
  recordId?: string;
}
