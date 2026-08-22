"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTanks } from "@/lib/supabase/tanks";
import CareScheduleFields from "@/components/common/CareScheduleFields";
import TimedEquipmentFields from "@/components/common/TimedEquipmentFields";
import LightFields from "@/components/common/LightFields";
import {
  TANK_CATEGORY_LABELS,
  TANK_SHAPE_LABELS,
  type Tank,
  type TankCategory,
  type LightType,
  type TankShape,
} from "@/types/tank";
import { DEFAULT_CARE_SCHEDULE, type CareScheduleUnit } from "@/types/care-schedule";
import { truncateToOneDecimal } from "@/lib/decimal";

const CATEGORIES = Object.keys(TANK_CATEGORY_LABELS) as TankCategory[];
const SHAPES = Object.keys(TANK_SHAPE_LABELS) as TankShape[];

const emptyForm = {
  name: "",
  category: "aquarium" as TankCategory,
  widthCm: "",
  depthCm: "",
  heightCm: "",
  volumeLiters: "",
  location: "",
  layoutNotes: "",
  shape: "" as TankShape | "",
  cleaningScheduleCount: "",
  cleaningScheduleUnit: DEFAULT_CARE_SCHEDULE.unit,
  cleaningScheduleWeekdays: [] as number[],
  ambientTemperatureC: "",
  humidityPercent: "",
  waterTemperatureC: "",
  lightTypes: [] as LightType[],
  lightStartTime: "",
  lightEndTime: "",
  heaterEnabled: false,
  heaterStartTime: "",
  heaterEndTime: "",
  fanEnabled: false,
  fanStartTime: "",
  fanEndTime: "",
};

function toForm(tank: Tank): typeof emptyForm {
  return {
    name: tank.name,
    category: tank.category,
    widthCm: String(tank.widthCm),
    depthCm: String(tank.depthCm),
    heightCm: String(tank.heightCm),
    volumeLiters: String(tank.volumeLiters),
    location: tank.location,
    layoutNotes: tank.layoutNotes,
    shape: tank.shape ?? "",
    cleaningScheduleCount:
      tank.cleaningSchedule.count === null ? "" : String(tank.cleaningSchedule.count),
    cleaningScheduleUnit: tank.cleaningSchedule.unit,
    cleaningScheduleWeekdays: tank.cleaningSchedule.weekdays,
    ambientTemperatureC: tank.ambientTemperatureC === null ? "" : String(tank.ambientTemperatureC),
    humidityPercent: tank.humidityPercent === null ? "" : String(tank.humidityPercent),
    waterTemperatureC: tank.waterTemperatureC === null ? "" : String(tank.waterTemperatureC),
    lightTypes: tank.lightTypes,
    lightStartTime: tank.lightStartTime ?? "",
    lightEndTime: tank.lightEndTime ?? "",
    heaterEnabled: tank.heaterEnabled,
    heaterStartTime: tank.heaterStartTime ?? "",
    heaterEndTime: tank.heaterEndTime ?? "",
    fanEnabled: tank.fanEnabled,
    fanStartTime: tank.fanStartTime ?? "",
    fanEndTime: tank.fanEndTime ?? "",
  };
}

export default function TankForm({ tankId }: { tankId?: string }) {
  const router = useRouter();
  const { tanks, upsertTank } = useTanks();
  const [form, setForm] = useState(emptyForm);
  const [loaded, setLoaded] = useState(!tankId);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const existing = tankId ? tanks.find((t) => t.id === tankId) : undefined;

  useEffect(() => {
    if (existing && !loaded) {
      // 編集対象の水槽データ(外部システム=Supabaseから取得済みのローカル状態)を
      // フォームへ反映する初回同期のため、set-state-in-effectのルールを無効化する。
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm(toForm(existing));
      setLoaded(true);
    }
  }, [existing, loaded]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = form.name.trim();
    if (!name) return;

    const nextSortOrder =
      existing?.sortOrder ?? (tanks.length === 0 ? 0 : Math.max(...tanks.map((t) => t.sortOrder)) + 1);

    const tank: Tank = {
      id: tankId ?? crypto.randomUUID(),
      name,
      category: form.category,
      widthCm: truncateToOneDecimal(Number(form.widthCm) || 0),
      depthCm: truncateToOneDecimal(Number(form.depthCm) || 0),
      heightCm: truncateToOneDecimal(Number(form.heightCm) || 0),
      volumeLiters: truncateToOneDecimal(Number(form.volumeLiters) || 0),
      location: form.location.trim(),
      layoutNotes: form.layoutNotes.trim(),
      shape: form.shape || null,
      sortOrder: nextSortOrder,
      cleaningSchedule: {
        count: form.cleaningScheduleCount ? Number(form.cleaningScheduleCount) : null,
        unit: form.cleaningScheduleUnit,
        weekdays: form.cleaningScheduleWeekdays,
      },
      ambientTemperatureC: form.ambientTemperatureC
        ? truncateToOneDecimal(Number(form.ambientTemperatureC))
        : null,
      humidityPercent: form.humidityPercent
        ? truncateToOneDecimal(Number(form.humidityPercent))
        : null,
      waterTemperatureC: form.waterTemperatureC
        ? truncateToOneDecimal(Number(form.waterTemperatureC))
        : null,
      lightTypes: form.lightTypes,
      lightStartTime: form.lightTypes.length > 0 && form.lightStartTime ? form.lightStartTime : null,
      lightEndTime: form.lightTypes.length > 0 && form.lightEndTime ? form.lightEndTime : null,
      heaterEnabled: form.heaterEnabled,
      heaterStartTime: form.heaterEnabled && form.heaterStartTime ? form.heaterStartTime : null,
      heaterEndTime: form.heaterEnabled && form.heaterEndTime ? form.heaterEndTime : null,
      fanEnabled: form.fanEnabled,
      fanStartTime: form.fanEnabled && form.fanStartTime ? form.fanStartTime : null,
      fanEndTime: form.fanEnabled && form.fanEndTime ? form.fanEndTime : null,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };

    const success = await upsertTank(tank);
    if (success) {
      router.push(tankId ? `/tanks/${tankId}` : "/tanks");
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
        {tankId ? "水槽/ケージを編集" : "水槽/ケージを追加"}
      </h2>

      {submitError && (
        <p className="text-sm text-red-600 dark:text-red-400">{submitError}</p>
      )}

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
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as TankCategory }))}
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
          形状(任意・一覧のイラストに使用)
          <select
            value={form.shape}
            onChange={(e) => setForm((f) => ({ ...f, shape: e.target.value as TankShape | "" }))}
            className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="">未設定</option>
            {SHAPES.map((shape) => (
              <option key={shape} value={shape}>
                {TANK_SHAPE_LABELS[shape]}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          幅(cm)
          <input
            type="number"
            min="0"
            step="0.1"
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
            step="0.1"
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
            step="0.1"
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
            step="0.1"
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

        <label className="flex flex-col gap-1 text-sm">
          気温(℃)
          <input
            type="number"
            step="0.1"
            value={form.ambientTemperatureC}
            onChange={(e) => setForm((f) => ({ ...f, ambientTemperatureC: e.target.value }))}
            className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            placeholder="例: 25.0"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          湿度(%)
          <input
            type="number"
            step="0.1"
            min="0"
            max="100"
            value={form.humidityPercent}
            onChange={(e) => setForm((f) => ({ ...f, humidityPercent: e.target.value }))}
            className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            placeholder="例: 60"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          水温(℃)
          <input
            type="number"
            step="0.1"
            value={form.waterTemperatureC}
            onChange={(e) => setForm((f) => ({ ...f, waterTemperatureC: e.target.value }))}
            className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            placeholder="例: 26.0"
          />
        </label>

        <div className="sm:col-span-2" />

        <div className="sm:col-span-2">
          <LightFields
            lightTypes={form.lightTypes}
            startTime={form.lightStartTime}
            endTime={form.lightEndTime}
            onLightTypesChange={(value) => setForm((f) => ({ ...f, lightTypes: value }))}
            onStartTimeChange={(value) => setForm((f) => ({ ...f, lightStartTime: value }))}
            onEndTimeChange={(value) => setForm((f) => ({ ...f, lightEndTime: value }))}
          />
        </div>

        <TimedEquipmentFields
          label="ヒーター"
          enabled={form.heaterEnabled}
          startTime={form.heaterStartTime}
          endTime={form.heaterEndTime}
          onEnabledChange={(value) => setForm((f) => ({ ...f, heaterEnabled: value }))}
          onStartTimeChange={(value) => setForm((f) => ({ ...f, heaterStartTime: value }))}
          onEndTimeChange={(value) => setForm((f) => ({ ...f, heaterEndTime: value }))}
        />

        <TimedEquipmentFields
          label="ファン"
          enabled={form.fanEnabled}
          startTime={form.fanStartTime}
          endTime={form.fanEndTime}
          onEnabledChange={(value) => setForm((f) => ({ ...f, fanEnabled: value }))}
          onStartTimeChange={(value) => setForm((f) => ({ ...f, fanStartTime: value }))}
          onEndTimeChange={(value) => setForm((f) => ({ ...f, fanEndTime: value }))}
        />

        <CareScheduleFields
          label="清掃"
          count={form.cleaningScheduleCount}
          unit={form.cleaningScheduleUnit}
          weekdays={form.cleaningScheduleWeekdays}
          onCountChange={(value) => setForm((f) => ({ ...f, cleaningScheduleCount: value }))}
          onUnitChange={(value: CareScheduleUnit) =>
            setForm((f) => ({ ...f, cleaningScheduleUnit: value }))
          }
          onWeekdaysChange={(value) => setForm((f) => ({ ...f, cleaningScheduleWeekdays: value }))}
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
        >
          {tankId ? "更新する" : "追加する"}
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
