import type { Tank } from "@/types/tank";

const MIN_INTERVAL_DAYS = 3;
const MAX_INTERVAL_DAYS = 30;

/** 水槽/ケージ種別ごとの基準清掃間隔(日) */
const BASE_INTERVAL_DAYS: Record<Tank["category"], number> = {
  aquarium: 10,
  cage: 7,
  terrarium: 21,
  other: 14,
};

/**
 * 水槽/ケージのサイズ(水量)・収容生体数から清掃間隔(日)を算出する。
 *
 * 考え方:
 * - 水量が多いほど水質・環境が安定し、汚れが薄まるため間隔を延ばせる
 *   (影響が急激になりすぎないよう平方根で緩やかに効かせる。基準は30L)
 * - 収容している生体数が多いほど汚れやすいため間隔を縮める
 * - 種別(水槽/ケージ/テラリウム/その他)ごとに基準日数を変える
 *   (水槽は水質悪化が早く、テラリウムは乾いた環境で汚れにくい、という前提)
 */
export function calculateCleaningIntervalDays(tank: Tank, creatureCount: number): number {
  const baseDays = BASE_INTERVAL_DAYS[tank.category];
  const volumeLiters = Math.max(tank.volumeLiters, 1);
  const volumeFactor = Math.sqrt(volumeLiters / 30);
  const bioloadFactor = 1 / (1 + creatureCount * 0.25);

  const days = Math.round(baseDays * volumeFactor * bioloadFactor);
  return Math.min(MAX_INTERVAL_DAYS, Math.max(MIN_INTERVAL_DAYS, days));
}
