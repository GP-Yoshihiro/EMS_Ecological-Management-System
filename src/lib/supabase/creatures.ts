"use client";

import { useMemo } from "react";
import { useSupabaseTable } from "./use-supabase-table";
import type { Creature, CreatureCategory } from "@/types/creature";

interface CreatureRow {
  id: string;
  category: CreatureCategory;
  species_name: string;
  individual_name: string;
  introduced_at: string | null;
  tank_id: string | null;
  notes: string;
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
