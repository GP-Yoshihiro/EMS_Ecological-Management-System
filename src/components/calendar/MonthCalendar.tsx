"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { getMonthGrid, getWeekdayLabels, toIsoDate } from "@/lib/calendar";
import { useScheduleEvents } from "@/lib/use-schedule-events";
import { useTanks } from "@/lib/supabase/tanks";
import { useCreatures } from "@/lib/supabase/creatures";
import { useTankEnvironmentRecords } from "@/lib/supabase/tank-environment-records";
import { formatOneDecimal } from "@/lib/decimal";
import type { ScheduleEvent, ScheduleEventType } from "@/types/schedule";
import type { FeedingRecord, CleaningRecord } from "@/types/care-record";

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
  const [addType, setAddType] = useState<ScheduleEventType>("feeding");
  const [addTargetId, setAddTargetId] = useState("");

  const grid = useMemo(() => getMonthGrid(cursor.year, cursor.month), [cursor]);
  const {
    events,
    loading,
    error,
    feedingRecords,
    cleaningRecords,
    upsertFeedingRecord,
    removeFeedingRecord,
    upsertCleaningRecord,
    removeCleaningRecord,
  } = useScheduleEvents(cursor.year, cursor.month);
  const { tanks } = useTanks();
  const { creatures } = useCreatures();
  const { records: environmentRecords } = useTankEnvironmentRecords();
  const eventsByDate = useMemo(() => groupEventsByDate(events), [events]);
  const weekdays = getWeekdayLabels();

  const targetName = (type: ScheduleEventType, targetId: string): string => {
    if (type === "feeding") {
      const creature = creatures.find((c) => c.id === targetId);
      if (!creature) return "(削除済みの生態)";
      return creature.individualName
        ? `${creature.speciesName}(${creature.individualName})`
        : creature.speciesName;
    }
    const tank = tanks.find((t) => t.id === targetId);
    return tank ? tank.name : "(削除済みの水槽/ケージ)";
  };

  const findRecord = (event: ScheduleEvent): FeedingRecord | CleaningRecord | undefined => {
    if (!event.recordId) return undefined;
    if (event.type === "feeding") {
      return feedingRecords.find((record) => record.id === event.recordId);
    }
    return cleaningRecords.find((record) => record.id === event.recordId);
  };

  const handleRecord = (event: ScheduleEvent) => {
    const now = new Date().toISOString();
    if (event.type === "feeding") {
      upsertFeedingRecord({
        id: crypto.randomUUID(),
        creatureId: event.targetId,
        date: event.date,
        note: "",
        createdAt: now,
      });
    } else {
      upsertCleaningRecord({
        id: crypto.randomUUID(),
        tankId: event.targetId,
        date: event.date,
        note: "",
        createdAt: now,
      });
    }
  };

  const handleCancel = (event: ScheduleEvent, recordId: string) => {
    if (event.type === "feeding") {
      removeFeedingRecord(recordId);
    } else {
      removeCleaningRecord(recordId);
    }
  };

  const handleCancelAdHoc = (type: ScheduleEventType, recordId: string) => {
    if (type === "feeding") {
      removeFeedingRecord(recordId);
    } else {
      removeCleaningRecord(recordId);
    }
  };

  const handleAddRecord = () => {
    if (!selectedDate || !addTargetId) return;
    const now = new Date().toISOString();
    if (addType === "feeding") {
      upsertFeedingRecord({
        id: crypto.randomUUID(),
        creatureId: addTargetId,
        date: selectedDate,
        note: "",
        createdAt: now,
      });
    } else {
      upsertCleaningRecord({
        id: crypto.randomUUID(),
        tankId: addTargetId,
        date: selectedDate,
        note: "",
        createdAt: now,
      });
    }
    setAddTargetId("");
  };

  const goToMonth = (offset: number) => {
    setCursor(({ year, month }) => {
      const next = new Date(year, month + offset, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
    setSelectedDate(null);
  };

  const selectedEvents = selectedDate ? eventsByDate.get(selectedDate) ?? [] : [];
  const addOptions = addType === "feeding" ? creatures : tanks;

  const todaysEnvironmentRecords = selectedDate
    ? environmentRecords
        .filter((record) => toIsoDate(new Date(record.recordedAt)) === selectedDate)
        .sort((a, b) => a.recordedAt.localeCompare(b.recordedAt))
    : [];
  const environmentTankName = (tankId: string) =>
    tanks.find((tank) => tank.id === tankId)?.name ?? "(削除済みの水槽/ケージ)";

  const predictedRecordIds = new Set(
    selectedEvents.map((event) => findRecord(event)?.id).filter((id): id is string => !!id)
  );
  const adHocRecords = selectedDate
    ? [
        ...feedingRecords
          .filter((record) => record.date === selectedDate && !predictedRecordIds.has(record.id))
          .map((record) => ({ type: "feeding" as const, id: record.id, targetId: record.creatureId })),
        ...cleaningRecords
          .filter((record) => record.date === selectedDate && !predictedRecordIds.has(record.id))
          .map((record) => ({ type: "cleaning" as const, id: record.id, targetId: record.tankId })),
      ]
    : [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Link
          href="/environment-records/new"
          className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
        >
          環境記録を追加
        </Link>
      </div>

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

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">記録の保存に失敗しました: {error}</p>
      )}

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
          {selectedEvents.map((event) => {
            const record = findRecord(event);
            return (
              <li key={event.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${EVENT_STYLES[event.type].badge}`}
                  >
                    {EVENT_STYLES[event.type].label}
                  </span>
                  <span className="text-zinc-700 dark:text-zinc-300">{event.targetName}</span>
                </span>
                {record ? (
                  <span className="flex items-center gap-2">
                    <span className="text-xs text-emerald-600 dark:text-emerald-400">
                      記録済み
                      {record.date !== event.date && `(${record.date}に実施)`}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCancel(event, record.id)}
                      className="rounded-md border border-zinc-300 px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-900"
                    >
                      取消
                    </button>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleRecord(event)}
                    className="rounded-md border border-zinc-300 px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
                  >
                    実施を記録する
                  </button>
                )}
              </li>
            );
          })}
        </ul>

        {selectedDate && adHocRecords.length > 0 && (
          <div className="mt-4 border-t border-zinc-200 pt-3 dark:border-zinc-800">
            <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              この日の記録(予定日以外に実施したもの)
            </p>
            <ul className="mt-2 flex flex-col gap-2">
              {adHocRecords.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${EVENT_STYLES[item.type].badge}`}
                    >
                      {EVENT_STYLES[item.type].label}
                    </span>
                    <span className="text-zinc-700 dark:text-zinc-300">
                      {targetName(item.type, item.targetId)}
                    </span>
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="text-xs text-emerald-600 dark:text-emerald-400">記録済み</span>
                    <button
                      type="button"
                      onClick={() => handleCancelAdHoc(item.type, item.id)}
                      className="rounded-md border border-zinc-300 px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-900"
                    >
                      取消
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {selectedDate && todaysEnvironmentRecords.length > 0 && (
          <div className="mt-4 border-t border-zinc-200 pt-3 dark:border-zinc-800">
            <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">今日の記録</p>
            <ul className="mt-2 flex flex-col gap-2">
              {todaysEnvironmentRecords.map((record) => (
                <li key={record.id} className="text-sm text-zinc-700 dark:text-zinc-300">
                  <span className="font-medium">
                    {new Date(record.recordedAt).toLocaleTimeString("ja-JP", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>{" "}
                  {environmentTankName(record.tankId)} / 気温
                  {record.ambientTemperatureC !== null ? formatOneDecimal(record.ambientTemperatureC) : "-"}
                  ℃ / 湿度
                  {record.humidityPercent !== null ? formatOneDecimal(record.humidityPercent) : "-"}
                  % / 水温
                  {record.waterTemperatureC !== null ? formatOneDecimal(record.waterTemperatureC) : "-"}
                  ℃ / 綺麗度{record.cleanlinessPercent}%
                </li>
              ))}
            </ul>
          </div>
        )}

        {selectedDate && (
          <div className="mt-4 flex flex-col gap-2 border-t border-zinc-200 pt-3 dark:border-zinc-800">
            <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              この日に記録を追加(早め・遅めの実施にも対応)
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={addType}
                onChange={(event) => {
                  setAddType(event.target.value as ScheduleEventType);
                  setAddTargetId("");
                }}
                className="rounded-md border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              >
                <option value="feeding">給餌</option>
                <option value="cleaning">清掃</option>
              </select>
              <select
                value={addTargetId}
                onChange={(event) => setAddTargetId(event.target.value)}
                className="rounded-md border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              >
                <option value="">
                  {addType === "feeding" ? "生態を選択" : "水槽/ケージを選択"}
                </option>
                {addOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {"speciesName" in option ? option.speciesName : option.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddRecord}
                disabled={!addTargetId}
                className="rounded-md border border-zinc-300 px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
              >
                記録する
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
