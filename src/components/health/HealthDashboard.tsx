"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useTanks } from "@/lib/supabase/tanks";
import { useCreatures } from "@/lib/supabase/creatures";
import { useCreatureLogs } from "@/lib/supabase/creature-logs";
import { assessCreatureHealth, type HealthStatus } from "@/lib/health-analysis";
import { CREATURE_CATEGORY_LABELS } from "@/types/creature";

const STATUS_STYLES: Record<HealthStatus, { label: string; badge: string }> = {
  good: {
    label: "良好",
    badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  },
  watch: {
    label: "要観察",
    badge: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  },
  alert: {
    label: "要注意",
    badge: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
  },
};

const STATUS_ORDER: HealthStatus[] = ["alert", "watch", "good"];

export default function HealthDashboard() {
  const { tanks, loading: tanksLoading } = useTanks();
  const { creatures, loading: creaturesLoading } = useCreatures();
  const { logs, loading: logsLoading } = useCreatureLogs();

  const loading = tanksLoading || creaturesLoading || logsLoading;

  const assessments = useMemo(() => {
    return creatures
      .map((creature) => {
        const tank = tanks.find((candidate) => candidate.id === creature.tankId);
        const tankCreatureCount = creatures.filter(
          (candidate) => candidate.tankId === creature.tankId
        ).length;
        const creatureLogs = logs.filter((log) => log.creatureId === creature.id);
        const assessment = assessCreatureHealth(creature, creatureLogs, tank, tankCreatureCount);
        return { creature, tank, assessment };
      })
      .sort(
        (a, b) =>
          STATUS_ORDER.indexOf(a.assessment.status) - STATUS_ORDER.indexOf(b.assessment.status)
      );
  }, [creatures, tanks, logs]);

  if (loading) {
    return <p className="text-sm text-zinc-500 dark:text-zinc-400">読み込み中...</p>;
  }

  if (creatures.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        生態が登録されていません。まず{" "}
        <Link href="/creatures" className="underline">
          生態管理
        </Link>{" "}
        ページから登録してください。
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {assessments.map(({ creature, tank, assessment }) => (
        <li
          key={creature.id}
          className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="font-medium text-zinc-950 dark:text-zinc-50">
              {creature.speciesName}
              {creature.individualName && `(${creature.individualName})`}
              <span className="ml-2 rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
                {CREATURE_CATEGORY_LABELS[creature.category]}
              </span>
            </p>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[assessment.status].badge}`}
            >
              {STATUS_STYLES[assessment.status].label}
            </span>
          </div>
          {tank && (
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-500">所属: {tank.name}</p>
          )}
          <ul className="mt-2 flex flex-col gap-1">
            {assessment.reasons.map((reason) => (
              <li key={reason} className="text-sm text-zinc-600 dark:text-zinc-400">
                ・{reason}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
