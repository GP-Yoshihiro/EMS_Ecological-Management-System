"use client";

import { useMemo } from "react";
import { useSupabaseTable } from "./use-supabase-table";
import type { Tank, TankCategory, LightType, TankShape } from "@/types/tank";
import type { CareScheduleUnit } from "@/types/care-schedule";

interface TankRow {
  id: string;
  name: string;
  category: TankCategory;
  width_cm: number;
  depth_cm: number;
  height_cm: number;
  volume_liters: number;
  location: string;
  layout_notes: string;
  shape: TankShape | null;
  sort_order: number;
  cleaning_schedule_count: number | null;
  cleaning_schedule_unit: CareScheduleUnit;
  cleaning_schedule_weekdays: number[];
  ambient_temperature_c: number | null;
  humidity_percent: number | null;
  water_temperature_c: number | null;
  light_types: LightType[];
  light_start_time: string | null;
  light_end_time: string | null;
  heater_enabled: boolean;
  heater_start_time: string | null;
  heater_end_time: string | null;
  fan_enabled: boolean;
  fan_start_time: string | null;
  fan_end_time: string | null;
  created_at: string;
}

/** Postgresの time 型("HH:MM:SS")をフォーム/表示用の"HH:MM"に揃える */
function toHm(value: string | null): string | null {
  return value ? value.slice(0, 5) : null;
}

function toTank(row: TankRow): Tank {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    widthCm: row.width_cm,
    depthCm: row.depth_cm,
    heightCm: row.height_cm,
    volumeLiters: row.volume_liters,
    location: row.location,
    layoutNotes: row.layout_notes,
    shape: row.shape,
    sortOrder: row.sort_order,
    cleaningSchedule: {
      count: row.cleaning_schedule_count,
      unit: row.cleaning_schedule_unit,
      weekdays: row.cleaning_schedule_weekdays,
    },
    ambientTemperatureC: row.ambient_temperature_c,
    humidityPercent: row.humidity_percent,
    waterTemperatureC: row.water_temperature_c,
    lightTypes: row.light_types,
    lightStartTime: toHm(row.light_start_time),
    lightEndTime: toHm(row.light_end_time),
    heaterEnabled: row.heater_enabled,
    heaterStartTime: toHm(row.heater_start_time),
    heaterEndTime: toHm(row.heater_end_time),
    fanEnabled: row.fan_enabled,
    fanStartTime: toHm(row.fan_start_time),
    fanEndTime: toHm(row.fan_end_time),
    createdAt: row.created_at,
  };
}

function toRow(tank: Tank): TankRow {
  return {
    id: tank.id,
    name: tank.name,
    category: tank.category,
    width_cm: tank.widthCm,
    depth_cm: tank.depthCm,
    height_cm: tank.heightCm,
    volume_liters: tank.volumeLiters,
    location: tank.location,
    layout_notes: tank.layoutNotes,
    shape: tank.shape,
    sort_order: tank.sortOrder,
    cleaning_schedule_count: tank.cleaningSchedule.count,
    cleaning_schedule_unit: tank.cleaningSchedule.unit,
    cleaning_schedule_weekdays: tank.cleaningSchedule.weekdays,
    ambient_temperature_c: tank.ambientTemperatureC,
    humidity_percent: tank.humidityPercent,
    water_temperature_c: tank.waterTemperatureC,
    light_types: tank.lightTypes,
    light_start_time: tank.lightStartTime,
    light_end_time: tank.lightEndTime,
    heater_enabled: tank.heaterEnabled,
    heater_start_time: tank.heaterStartTime,
    heater_end_time: tank.heaterEndTime,
    fan_enabled: tank.fanEnabled,
    fan_start_time: tank.fanStartTime,
    fan_end_time: tank.fanEndTime,
    created_at: tank.createdAt,
  };
}

export function useTanks() {
  const { items, loading, error, upsert, remove } = useSupabaseTable<TankRow>("tanks", {
    orderBy: "created_at",
  });

  const tanks = useMemo(() => items.map(toTank), [items]);

  return {
    tanks,
    loading,
    error,
    upsertTank: (tank: Tank) => upsert(toRow(tank)),
    removeTank: (id: string) => remove(id),
  };
}
