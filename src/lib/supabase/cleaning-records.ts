"use client";

import { useMemo } from "react";
import { useSupabaseTable } from "./use-supabase-table";
import type { CleaningRecord } from "@/types/care-record";

interface CleaningRecordRow {
  id: string;
  tank_id: string;
  date: string;
  note: string;
  created_at: string;
}

function toCleaningRecord(row: CleaningRecordRow): CleaningRecord {
  return {
    id: row.id,
    tankId: row.tank_id,
    date: row.date,
    note: row.note,
    createdAt: row.created_at,
  };
}

function toRow(record: CleaningRecord): CleaningRecordRow {
  return {
    id: record.id,
    tank_id: record.tankId,
    date: record.date,
    note: record.note,
    created_at: record.createdAt,
  };
}

export function useCleaningRecords() {
  const { items, loading, error, upsert, remove } = useSupabaseTable<CleaningRecordRow>(
    "cleaning_records",
    { orderBy: "date" }
  );

  const records = useMemo(() => items.map(toCleaningRecord), [items]);

  return {
    records,
    loading,
    error,
    upsertRecord: (record: CleaningRecord) => upsert(toRow(record)),
    removeRecord: remove,
  };
}
