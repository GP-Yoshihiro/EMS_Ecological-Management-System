"use client";

import { useMemo } from "react";
import { useSupabaseTable } from "./use-supabase-table";
import type { Tank, TankCategory } from "@/types/tank";

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
    removeTank: remove,
  };
}
