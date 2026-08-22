import type { Creature } from "@/types/creature";
import type { CreatureLog } from "@/types/creature-log";
import type { Tank } from "@/types/tank";
import { getFeedingIntervalDays, getCleaningIntervalDays } from "./care-schedule";

export type HealthStatus = "good" | "watch" | "alert";

export interface HealthAssessment {
  status: HealthStatus;
  reasons: string[];
}

/** 記録中にこれらの語が含まれる場合は「要注意」とする */
const ALERT_KEYWORDS = [
  "拒食",
  "餌を食べない",
  "食べない",
  "元気がない",
  "白点",
  "下痢",
  "傷",
  "出血",
  "呼吸が荒い",
  "動かない",
  "腫れ",
  "カビ",
  "死",
];

/** これらの語が含まれる場合は「要観察」とする(ALERTほど深刻ではない変化) */
const WATCH_KEYWORDS = ["痩せ", "食欲が落ち", "隠れて", "普段と違う", "色が薄い"];

const LONG_SILENCE_DAYS = 30;
/** 水槽の場合、生体1匹あたりの水量がこれを下回ると過密飼育の注意を出す(目安) */
const MIN_LITERS_PER_CREATURE = 5;
/** 給餌/清掃記録が基準間隔の何倍を超えたら「滞っている」とみなすか */
const CARE_OVERDUE_FACTOR = 2;

function daysSince(dateStr: string): number {
  if (!dateStr) return 0;
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diff / 86_400_000);
}

function escalate(current: HealthStatus, next: HealthStatus): HealthStatus {
  const order: HealthStatus[] = ["good", "watch", "alert"];
  return order.indexOf(next) > order.indexOf(current) ? next : current;
}

function latestDate(dates: string[]): string | undefined {
  return dates.length === 0 ? undefined : dates.reduce((a, b) => (a > b ? a : b));
}

export interface HealthAssessmentInput {
  creature: Creature;
  logs: CreatureLog[];
  tank: Tank | undefined;
  tankCreatureCount: number;
  /** その生体に対する給餌実施記録の日付一覧 */
  feedingRecordDates: string[];
  /** 所属水槽に対する清掃実施記録の日付一覧 */
  cleaningRecordDates: string[];
}

/**
 * 生態の体調記録・特記事項・給餌/清掃の実施記録・所属水槽の状況から、
 * ルールベースで健康状態を評価する。外部AI APIは使わず、キーワード検出と
 * 経過日数・過密飼育・給餌/清掃の滞りチェックの組み合わせで判定する
 * (ステップ11で決定した方針)。
 */
export function assessCreatureHealth(input: HealthAssessmentInput): HealthAssessment {
  const { creature, logs, tank, tankCreatureCount, feedingRecordDates, cleaningRecordDates } =
    input;
  const reasons: string[] = [];
  let status: HealthStatus = "good";

  const sortedLogs = [...logs].sort((a, b) => b.date.localeCompare(a.date));
  const recentTexts = [creature.notes, ...sortedLogs.slice(0, 5).map((log) => log.note)];

  for (const text of recentTexts) {
    if (!text) continue;
    const matchedAlert = ALERT_KEYWORDS.find((keyword) => text.includes(keyword));
    if (matchedAlert) {
      status = escalate(status, "alert");
      reasons.push(`記録に注意が必要な語("${matchedAlert}")が含まれています: 「${text}」`);
      continue;
    }
    const matchedWatch = WATCH_KEYWORDS.find((keyword) => text.includes(keyword));
    if (matchedWatch) {
      status = escalate(status, "watch");
      reasons.push(`経過観察が推奨される記録があります: 「${text}」`);
    }
  }

  const referenceDate = sortedLogs[0]?.date || creature.introducedAt || creature.createdAt;
  const silenceDays = daysSince(referenceDate);
  if (silenceDays > LONG_SILENCE_DAYS) {
    status = escalate(status, "watch");
    reasons.push(`${silenceDays}日間、体調記録が更新されていません。様子を確認しましょう。`);
  }

  if (tank && tank.category === "aquarium" && tankCreatureCount > 0) {
    const litersPerCreature = tank.volumeLiters / tankCreatureCount;
    if (litersPerCreature < MIN_LITERS_PER_CREATURE) {
      status = escalate(status, "watch");
      reasons.push(
        `同じ水槽の生体数に対して水量が少なめです(1匹あたり約${litersPerCreature.toFixed(1)}L)。過密飼育に注意してください。`
      );
    }
  }

  const feedingIntervalDays = getFeedingIntervalDays(creature);
  const lastFeedingDate = latestDate(feedingRecordDates);
  const feedingReferenceDate = lastFeedingDate || creature.introducedAt || creature.createdAt;
  const daysSinceFeeding = daysSince(feedingReferenceDate);
  if (daysSinceFeeding > feedingIntervalDays * CARE_OVERDUE_FACTOR) {
    status = escalate(status, "watch");
    reasons.push(
      lastFeedingDate
        ? `給餌記録から${daysSinceFeeding}日経過しています(目安: ${feedingIntervalDays}日間隔)。給餌を確認してください。`
        : `給餌の実施記録がありません(目安: ${feedingIntervalDays}日間隔)。カレンダーから記録してください。`
    );
  }

  if (tank) {
    const cleaningIntervalDays = getCleaningIntervalDays(tank, tankCreatureCount);
    const lastCleaningDate = latestDate(cleaningRecordDates);
    const cleaningReferenceDate = lastCleaningDate || tank.createdAt;
    const daysSinceCleaning = daysSince(cleaningReferenceDate);
    if (daysSinceCleaning > cleaningIntervalDays * CARE_OVERDUE_FACTOR) {
      status = escalate(status, "watch");
      reasons.push(
        lastCleaningDate
          ? `所属水槽(${tank.name})の清掃記録から${daysSinceCleaning}日経過しています(目安: ${cleaningIntervalDays}日間隔)。`
          : `所属水槽(${tank.name})の清掃実施記録がありません(目安: ${cleaningIntervalDays}日間隔)。`
      );
    }
  }

  if (reasons.length === 0) {
    reasons.push("特に注意すべき記録は見つかりませんでした。");
  }

  return { status, reasons };
}
