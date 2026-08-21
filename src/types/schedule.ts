export type ScheduleEventType = "feeding" | "cleaning";

export interface ScheduleEvent {
  id: string;
  /** ISO date (YYYY-MM-DD) */
  date: string;
  type: ScheduleEventType;
  title: string;
  targetName: string;
}
