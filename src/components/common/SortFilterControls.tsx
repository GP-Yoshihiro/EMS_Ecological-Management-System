"use client";

import type { SortDirection, SortMode } from "@/lib/sort";

interface CategoryOption {
  value: string;
  label: string;
}

interface Props {
  sortMode: SortMode;
  onSortModeChange: (value: SortMode) => void;
  sortDirection: SortDirection;
  onSortDirectionChange: (value: SortDirection) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  categoryOptions: CategoryOption[];
}

function SegmentedButton<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex overflow-hidden rounded-md border border-zinc-300 dark:border-zinc-700">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`px-2.5 py-1 text-sm ${
            value === option.value
              ? "bg-zinc-950 text-white dark:bg-zinc-50 dark:text-zinc-950"
              : "bg-white text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export default function SortFilterControls({
  sortMode,
  onSortModeChange,
  sortDirection,
  onSortDirectionChange,
  categoryFilter,
  onCategoryFilterChange,
  categoryOptions,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-700 dark:text-zinc-300">
      <span className="text-zinc-500 dark:text-zinc-400">並び替え:</span>
      <SegmentedButton
        value={sortMode}
        onChange={onSortModeChange}
        options={[
          { value: "kana", label: "五十音" },
          { value: "original", label: "オリジナル" },
        ]}
      />
      <SegmentedButton
        value={sortDirection}
        onChange={onSortDirectionChange}
        options={[
          { value: "asc", label: "昇順" },
          { value: "desc", label: "降順" },
        ]}
      />

      <label className="flex items-center gap-2">
        種類で絞り込み
        <select
          value={categoryFilter}
          onChange={(event) => onCategoryFilterChange(event.target.value)}
          className="rounded-md border border-zinc-300 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900"
        >
          <option value="all">すべて</option>
          {categoryOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      {sortMode === "original" && (
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          {sortDirection === "asc" && categoryFilter === "all"
            ? "⠿ をドラッグすると順番を入れ替えられます。"
            : "ドラッグでの並び替えは「オリジナル」「昇順」「すべて」の組み合わせでのみ行えます。"}
        </span>
      )}
    </div>
  );
}
