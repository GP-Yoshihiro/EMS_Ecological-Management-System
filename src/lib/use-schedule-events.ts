"use client";

import { useMemo } from "react";
import { useTanks } from "./supabase/tanks";
import { useCreatures } from "./supabase/creatures";
import { useFeedingRecords } from "./supabase/feeding-records";
import { useCleaningRecords } from "./supabase/cleaning-records";
import { getFeedingIntervalDays, getCleaningIntervalDays } from "./care-schedule";
import type { ScheduleEvent } from "@/types/schedule";
import type { CareSchedule } from "@/types/care-schedule";

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function latestDate(dates: string[]): string | undefined {
  return dates.length === 0 ? undefined : dates.reduce((a, b) => (a > b ? a : b));
}

/** 前後何日までの実施記録を「その予定に対応するもの」とみなすか(間隔日数の半分、上限3日) */
function toleranceDays(intervalDays: number): number {
  return Math.max(0, Math.min(3, Math.floor(intervalDays / 2)));
}

/**
 * 予定日ごとに、前後の許容範囲内でもっとも近い実施記録を1件ずつ対応付ける
 * (1件の記録が複数の予定に重複して対応付けられないようにする)。
 */
function matchRecordsToDates<T extends { id: string; date: string }>(
  dates: Date[],
  records: T[],
  tolerance: number
): Map<string, string> {
  const usedRecordIds = new Set<string>();
  const matches = new Map<string, string>();

  for (const date of dates) {
    const iso = toIsoDate(date);
    let bestId: string | undefined;
    let bestDiff = Infinity;

    for (const record of records) {
      if (usedRecordIds.has(record.id)) continue;
      const diffDays = Math.abs(
        (new Date(record.date).getTime() - new Date(iso).getTime()) / 86_400_000
      );
      if (diffDays <= tolerance && diffDays < bestDiff) {
        bestDiff = diffDays;
        bestId = record.id;
      }
    }

    if (bestId) {
      matches.set(iso, bestId);
      usedRecordIds.add(bestId);
    }
  }

  return matches;
}

/** 起点日から一定間隔で繰り返す日付のうち、指定した月に含まれるものを列挙する */
function generateIntervalDates(
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

/** 起点日以降で、指定した曜日に該当する日付のうち、指定した月に含まれるものを列挙する */
function generateWeekdayDates(
  anchorDate: Date,
  weekdays: number[],
  year: number,
  month: number
): Date[] {
  const anchor = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), anchorDate.getDate());
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dates: Date[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    if (date < anchor) continue;
    if (weekdays.includes(date.getDay())) {
      dates.push(date);
    }
  }

  return dates;
}

/** スケジュール設定に応じて日付を列挙する(曜日指定があれば曜日優先、なければ間隔日数) */
function generateDates(
  anchorDate: Date,
  schedule: CareSchedule,
  intervalDays: number,
  year: number,
  month: number
): Date[] {
  if (schedule.unit === "week" && schedule.weekdays.length > 0) {
    return generateWeekdayDates(anchorDate, schedule.weekdays, year, month);
  }
  return generateIntervalDates(anchorDate, intervalDays, year, month);
}

/**
 * 水槽/生態の実データから、指定月の給餌日・清掃日を算出する。
 * 実際に早め/遅めに実施した記録がある場合は、その最新の実施日を起点として
 * 以降の予定を自動的にずらして再計算する(実施記録が編集/追加されるたびに反映される)。
 */
export function useScheduleEvents(year: number, month: number) {
  const { tanks, loading: tanksLoading } = useTanks();
  const { creatures, loading: creaturesLoading } = useCreatures();
  const {
    records: feedingRecords,
    loading: feedingLoading,
    error: feedingError,
    upsertRecord: upsertFeedingRecord,
    removeRecord: removeFeedingRecord,
  } = useFeedingRecords();
  const {
    records: cleaningRecords,
    loading: cleaningLoading,
    error: cleaningError,
    upsertRecord: upsertCleaningRecord,
    removeRecord: removeCleaningRecord,
  } = useCleaningRecords();

  const events = useMemo(() => {
    const result: ScheduleEvent[] = [];

    for (const tank of tanks) {
      const creatureCount = creatures.filter((creature) => creature.tankId === tank.id).length;
      const intervalDays = getCleaningIntervalDays(tank, creatureCount);
      const tankRecords = cleaningRecords.filter((record) => record.tankId === tank.id);
      const lastRecordDate = latestDate(tankRecords.map((record) => record.date));
      const anchor = new Date(lastRecordDate || tank.createdAt);

      const dates = generateDates(anchor, tank.cleaningSchedule, intervalDays, year, month);
      const matches = matchRecordsToDates(dates, tankRecords, toleranceDays(intervalDays));

      for (const date of dates) {
        const iso = toIsoDate(date);
        result.push({
          id: `cleaning-${tank.id}-${iso}`,
          date: iso,
          type: "cleaning",
          title: "清掃",
          targetName: tank.name,
          targetId: tank.id,
          recordId: matches.get(iso),
        });
      }
    }

    for (const creature of creatures) {
      const intervalDays = getFeedingIntervalDays(creature);
      const creatureRecords = feedingRecords.filter((record) => record.creatureId === creature.id);
      const lastRecordDate = latestDate(creatureRecords.map((record) => record.date));
      const anchor = new Date(lastRecordDate || creature.introducedAt || creature.createdAt);

      const dates = generateDates(anchor, creature.feedingSchedule, intervalDays, year, month);
      const matches = matchRecordsToDates(dates, creatureRecords, toleranceDays(intervalDays));
      const label = creature.individualName
        ? `${creature.speciesName}(${creature.individualName})`
        : creature.speciesName;

      for (const date of dates) {
        const iso = toIsoDate(date);
        result.push({
          id: `feeding-${creature.id}-${iso}`,
          date: iso,
          type: "feeding",
          title: "給餌",
          targetName: label,
          targetId: creature.id,
          recordId: matches.get(iso),
        });
      }
    }

    return result;
  }, [tanks, creatures, feedingRecords, cleaningRecords, year, month]);

  return {
    events,
    loading: tanksLoading || creaturesLoading || feedingLoading || cleaningLoading,
    error: feedingError || cleaningError,
    feedingRecords,
    cleaningRecords,
    upsertFeedingRecord,
    removeFeedingRecord,
    upsertCleaningRecord,
    removeCleaningRecord,
  };
}
