"use client";

import { useMemo } from "react";
import { useSupabaseTable } from "./use-supabase-table";
import type { Creature, CreatureCategory } from "@/types/creature";
import type { CareScheduleUnit } from "@/types/care-schedule";

interface CreatureRow {
  id: string;
  category: CreatureCategory;
  species_name: string;
  individual_name: string;
  introduced_at: string | null;
  tank_id: string | null;
  notes: string;
  sort_order: number;
  feeding_schedule_count: number | null;
  feeding_schedule_unit: CareScheduleUnit;
  feeding_schedule_weekdays: number[];
  created_at: string;
}

function toCreature(row: CreatureRow): Creature {
  return {
    id: row.id,
    category: row.category,
    speciesName: row.species_name,
    individualName: row.individual_name,
    introducedAt: row.introduced_at ?? "",
    tankId: row.tank_id,
    notes: row.notes,
    sortOrder: row.sort_order,
    feedingSchedule: {
      count: row.feeding_schedule_count,
      unit: row.feeding_schedule_unit,
      weekdays: row.feeding_schedule_weekdays,
    },
    createdAt: row.created_at,
  };
}

function toRow(creature: Creature): CreatureRow {
  return {
    id: creature.id,
    category: creature.category,
    species_name: creature.speciesName,
    individual_name: creature.individualName,
    introduced_at: creature.introducedAt || null,
    tank_id: creature.tankId,
    notes: creature.notes,
    sort_order: creature.sortOrder,
    feeding_schedule_count: creature.feedingSchedule.count,
    feeding_schedule_unit: creature.feedingSchedule.unit,
    feeding_schedule_weekdays: creature.feedingSchedule.weekdays,
    created_at: creature.createdAt,
  };
}

export function useCreatures() {
  const { items, loading, error, upsert, remove } = useSupabaseTable<CreatureRow>("creatures", {
    orderBy: "created_at",
  });

  const creatures = useMemo(() => items.map(toCreature), [items]);

  return {
    creatures,
    loading,
    error,
    upsertCreature: (creature: Creature) => upsert(toRow(creature)),
    removeCreature: remove,
  };
}
