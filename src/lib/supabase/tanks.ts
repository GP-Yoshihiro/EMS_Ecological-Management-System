"use client";

import { useMemo } from "react";
import { useSupabaseTable } from "./use-supabase-table";
import type { Tank, TankCategory } from "@/types/tank";
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
  sort_order: number;
  cleaning_schedule_count: number | null;
  cleaning_schedule_unit: CareScheduleUnit;
  cleaning_schedule_weekdays: number[];
  created_at: string;
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
    sortOrder: row.sort_order,
    cleaningSchedule: {
      count: row.cleaning_schedule_count,
      unit: row.cleaning_schedule_unit,
      weekdays: row.cleaning_schedule_weekdays,
    },
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
    sort_order: tank.sortOrder,
    cleaning_schedule_count: tank.cleaningSchedule.count,
    cleaning_schedule_unit: tank.cleaningSchedule.unit,
    cleaning_schedule_weekdays: tank.cleaningSchedule.weekdays,
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
