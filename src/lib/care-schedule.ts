import type { CareSchedule, CareScheduleUnit } from "@/types/care-schedule";
import type { Creature } from "@/types/creature";
import type { Tank } from "@/types/tank";
import { FEEDING_INTERVAL_DAYS } from "./care-intervals";
import { calculateCleaningIntervalDays } from "./cleaning-schedule";

const DAYS_PER_UNIT: Record<CareScheduleUnit, number> = {
  day: 1,
  week: 7,
  month: 30,
  year: 365,
};

/** count(回数)または曜日指定のいずれかが入力されていれば「手動設定あり」とみなす */
export function isScheduleConfigured(schedule: CareSchedule): boolean {
  return (schedule.count !== null && schedule.count > 0) || schedule.weekdays.length > 0;
}

/** 手動スケジュールから概算の間隔日数を算出する(曜日指定がある場合はその日数から概算) */
export function scheduleIntervalDays(schedule: CareSchedule): number {
  if (schedule.unit === "week" && schedule.weekdays.length > 0) {
    return Math.max(1, Math.round(7 / schedule.weekdays.length));
  }
  if (schedule.count && schedule.count > 0) {
    return Math.max(1, Math.round(DAYS_PER_UNIT[schedule.unit] / schedule.count));
  }
  return DAYS_PER_UNIT[schedule.unit];
}

/** 生体の給餌間隔(日)。手動設定があればそれを、なければ分類ごとの自動算出値を使う */
export function getFeedingIntervalDays(creature: Creature): number {
  if (isScheduleConfigured(creature.feedingSchedule)) {
    return scheduleIntervalDays(creature.feedingSchedule);
  }
  return FEEDING_INTERVAL_DAYS[creature.category];
}

/** 水槽の清掃間隔(日)。手動設定があればそれを、なければサイズ等からの自動算出値を使う */
export function getCleaningIntervalDays(tank: Tank, tankCreatureCount: number): number {
  if (isScheduleConfigured(tank.cleaningSchedule)) {
    return scheduleIntervalDays(tank.cleaningSchedule);
  }
  return calculateCleaningIntervalDays(tank, tankCreatureCount);
}
