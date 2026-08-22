"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useCreatures } from "@/lib/supabase/creatures";
import { useTanks } from "@/lib/supabase/tanks";
import SortFilterControls from "@/components/common/SortFilterControls";
import { sortItems, type SortDirection, type SortMode } from "@/lib/sort";
import { moveItem } from "@/lib/reorder";
import { CREATURE_CATEGORY_LABELS, type Creature, type CreatureCategory } from "@/types/creature";
import CreatureIcon from "@/components/common/CreatureIcon";

const CATEGORIES = Object.keys(CREATURE_CATEGORY_LABELS) as CreatureCategory[];

export default function CreatureList() {
  const { creatures, loading, error, upsertCreature } = useCreatures();
  const { tanks } = useTanks();
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
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-medium text-zinc-950 dark:text-zinc-50">
          登録済みの生態({creatures.length})
        </h2>
        <Link
          href="/creatures/new"
          className="shrink-0 rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
        >
          + 追加
        </Link>
      </div>

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
          まだ登録がありません。右上の「+ 追加」から登録してください。
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
            className={`flex items-start justify-between gap-2 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800 ${
              canReorder ? "cursor-grab active:cursor-grabbing" : ""
            }`}
          >
            <div className="flex gap-2">
              {canReorder && (
                <span className="mt-0.5 shrink-0 select-none text-zinc-400 dark:text-zinc-600" aria-hidden>
                  ⠿
                </span>
              )}
              <CreatureIcon category={creature.category} size={40} />
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
              </div>
            </div>
            <Link
              href={`/creatures/${creature.id}`}
              className="shrink-0 rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              詳細
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
