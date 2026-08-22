/** 小数第2位以降を切り捨て、小数第1位までの数値にする(四捨五入はしない) */
export function truncateToOneDecimal(value: number): number {
  return Math.trunc(value * 10) / 10;
}

/** 常に小数第1位までの文字列("0.0"表記)にする */
export function formatOneDecimal(value: number): string {
  return truncateToOneDecimal(value).toFixed(1);
}
