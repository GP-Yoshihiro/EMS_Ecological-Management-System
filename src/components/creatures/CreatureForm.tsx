"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCreatures } from "@/lib/supabase/creatures";
import { useTanks } from "@/lib/supabase/tanks";
import CareScheduleFields from "@/components/common/CareScheduleFields";
import { CREATURE_CATEGORY_LABELS, type Creature, type CreatureCategory } from "@/types/creature";
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

function toForm(creature: Creature): typeof emptyForm {
  return {
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
  };
}

export default function CreatureForm({ creatureId }: { creatureId?: string }) {
  const router = useRouter();
  const { creatures, upsertCreature } = useCreatures();
  const { tanks } = useTanks();
  const [form, setForm] = useState(emptyForm);
  const [loaded, setLoaded] = useState(!creatureId);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const existing = creatureId ? creatures.find((c) => c.id === creatureId) : undefined;

  useEffect(() => {
    if (existing && !loaded) {
      // 編集対象の生態データ(外部システム=Supabaseから取得済みのローカル状態)を
      // フォームへ反映する初回同期のため、set-state-in-effectのルールを無効化する。
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm(toForm(existing));
      setLoaded(true);
    }
  }, [existing, loaded]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const speciesName = form.speciesName.trim();
    if (!speciesName) return;

    const nextSortOrder =
      existing?.sortOrder ??
      (creatures.length === 0 ? 0 : Math.max(...creatures.map((c) => c.sortOrder)) + 1);

    const creature: Creature = {
      id: creatureId ?? crypto.randomUUID(),
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
      router.push(creatureId ? `/creatures/${creatureId}` : "/creatures");
    } else {
      setSubmitError("保存に失敗しました。時間をおいて再度お試しください。");
    }
  };

  if (!loaded) {
    return <p className="text-sm text-zinc-500 dark:text-zinc-400">読み込み中...</p>;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-xl border border-zinc-200 p-5 dark:border-zinc-800"
    >
      <h2 className="text-lg font-medium text-zinc-950 dark:text-zinc-50">
        {creatureId ? "生態を編集" : "生態を追加"}
      </h2>

      {submitError && <p className="text-sm text-red-600 dark:text-red-400">{submitError}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          分類
          <select
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as CreatureCategory }))}
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
          {creatureId ? "更新する" : "追加する"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-full border border-zinc-300 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}
