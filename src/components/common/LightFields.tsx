"use client";

import { LIGHT_TYPE_LABELS, type LightType } from "@/types/tank";

const LIGHT_TYPES = Object.keys(LIGHT_TYPE_LABELS) as LightType[];

interface Props {
  lightTypes: LightType[];
  startTime: string;
  endTime: string;
  onLightTypesChange: (value: LightType[]) => void;
  onStartTimeChange: (value: string) => void;
  onEndTimeChange: (value: string) => void;
}

export default function LightFields({
  lightTypes,
  startTime,
  endTime,
  onLightTypesChange,
  onStartTimeChange,
  onEndTimeChange,
}: Props) {
  const toggleType = (type: LightType) => {
    if (lightTypes.includes(type)) {
      onLightTypesChange(lightTypes.filter((t) => t !== type));
    } else {
      onLightTypesChange([...lightTypes, type]);
    }
  };

  return (
    <div className="flex flex-col gap-2 rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
      <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">ライト(任意)</p>

      <div className="flex flex-wrap gap-3 text-sm">
        {LIGHT_TYPES.map((type) => (
          <label key={type} className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={lightTypes.includes(type)}
              onChange={() => toggleType(type)}
            />
            {LIGHT_TYPE_LABELS[type]}
          </label>
        ))}
      </div>

      {lightTypes.length > 0 && (
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
