"use client";

interface Props {
  label: string;
  enabled: boolean;
  startTime: string;
  endTime: string;
  onEnabledChange: (value: boolean) => void;
  onStartTimeChange: (value: string) => void;
  onEndTimeChange: (value: string) => void;
}

export default function TimedEquipmentFields({
  label,
  enabled,
  startTime,
  endTime,
  onEnabledChange,
  onStartTimeChange,
  onEndTimeChange,
}: Props) {
  return (
    <div className="flex flex-col gap-2 rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
      <label className="flex items-center gap-2 text-sm font-medium text-zinc-950 dark:text-zinc-50">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(event) => onEnabledChange(event.target.checked)}
        />
        {label}を使用する
      </label>

      {enabled && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-zinc-600 dark:text-zinc-400">使用時間帯(24時間表記)</span>
          <input
            type="time"
            value={startTime}
            onChange={(event) => onStartTimeChange(event.target.value)}
            className="rounded-md border border-zinc-300 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900"
          />
          <span className="text-zinc-500">〜</span>
          <input
            type="time"
            value={endTime}
            onChange={(event) => onEndTimeChange(event.target.value)}
            className="rounded-md border border-zinc-300 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
      )}
    </div>
  );
}
