"use client";

import { useMemo, useRef, useState } from "react";
import { useCreatures } from "@/lib/supabase/creatures";
import { useTanks } from "@/lib/supabase/tanks";
import CreatureLogSection from "./CreatureLogSection";
import SortFilterControls from "@/components/common/SortFilterControls";
import CareScheduleFields from "@/components/common/CareScheduleFields";
import { sortItems, type SortDirection, type SortMode } from "@/lib/sort";
import { moveItem } from "@/lib/reorder";
import {
  CREATURE_CATEGORY_LABELS,
  type Creature,
  type CreatureCategory,
} from "@/types/creature";
import { DEFAULT_CARE_SCHEDULE, type CareScheduleUnit } from "@/types/care-schedule";

const CATEGORIES = Object.keys(CREATURE_CATEGORY_LABELS) as CreatureCategory[];

const emptyForm = {
  category: "fish" as CreatureCategory,
  speciesName: "",
  individualName: "",
  introducedAt: "",
  tankId: "",
  notes: "",
  feedingScheduleCount: "",
  feedingScheduleUnit: DEFAULT_CARE_SCHEDULE.unit,
  feedingScheduleWeekdays: [] as number[],
};

export default function CreatureManager() {
  const { creatures, loading, error, upsertCreature, removeCreature } = useCreatures();
  const { tanks } = useTanks();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [sortMode, setSortMode] = useState<SortMode>("kana");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [draftOrder, setDraftOrder] = useState<Creature[] | null>(null);
  const draggedIndexRef = useRef<number | null>(null);

  const canReorder = sortMode === "original" && sortDirection === "asc" && categoryFilter === "all";

  const sortedCreatures = useMemo(() => {
    const filtered =
      categoryFilter === "all"
        ? creatures
        : creatures.filter((creature) => creature.category === categoryFilter);
    return sortItems(
      filtered,
      sortMode,
      sortDirection,
      (creature) => creature.speciesName,
      (creature) => creature.sortOrder
    );
  }, [creatures, sortMode, sortDirection, categoryFilter]);

  const displayedCreatures = draftOrder ?? sortedCreatures;

  const startEdit = (creature: Creature) => {
    setEditingId(creature.id);
    setForm({
      category: creature.category,
      speciesName: creature.speciesName,
      individualName: creature.individualName,
      introducedAt: creature.introducedAt,
      tankId: creature.tankId ?? "",
      notes: creature.notes,
      feedingScheduleCount:
        creature.feedingSchedule.count === null ? "" : String(creature.feedingSchedule.count),
      feedingScheduleUnit: creature.feedingSchedule.unit,
      feedingScheduleWeekdays: creature.feedingSchedule.weekdays,
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const speciesName = form.speciesName.trim();
    if (!speciesName) return;

    const existing = editingId ? creatures.find((c) => c.id === editingId) : undefined;
    const nextSortOrder =
      existing?.sortOrder ??
      (creatures.length === 0 ? 0 : Math.max(...creatures.map((c) => c.sortOrder)) + 1);

    const creature: Creature = {
      id: editingId ?? crypto.randomUUID(),
      category: form.category,
      speciesName,
      individualName: form.individualName.trim(),
      introducedAt: form.introducedAt,
      tankId: form.tankId || null,
      notes: form.notes.trim(),
      sortOrder: nextSortOrder,
      feedingSchedule: {
        count: form.feedingScheduleCount ? Number(form.feedingScheduleCount) : null,
        unit: form.feedingScheduleUnit,
        weekdays: form.feedingScheduleWeekdays,
      },
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };

    const success = await upsertCreature(creature);
    if (success) {
      resetForm();
    }
  };

  const tankName = (tankId: string | null) =>
    tanks.find((tank) => tank.id === tankId)?.name ?? "未割り当て";

  const handleDragStart = (index: number) => () => {
    draggedIndexRef.current = index;
    setDraftOrder(sortedCreatures);
  };

  const handleDragOver = (index: number) => (event: React.DragEvent) => {
    event.preventDefault();
    const from = draggedIndexRef.current;
    if (from === null || from === index) return;
    setDraftOrder((prev) => {
      if (!prev) return prev;
      const next = moveItem(prev, from, index);
      draggedIndexRef.current = index;
      return next;
    });
  };

  const handleDragEnd = async () => {
    if (draftOrder) {
      await Promise.all(
        draftOrder.map((creature, index) =>
          creature.sortOrder === index
            ? Promise.resolve(true)
            : upsertCreature({ ...creature, sortOrder: index })
        )
      );
    }
    setDraftOrder(null);
    draggedIndexRef.current = null;
  };

  return (
    <div className="flex flex-col gap-8">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rounded-xl border border-zinc-200 p-5 dark:border-zinc-800"
      >
        <h2 className="text-lg font-medium text-zinc-950 dark:text-zinc-50">
          {editingId ? "生態を編集" : "生態を追加"}
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            分類
            <select
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({ ...f, category: e.target.value as CreatureCategory }))
              }
              className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            >
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {CREATURE_CATEGORY_LABELS[category]}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            種名
            <input
              required
              value={form.speciesName}
              onChange={(e) => setForm((f) => ({ ...f, speciesName: e.target.value }))}
              className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
              placeholder="例: ヒョウモントカゲモドキ"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            個体名
            <input
              value={form.individualName}
              onChange={(e) => setForm((f) => ({ ...f, individualName: e.target.value }))}
              className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
              placeholder="例: モモ"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            導入日
            <input
              type="date"
              value={form.introducedAt}
              onChange={(e) => setForm((f) => ({ ...f, introducedAt: e.target.value }))}
              className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm sm:col-span-2">
            所属する水槽/ケージ
            <select
              value={form.tankId}
              onChange={(e) => setForm((f) => ({ ...f, tankId: e.target.value }))}
              className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            >
              <option value="">未割り当て</option>
              {tanks.map((tank) => (
                <option key={tank.id} value={tank.id}>
                  {tank.name}
                </option>
              ))}
            </select>
          </label>

          <CareScheduleFields
            label="給餌"
            count={form.feedingScheduleCount}
            unit={form.feedingScheduleUnit}
            weekdays={form.feedingScheduleWeekdays}
            onCountChange={(value) => setForm((f) => ({ ...f, feedingScheduleCount: value }))}
            onUnitChange={(value: CareScheduleUnit) =>
              setForm((f) => ({ ...f, feedingScheduleUnit: value }))
            }
            onWeekdaysChange={(value) => setForm((f) => ({ ...f, feedingScheduleWeekdays: value }))}
          />

          <label className="flex flex-col gap-1 text-sm sm:col-span-2">
            特記事項・成長記録・体調メモ
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={3}
              className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            {editingId ? "更新する" : "追加する"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-full border border-zinc-300 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              キャンセル
            </button>
          )}
        </div>
      </form>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-medium text-zinc-950 dark:text-zinc-50">
          登録済みの生態({creatures.length})
        </h2>
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">
            データの取得/更新に失敗しました: {error}
          </p>
        )}
        {loading && creatures.length === 0 && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">読み込み中...</p>
        )}
        {!loading && creatures.length === 0 && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            まだ登録がありません。上のフォームから追加してください。
          </p>
        )}
        {creatures.length > 0 && (
          <SortFilterControls
            sortMode={sortMode}
            onSortModeChange={setSortMode}
            sortDirection={sortDirection}
            onSortDirectionChange={setSortDirection}
            categoryFilter={categoryFilter}
            onCategoryFilterChange={setCategoryFilter}
            categoryOptions={CATEGORIES.map((category) => ({
              value: category,
              label: CREATURE_CATEGORY_LABELS[category],
            }))}
          />
        )}
        {creatures.length > 0 && displayedCreatures.length === 0 && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">該当する生態がありません。</p>
        )}
        <ul className="flex flex-col gap-3">
          {displayedCreatures.map((creature, index) => (
            <li
              key={creature.id}
              draggable={canReorder}
              onDragStart={handleDragStart(index)}
              onDragOver={handleDragOver(index)}
              onDragEnd={handleDragEnd}
              className={`flex flex-col rounded-xl border border-zinc-200 p-4 dark:border-zinc-800 ${
                canReorder ? "cursor-grab active:cursor-grabbing" : ""
              }`}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex gap-2">
                  {canReorder && (
                    <span
                      className="mt-0.5 shrink-0 select-none text-zinc-400 dark:text-zinc-600"
                      aria-hidden
                    >
                      ⠿
                    </span>
                  )}
                  <div>
                    <p className="font-medium text-zinc-950 dark:text-zinc-50">
                      {creature.speciesName}
                      {creature.individualName && `(${creature.individualName})`}
                      <span className="ml-2 rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
                        {CREATURE_CATEGORY_LABELS[creature.category]}
                      </span>
                    </p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {creature.introducedAt && `導入日: ${creature.introducedAt} / `}
                      所属: {tankName(creature.tankId)}
                    </p>
                    {creature.notes && (
                      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-500">
                        {creature.notes}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(creature)}
                    className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
                  >
                    編集
                  </button>
                  <button
                    type="button"
                    onClick={() => removeCreature(creature.id)}
                    className="rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
                  >
                    削除
                  </button>
                </div>
              </div>
              <CreatureLogSection creatureId={creature.id} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
