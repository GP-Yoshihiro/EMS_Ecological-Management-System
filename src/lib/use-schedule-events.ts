"use client";

import { useMemo } from "react";
import { useTanks } from "./supabase/tanks";
import { useCreatures } from "./supabase/creatures";
import { calculateCleaningIntervalDays } from "./cleaning-schedule";
import type { ScheduleEvent } from "@/types/schedule";
import type { CreatureCategory } from "@/types/creature";

/** 生体分類ごとの基準給餌間隔(日)。種ごとの詳細設定は将来の拡張候補。 */
const FEEDING_INTERVAL_DAYS: Record<CreatureCategory, number> = {
  fish: 1,
  reptile: 3,
  insect: 2,
  other: 2,
};

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** 起点日から一定間隔で繰り返す日付のうち、指定した月に含まれるものを列挙する */
function generateRecurringDates(
  anchorDate: Date,
  intervalDays: number,
  year: number,
  month: number
): Date[] {
  const anchor = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), anchorDate.getDate());
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dates: Date[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    if (date < anchor) continue;
    const diffDays = Math.round((date.getTime() - anchor.getTime()) / 86_400_000);
    if (diffDays % intervalDays === 0) {
      dates.push(date);
    }
  }

  return dates;
}

/** 水槽/生態の実データから、指定月の給餌日・清掃日を算出する */
export function useScheduleEvents(year: number, month: number) {
  const { tanks, loading: tanksLoading } = useTanks();
  const { creatures, loading: creaturesLoading } = useCreatures();

  const events = useMemo(() => {
    const result: ScheduleEvent[] = [];

    for (const tank of tanks) {
      const creatureCount = creatures.filter((creature) => creature.tankId === tank.id).length;
      const intervalDays = calculateCleaningIntervalDays(tank, creatureCount);
      const anchor = new Date(tank.createdAt);

      for (const date of generateRecurringDates(anchor, intervalDays, year, month)) {
        result.push({
          id: `cleaning-${tank.id}-${toIsoDate(date)}`,
          date: toIsoDate(date),
          type: "cleaning",
          title: "清掃",
          targetName: tank.name,
        });
      }
    }

    for (const creature of creatures) {
      const intervalDays = FEEDING_INTERVAL_DAYS[creature.category];
      const anchor = new Date(creature.introducedAt || creature.createdAt);

      for (const date of generateRecurringDates(anchor, intervalDays, year, month)) {
        const label = creature.individualName
          ? `${creature.speciesName}(${creature.individualName})`
          : creature.speciesName;
        result.push({
          id: `feeding-${creature.id}-${toIsoDate(date)}`,
          date: toIsoDate(date),
          type: "feeding",
          title: "給餌",
          targetName: label,
        });
      }
    }

    return result;
  }, [tanks, creatures, year, month]);

  return { events, loading: tanksLoading || creaturesLoading };
}
