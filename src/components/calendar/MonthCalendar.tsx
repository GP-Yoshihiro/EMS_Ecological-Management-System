"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { getMonthGrid, getWeekdayLabels } from "@/lib/calendar";
import { useScheduleEvents } from "@/lib/use-schedule-events";
import type { ScheduleEvent, ScheduleEventType } from "@/types/schedule";

const EVENT_STYLES: Record<ScheduleEventType, { label: string; dot: string; badge: string }> = {
  feeding: {
    label: "給餌",
    dot: "bg-sky-500",
    badge: "bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
  },
  cleaning: {
    label: "清掃",
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  },
};

function groupEventsByDate(events: ScheduleEvent[]): Map<string, ScheduleEvent[]> {
  const map = new Map<string, ScheduleEvent[]>();
  for (const event of events) {
    const list = map.get(event.date) ?? [];
    list.push(event);
    map.set(event.date, list);
  }
  return map;
}

export default function MonthCalendar() {
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const grid = useMemo(() => getMonthGrid(cursor.year, cursor.month), [cursor]);
  const { events, loading } = useScheduleEvents(cursor.year, cursor.month);
  const eventsByDate = useMemo(() => groupEventsByDate(events), [events]);
  const weekdays = getWeekdayLabels();

  const goToMonth = (offset: number) => {
    setCursor(({ year, month }) => {
      const next = new Date(year, month + offset, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
    setSelectedDate(null);
  };

  const selectedEvents = selectedDate ? eventsByDate.get(selectedDate) ?? [] : [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => goToMonth(-1)}
          className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
        >
          前の月
        </button>
        <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
          {cursor.year}年 {cursor.month + 1}月
        </h2>
        <button
          type="button"
          onClick={() => goToMonth(1)}
          className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
        >
          次の月
        </button>
      </div>

      <div className="flex gap-4 text-sm text-zinc-600 dark:text-zinc-400">
        {(Object.keys(EVENT_STYLES) as ScheduleEventType[]).map((type) => (
          <span key={type} className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${EVENT_STYLES[type].dot}`} />
            {EVENT_STYLES[type].label}
          </span>
        ))}
      </div>

      {loading && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">読み込み中...</p>
      )}
      {!loading && events.length === 0 && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          給餌日・清掃日を表示するには、まず{" "}
          <Link href="/tanks" className="underline">
            水槽/ケージ
          </Link>{" "}
          と{" "}
          <Link href="/creatures" className="underline">
            生態
          </Link>{" "}
          を登録してください。
        </p>
      )}

      <div className="grid grid-cols-7 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
        {weekdays.map((weekday) => (
          <div
            key={weekday}
            className="border-b border-zinc-200 bg-zinc-50 py-2 text-center text-xs font-medium text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
          >
            {weekday}
          </div>
        ))}

        {grid.map((day) => {
          const dayEvents = eventsByDate.get(day.isoDate) ?? [];
          const isSelected = selectedDate === day.isoDate;

          return (
            <button
              type="button"
              key={day.isoDate}
              onClick={() => setSelectedDate(day.isoDate)}
              className={`flex min-h-20 flex-col gap-1 border-b border-r border-zinc-200 p-2 text-left last:border-r-0 dark:border-zinc-800 ${
                day.isCurrentMonth
                  ? "bg-white dark:bg-black"
                  : "bg-zinc-50 text-zinc-400 dark:bg-zinc-950 dark:text-zinc-600"
              } ${isSelected ? "ring-2 ring-inset ring-sky-500" : ""}`}
            >
              <span
                className={`text-xs ${
                  day.isToday
                    ? "flex h-5 w-5 items-center justify-center rounded-full bg-zinc-950 font-semibold text-white dark:bg-zinc-50 dark:text-zinc-950"
                    : ""
                }`}
              >
                {day.date.getDate()}
              </span>
              <div className="flex flex-wrap gap-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <span
                    key={event.id}
                    className={`h-1.5 w-1.5 rounded-full ${EVENT_STYLES[event.type].dot}`}
                  />
                ))}
                {dayEvents.length > 3 && (
                  <span className="text-[10px] text-zinc-500">+{dayEvents.length - 3}</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <h3 className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
          {selectedDate ?? "日付を選択してください"}
        </h3>
        {selectedDate && selectedEvents.length === 0 && (
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">予定はありません。</p>
        )}
        <ul className="mt-2 flex flex-col gap-2">
          {selectedEvents.map((event) => (
            <li key={event.id} className="flex items-center gap-2 text-sm">
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${EVENT_STYLES[event.type].badge}`}
              >
                {EVENT_STYLES[event.type].label}
              </span>
              <span className="text-zinc-700 dark:text-zinc-300">{event.targetName}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
