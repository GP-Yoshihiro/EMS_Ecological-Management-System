"use client";

import { useState } from "react";
import { useCreatures } from "@/lib/supabase/creatures";
import { useTanks } from "@/lib/supabase/tanks";
import {
  CREATURE_CATEGORY_LABELS,
  type Creature,
  type CreatureCategory,
} from "@/types/creature";

const CATEGORIES = Object.keys(CREATURE_CATEGORY_LABELS) as CreatureCategory[];

const emptyForm = {
  category: "fish" as CreatureCategory,
  speciesName: "",
  individualName: "",
  introducedAt: "",
  tankId: "",
  notes: "",
};

export default function CreatureManager() {
  const { creatures, loading, error, upsertCreature, removeCreature } = useCreatures();
  const { tanks } = useTanks();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const startEdit = (creature: Creature) => {
    setEditingId(creature.id);
    setForm({
      category: creature.category,
      speciesName: creature.speciesName,
      individualName: creature.individualName,
      introducedAt: creature.introducedAt,
      tankId: creature.tankId ?? "",
      notes: creature.notes,
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const speciesName = form.speciesName.trim();
    if (!speciesName) return;

    const creature: Creature = {
      id: editingId ?? crypto.randomUUID(),
      category: form.category,
      speciesName,
      individualName: form.individualName.trim(),
      introducedAt: form.introducedAt,
      tankId: form.tankId || null,
      notes: form.notes.trim(),
      createdAt: editingId
        ? creatures.find((c) => c.id === editingId)?.createdAt ?? new Date().toISOString()
        : new Date().toISOString(),
    };

    upsertCreature(creature);
    resetForm();
  };

  const tankName = (tankId: string | null) =>
    tanks.find((tank) => tank.id === tankId)?.name ?? "未割り当て";

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
        <ul className="flex flex-col gap-3">
          {creatures.map((creature) => (
            <li
              key={creature.id}
              className="flex flex-col gap-2 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800 sm:flex-row sm:items-start sm:justify-between"
            >
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
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
