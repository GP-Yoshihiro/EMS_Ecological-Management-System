export interface CreatureLog {
  id: string;
  creatureId: string;
  /** 記録日 (YYYY-MM-DD) */
  date: string;
  /** 体調・成長記録メモ */
  note: string;
  createdAt: string;
}
