"use client";

import { useMemo } from "react";
import { useSupabaseTable } from "./use-supabase-table";
import type { TankEnvironmentRecord } from "@/types/tank-environment-record";

interface TankEnvironmentRecordRow {
  id: string;
  tank_id: string;
  recorded_at: string;
  ambient_temperature_c: number | null;
  humidity_percent: number | null;
  water_temperature_c: number | null;
  cleanliness_percent: number;
  created_at: string;
}

function toRecord(row: TankEnvironmentRecordRow): TankEnvironmentRecord {
  return {
    id: row.id,
    tankId: row.tank_id,
    recordedAt: row.recorded_at,
    ambientTemperatureC: row.ambient_temperature_c,
    humidityPercent: row.humidity_percent,
    waterTemperatureC: row.water_temperature_c,
    cleanlinessPercent: row.cleanliness_percent,
    createdAt: row.created_at,
  };
}

function toRow(record: TankEnvironmentRecord): TankEnvironmentRecordRow {
  return {
    id: record.id,
    tank_id: record.tankId,
    recorded_at: record.recordedAt,
    ambient_temperature_c: record.ambientTemperatureC,
    humidity_percent: record.humidityPercent,
    water_temperature_c: record.waterTemperatureC,
    cleanliness_percent: record.cleanlinessPercent,
    created_at: record.createdAt,
  };
}

export function useTankEnvironmentRecords() {
  const { items, loading, error, upsert, remove } = useSupabaseTable<TankEnvironmentRecordRow>(
    "tank_environment_records",
    { orderBy: "recorded_at" }
  );

  const records = useMemo(() => items.map(toRecord), [items]);

  return {
    records,
    loading,
    error,
    upsertRecord: (record: TankEnvironmentRecord) => upsert(toRow(record)),
    removeRecord: remove,
  };
}
