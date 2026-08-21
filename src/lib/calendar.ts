const WEEKDAYS_JA = ["日", "月", "火", "水", "木", "金", "土"] as const;

export interface CalendarDay {
  date: Date;
  isoDate: string;
  isCurrentMonth: boolean;
  isToday: boolean;
}

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getWeekdayLabels(): readonly string[] {
  return WEEKDAYS_JA;
}

/** 月グリッド(日曜始まり、前後月の日付で6週分を埋める)を返す */
export function getMonthGrid(year: number, month: number): CalendarDay[] {
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = firstOfMonth.getDay();
  const gridStart = new Date(year, month, 1 - startOffset);

  const today = toIsoDate(new Date());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    const isoDate = toIsoDate(date);
    return {
      date,
      isoDate,
      isCurrentMonth: date.getMonth() === month,
      isToday: isoDate === today,
    };
  });
}
