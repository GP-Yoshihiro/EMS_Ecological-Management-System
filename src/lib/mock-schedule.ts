import type { ScheduleEvent } from "@/types/schedule";

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * 生態・水槽データの保存機能(ステップ7・8)が実装されるまでの仮データ。
 * 給餌は2日おき、清掃は7日おきというサンプルの周期で生成する。
 */
export function getMockScheduleEvents(year: number, month: number): ScheduleEvent[] {
  const targets = [
    { name: "60cm水槽(熱帯魚)", feedingIntervalDays: 1, cleaningIntervalDays: 7 },
    { name: "テラリウム(ヒョウモントカゲモドキ)", feedingIntervalDays: 3, cleaningIntervalDays: 14 },
    { name: "昆虫ケース(カブトムシ)", feedingIntervalDays: 2, cleaningIntervalDays: 10 },
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const events: ScheduleEvent[] = [];

  for (const target of targets) {
    for (let day = 1; day <= daysInMonth; day += target.feedingIntervalDays) {
      const date = new Date(year, month, day);
      events.push({
        id: `feeding-${target.name}-${toIsoDate(date)}`,
        date: toIsoDate(date),
        type: "feeding",
        title: "給餌",
        targetName: target.name,
      });
    }
    for (let day = 1; day <= daysInMonth; day += target.cleaningIntervalDays) {
      const date = new Date(year, month, day);
      events.push({
        id: `cleaning-${target.name}-${toIsoDate(date)}`,
        date: toIsoDate(date),
        type: "cleaning",
        title: "清掃",
        targetName: target.name,
      });
    }
  }

  return events;
}
