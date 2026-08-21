"use client";

import { useState } from "react";
import { useTanks } from "@/lib/supabase/tanks";
import {
  TANK_CATEGORY_LABELS,
  type Tank,
  type TankCategory,
} from "@/types/tank";

const CATEGORIES = Object.keys(TANK_CATEGORY_LABELS) as TankCategory[];

const emptyForm = {
  name: "",
  category: "aquarium" as TankCategory,
  widthCm: "",
  depthCm: "",
  heightCm: "",
  volumeLiters: "",
  location: "",
  layoutNotes: "",
};

export default function TankManager() {
  const { tanks, loading, error, upsertTank, removeTank } = useTanks();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const startEdit = (tank: Tank) => {
    setEditingId(tank.id);
    setForm({
      name: tank.name,
      category: tank.category,
      widthCm: String(tank.widthCm),
      depthCm: String(tank.depthCm),
      heightCm: String(tank.heightCm),
      volumeLiters: String(tank.volumeLiters),
      location: tank.location,
      layoutNotes: tank.layoutNotes,
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = form.name.trim();
    if (!name) return;

    const tank: Tank = {
      id: editingId ?? crypto.randomUUID(),
      name,
      category: form.category,
      widthCm: Number(form.widthCm) || 0,
      depthCm: Number(form.depthCm) || 0,
      heightCm: Number(form.heightCm) || 0,
      volumeLiters: Number(form.volumeLiters) || 0,
      location: form.location.trim(),
      layoutNotes: form.layoutNotes.trim(),
      createdAt: editingId
        ? tanks.find((t) => t.id === editingId)?.createdAt ?? new Date().toISOString()
        : new Date().toISOString(),
    };

    upsertTank(tank);
    resetForm();
  };

  return (
    <div className="flex flex-col gap-8">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rounded-xl border border-zinc-200 p-5 dark:border-zinc-800"
      >
        <h2 className="text-lg font-medium text-zinc-950 dark:text-zinc-50">
          {editingId ? "水槽/ケージを編集" : "水槽/ケージを追加"}
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            名称
            <input
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
              placeholder="例: リビング水槽"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            種別
            <select
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({ ...f, category: e.target.value as TankCategory }))
              }
              className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            >
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {TANK_CATEGORY_LABELS[category]}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            幅(cm)
            <input
              type="number"
              min="0"
              value={form.widthCm}
              onChange={(e) => setForm((f) => ({ ...f, widthCm: e.target.value }))}
              className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            奥行(cm)
            <input
              type="number"
              min="0"
              value={form.depthCm}
              onChange={(e) => setForm((f) => ({ ...f, depthCm: e.target.value }))}
              className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            高さ(cm)
            <input
              type="number"
              min="0"
              value={form.heightCm}
              onChange={(e) => setForm((f) => ({ ...f, heightCm: e.target.value }))}
              className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            水量(L)
            <input
              type="number"
              min="0"
              value={form.volumeLiters}
              onChange={(e) => setForm((f) => ({ ...f, volumeLiters: e.target.value }))}
              className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm sm:col-span-2">
            設置場所
            <input
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
              placeholder="例: リビング"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm sm:col-span-2">
            レイアウト情報(底床・フィルター・ヒーター・照明など)
            <textarea
              value={form.layoutNotes}
              onChange={(e) => setForm((f) => ({ ...f, layoutNotes: e.target.value }))}
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
          登録済みの水槽/ケージ({tanks.length})
        </h2>
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
            まだ登録がありません。上のフォームから追加してください。
          </p>
        )}
        <ul className="flex flex-col gap-3">
          {tanks.map((tank) => (
            <li
              key={tank.id}
              className="flex flex-col gap-2 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800 sm:flex-row sm:items-start sm:justify-between"
            >
              <div>
                <p className="font-medium text-zinc-950 dark:text-zinc-50">
                  {tank.name}
                  <span className="ml-2 rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
                    {TANK_CATEGORY_LABELS[tank.category]}
                  </span>
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {tank.widthCm}×{tank.depthCm}×{tank.heightCm}cm / {tank.volumeLiters}L
                  {tank.location && ` / ${tank.location}`}
                </p>
                {tank.layoutNotes && (
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-500">
                    {tank.layoutNotes}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(tank)}
                  className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
                >
                  編集
                </button>
                <button
                  type="button"
                  onClick={() => removeTank(tank.id)}
                  className="rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
                >
                  削除
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
