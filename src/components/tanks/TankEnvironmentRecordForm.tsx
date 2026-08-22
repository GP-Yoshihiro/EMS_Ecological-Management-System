"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTanks } from "@/lib/supabase/tanks";
import { useTankEnvironmentRecords } from "@/lib/supabase/tank-environment-records";
import { truncateToOneDecimal } from "@/lib/decimal";
import type { TankEnvironmentRecord } from "@/types/tank-environment-record";

export default function TankEnvironmentRecordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { tanks } = useTanks();
  const { upsertRecord } = useTankEnvironmentRecords();

  const [tankId, setTankId] = useState(searchParams.get("tankId") ?? "");
  const [ambientTemperatureC, setAmbientTemperatureC] = useState("");
  const [humidityPercent, setHumidityPercent] = useState("");
  const [waterTemperatureC, setWaterTemperatureC] = useState("");
  const [cleanlinessPercent, setCleanlinessPercent] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!tankId || cleanlinessPercent === "") return;

    const record: TankEnvironmentRecord = {
      id: crypto.randomUUID(),
      tankId,
      recordedAt: new Date().toISOString(),
      ambientTemperatureC: ambientTemperatureC ? truncateToOneDecimal(Number(ambientTemperatureC)) : null,
      humidityPercent: humidityPercent ? truncateToOneDecimal(Number(humidityPercent)) : null,
      waterTemperatureC: waterTemperatureC ? truncateToOneDecimal(Number(waterTemperatureC)) : null,
      cleanlinessPercent: Math.min(100, Math.max(0, Math.round(Number(cleanlinessPercent)))),
      createdAt: new Date().toISOString(),
    };

    const success = await upsertRecord(record);
    if (success) {
      router.push("/calendar");
    } else {
      setSubmitError("保存に失敗しました。時間をおいて再度お試しください。");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-xl border border-zinc-200 p-5 dark:border-zinc-800"
    >
      {submitError && <p className="text-sm text-red-600 dark:text-red-400">{submitError}</p>}

      <label className="flex flex-col gap-1 text-sm">
        水槽/ケージ
        <select
          required
          value={tankId}
          onChange={(e) => setTankId(e.target.value)}
          className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        >
          <option value="">選択してください</option>
          {tanks.map((tank) => (
            <option key={tank.id} value={tank.id}>
              {tank.name}
            </option>
          ))}
        </select>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          気温(℃)
          <input
            type="number"
            step="0.1"
            value={ambientTemperatureC}
            onChange={(e) => setAmbientTemperatureC(e.target.value)}
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
            value={humidityPercent}
            onChange={(e) => setHumidityPercent(e.target.value)}
            className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            placeholder="例: 60"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          水温(℃)
          <input
            type="number"
            step="0.1"
            value={waterTemperatureC}
            onChange={(e) => setWaterTemperatureC(e.target.value)}
            className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            placeholder="例: 26.0"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          綺麗度(%)
          <input
            required
            type="number"
            step="1"
            min="0"
            max="100"
            value={cleanlinessPercent}
            onChange={(e) => setCleanlinessPercent(e.target.value)}
            className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            placeholder="例: 80"
          />
        </label>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
        >
          保存する
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
