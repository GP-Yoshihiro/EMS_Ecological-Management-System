"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useTanks } from "@/lib/supabase/tanks";
import SortFilterControls from "@/components/common/SortFilterControls";
import { sortItems, type SortDirection, type SortMode } from "@/lib/sort";
import { moveItem } from "@/lib/reorder";
import { TANK_CATEGORY_LABELS, type Tank, type TankCategory } from "@/types/tank";
import { formatOneDecimal } from "@/lib/decimal";
import TankIcon from "@/components/common/TankIcon";

const CATEGORIES = Object.keys(TANK_CATEGORY_LABELS) as TankCategory[];

export default function TankList() {
  const { tanks, loading, error } = useTanks();
  const { upsertTank } = useTanks();
  const [sortMode, setSortMode] = useState<SortMode>("kana");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [draftOrder, setDraftOrder] = useState<Tank[] | null>(null);
  const draggedIndexRef = useRef<number | null>(null);

  const canReorder = sortMode === "original" && sortDirection === "asc" && categoryFilter === "all";

  const sortedTanks = useMemo(() => {
    const filtered =
      categoryFilter === "all" ? tanks : tanks.filter((tank) => tank.category === categoryFilter);
    return sortItems(filtered, sortMode, sortDirection, (tank) => tank.name, (tank) => tank.sortOrder);
  }, [tanks, sortMode, sortDirection, categoryFilter]);

  const displayedTanks = draftOrder ?? sortedTanks;

  const handleDragStart = (index: number) => () => {
    draggedIndexRef.current = index;
    setDraftOrder(sortedTanks);
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
        draftOrder.map((tank, index) =>
          tank.sortOrder === index ? Promise.resolve(true) : upsertTank({ ...tank, sortOrder: index })
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
          登録済みの水槽/ケージ({tanks.length})
        </h2>
        <Link
          href="/tanks/new"
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
      {loading && tanks.length === 0 && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">読み込み中...</p>
      )}
      {!loading && tanks.length === 0 && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          まだ登録がありません。右上の「+ 追加」から登録してください。
        </p>
      )}
      {tanks.length > 0 && (
        <SortFilterControls
          sortMode={sortMode}
          onSortModeChange={setSortMode}
          sortDirection={sortDirection}
          onSortDirectionChange={setSortDirection}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          categoryOptions={CATEGORIES.map((category) => ({
            value: category,
            label: TANK_CATEGORY_LABELS[category],
          }))}
        />
      )}
      {tanks.length > 0 && displayedTanks.length === 0 && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">該当する水槽/ケージがありません。</p>
      )}
      <ul className="flex flex-col gap-3">
        {displayedTanks.map((tank, index) => (
          <li
            key={tank.id}
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
              <TankIcon shape={tank.shape} category={tank.category} size={40} />
              <div>
                <p className="font-medium text-zinc-950 dark:text-zinc-50">
                  {tank.name}
                  <span className="ml-2 rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
                    {TANK_CATEGORY_LABELS[tank.category]}
                  </span>
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {formatOneDecimal(tank.widthCm)}×{formatOneDecimal(tank.depthCm)}×
                  {formatOneDecimal(tank.heightCm)}cm / {formatOneDecimal(tank.volumeLiters)}L
                  {tank.location && ` / ${tank.location}`}
                </p>
              </div>
            </div>
            <Link
              href={`/tanks/${tank.id}`}
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
