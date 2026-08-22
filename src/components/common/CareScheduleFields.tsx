"use client";

import { CARE_SCHEDULE_UNIT_LABELS, WEEKDAY_LABELS, type CareScheduleUnit } from "@/types/care-schedule";

interface Props {
  label: string;
  count: string;
  unit: CareScheduleUnit;
  weekdays: number[];
  onCountChange: (value: string) => void;
  onUnitChange: (value: CareScheduleUnit) => void;
  onWeekdaysChange: (value: number[]) => void;
}

const UNITS = Object.keys(CARE_SCHEDULE_UNIT_LABELS) as CareScheduleUnit[];

export default function CareScheduleFields({
  label,
  count,
  unit,
  weekdays,
  onCountChange,
  onUnitChange,
  onWeekdaysChange,
}: Props) {
  const toggleWeekday = (day: number) => {
    if (weekdays.includes(day)) {
      onWeekdaysChange(weekdays.filter((d) => d !== day));
    } else {
      onWeekdaysChange([...weekdays, day].sort((a, b) => a - b));
    }
  };

  return (
    <div className="flex flex-col gap-2 rounded-md border border-zinc-200 p-3 dark:border-zinc-800 sm:col-span-2">
      <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
        {label}スケジュール(任意・手動設定)
      </p>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <input
          type="number"
          min="1"
          value={count}
          onChange={(event) => onCountChange(event.target.value)}
          placeholder="例: 3"
          className="w-20 rounded-md border border-zinc-300 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900"
        />
        <span className="text-zinc-600 dark:text-zinc-400">回 /</span>
        <select
          value={unit}
          onChange={(event) => onUnitChange(event.target.value as CareScheduleUnit)}
          className="rounded-md border border-zinc-300 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900"
        >
          {UNITS.map((u) => (
            <option key={u} value={u}>
              {CARE_SCHEDULE_UNIT_LABELS[u]}
            </option>
          ))}
        </select>
      </div>

      {unit === "week" && (
        <div className="flex flex-wrap gap-3 text-sm">
          {WEEKDAY_LABELS.map((wd, index) => (
            <label key={wd} className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={weekdays.includes(index)}
                onChange={() => toggleWeekday(index)}
              />
              {wd}
            </label>
          ))}
        </div>
      )}

      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        未設定の場合は自動算出した頻度を使用します。曜日を選択した場合は回数より曜日指定が優先されます。
      </p>
    </div>
  );
}
