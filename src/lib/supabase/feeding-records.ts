"use client";

import { useMemo } from "react";
import { useSupabaseTable } from "./use-supabase-table";
import type { FeedingRecord } from "@/types/care-record";

interface FeedingRecordRow {
  id: string;
  creature_id: string;
  date: string;
  note: string;
  created_at: string;
}

function toFeedingRecord(row: FeedingRecordRow): FeedingRecord {
  return {
    id: row.id,
    creatureId: row.creature_id,
    date: row.date,
    note: row.note,
    createdAt: row.created_at,
  };
}

function toRow(record: FeedingRecord): FeedingRecordRow {
  return {
    id: record.id,
    creature_id: record.creatureId,
    date: record.date,
    note: record.note,
    created_at: record.createdAt,
  };
}

export function useFeedingRecords() {
  const { items, loading, error, upsert, remove } = useSupabaseTable<FeedingRecordRow>(
    "feeding_records",
    { orderBy: "date" }
  );

  const records = useMemo(() => items.map(toFeedingRecord), [items]);

  return {
    records,
    loading,
    error,
    upsertRecord: (record: FeedingRecord) => upsert(toRow(record)),
    removeRecord: remove,
  };
}
