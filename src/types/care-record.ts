export interface FeedingRecord {
  id: string;
  creatureId: string;
  /** 実施日 (YYYY-MM-DD) */
  date: string;
  note: string;
  createdAt: string;
}

export interface CleaningRecord {
  id: string;
  tankId: string;
  /** 実施日 (YYYY-MM-DD) */
  date: string;
  note: string;
  createdAt: string;
}
