import type { TankEnvironmentRecord } from "@/types/tank-environment-record";

export type EnvironmentStatus = "good" | "watch" | "alert";

export interface EnvironmentAssessment {
  status: EnvironmentStatus;
  reasons: string[];
}

/** 良好とみなす範囲。外れるほど段階的に評価を悪化させる(健康管理AIと同じルールベース方針) */
const WATER_TEMP_GOOD: [number, number] = [20, 28];
const WATER_TEMP_ALERT: [number, number] = [15, 32];
const AMBIENT_TEMP_GOOD: [number, number] = [18, 28];
const AMBIENT_TEMP_ALERT: [number, number] = [10, 35];
const HUMIDITY_GOOD: [number, number] = [40, 70];
const HUMIDITY_ALERT: [number, number] = [20, 90];
const CLEANLINESS_GOOD = 70;
const CLEANLINESS_ALERT = 40;
/** 最新記録がこの日数より古い場合は「情報が古い」として要観察にする */
const STALE_RECORD_DAYS = 7;

function daysSince(dateStr: string): number {
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diff / 86_400_000);
}

function escalate(current: EnvironmentStatus, next: EnvironmentStatus): EnvironmentStatus {
  const order: EnvironmentStatus[] = ["good", "watch", "alert"];
  return order.indexOf(next) > order.indexOf(current) ? next : current;
}

function assessRange(
  value: number,
  goodRange: [number, number],
  alertRange: [number, number],
  label: string,
  unit: string
): { status: EnvironmentStatus; reason?: string } {
  if (value >= goodRange[0] && value <= goodRange[1]) {
    return { status: "good" };
  }
  if (value < alertRange[0] || value > alertRange[1]) {
    return {
      status: "alert",
      reason: `${label}が${value}${unit}で適正範囲(${alertRange[0]}〜${alertRange[1]}${unit})から外れています。`,
    };
  }
  return {
    status: "watch",
    reason: `${label}が${value}${unit}で目安(${goodRange[0]}〜${goodRange[1]}${unit})からやや外れています。`,
  };
}

/**
 * 水槽/ケージの環境記録から、ルールベースで環境状態を評価する。
 * 気温・湿度・水温・綺麗度の複合判定(ステップ16で決定した方針)。
 * 外部AI APIは使わず、health-analysis.tsと同様のルールベース方式を用いる。
 */
export function assessTankEnvironment(
  latestRecord: TankEnvironmentRecord | undefined
): EnvironmentAssessment {
  const reasons: string[] = [];
  let status: EnvironmentStatus = "good";

  if (!latestRecord) {
    return { status: "watch", reasons: ["まだ環境記録がありません。記録を追加してください。"] };
  }

  const cleanliness = assessRange(
    latestRecord.cleanlinessPercent,
    [CLEANLINESS_GOOD, 100],
    [CLEANLINESS_ALERT, 100],
    "綺麗度",
    "%"
  );
  status = escalate(status, cleanliness.status);
  if (cleanliness.reason) reasons.push(cleanliness.reason);

  if (latestRecord.waterTemperatureC !== null) {
    const result = assessRange(
      latestRecord.waterTemperatureC,
      WATER_TEMP_GOOD,
      WATER_TEMP_ALERT,
      "水温",
      "℃"
    );
    status = escalate(status, result.status);
    if (result.reason) reasons.push(result.reason);
  }

  if (latestRecord.ambientTemperatureC !== null) {
    const result = assessRange(
      latestRecord.ambientTemperatureC,
      AMBIENT_TEMP_GOOD,
      AMBIENT_TEMP_ALERT,
      "気温",
      "℃"
    );
    status = escalate(status, result.status);
    if (result.reason) reasons.push(result.reason);
  }

  if (latestRecord.humidityPercent !== null) {
    const result = assessRange(
      latestRecord.humidityPercent,
      HUMIDITY_GOOD,
      HUMIDITY_ALERT,
      "湿度",
      "%"
    );
    status = escalate(status, result.status);
    if (result.reason) reasons.push(result.reason);
  }

  const staleDays = daysSince(latestRecord.recordedAt);
  if (staleDays > STALE_RECORD_DAYS) {
    status = escalate(status, "watch");
    reasons.push(`最新の記録から${staleDays}日経過しています。最新の状態を記録してください。`);
  }

  if (reasons.length === 0) {
    reasons.push("特に注意すべき項目は見つかりませんでした。");
  }

  return { status, reasons };
}
