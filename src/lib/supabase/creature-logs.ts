"use client";

import { useMemo } from "react";
import { useSupabaseTable } from "./use-supabase-table";
import type { CreatureLog } from "@/types/creature-log";

interface CreatureLogRow {
  id: string;
  creature_id: string;
  date: string;
  note: string;
  created_at: string;
}

function toCreatureLog(row: CreatureLogRow): CreatureLog {
  return {
    id: row.id,
    creatureId: row.creature_id,
    date: row.date,
    note: row.note,
    createdAt: row.created_at,
  };
}

function toRow(log: CreatureLog): CreatureLogRow {
  return {
    id: log.id,
    creature_id: log.creatureId,
    date: log.date,
    note: log.note,
    created_at: log.createdAt,
  };
}

export function useCreatureLogs() {
  const { items, loading, error, upsert, remove } = useSupabaseTable<CreatureLogRow>(
    "creature_logs",
    { orderBy: "date" }
  );

  const logs = useMemo(() => items.map(toCreatureLog), [items]);

  return {
    logs,
    loading,
    error,
    upsertLog: (log: CreatureLog) => upsert(toRow(log)),
    removeLog: remove,
  };
}
