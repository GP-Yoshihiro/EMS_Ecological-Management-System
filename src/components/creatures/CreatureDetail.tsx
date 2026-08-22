"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCreatures } from "@/lib/supabase/creatures";
import { useTanks } from "@/lib/supabase/tanks";
import { useCreatureLogs } from "@/lib/supabase/creature-logs";
import { useFeedingRecords } from "@/lib/supabase/feeding-records";
import { useCleaningRecords } from "@/lib/supabase/cleaning-records";
import { assessCreatureHealth } from "@/lib/health-analysis";
import StatusFace from "@/components/common/StatusFace";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import CreatureIcon from "@/components/common/CreatureIcon";
import CreatureLogSection from "./CreatureLogSection";
import { CREATURE_CATEGORY_LABELS } from "@/types/creature";

export default function CreatureDetail({ id }: { id: string }) {
  const router = useRouter();
  const { creatures, loading, removeCreature } = useCreatures();
  const { tanks } = useTanks();
  const { logs } = useCreatureLogs();
  const { records: feedingRecords } = useFeedingRecords();
  const { records: cleaningRecords } = useCleaningRecords();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const creature = creatures.find((c) => c.id === id);
  const tank = creature ? tanks.find((t) => t.id === creature.tankId) : undefined;
  const tankCreatureCount = creature
    ? creatures.filter((c) => c.tankId === creature.tankId).length
    : 0;

  const assessment = creature
    ? assessCreatureHealth({
        creature,
        logs: logs.filter((log) => log.creatureId === creature.id),
        tank,
        tankCreatureCount,
        feedingRecordDates: feedingRecords
          .filter((record) => record.creatureId === creature.id)
          .map((record) => record.date),
        cleaningRecordDates: tank
          ? cleaningRecords.filter((record) => record.tankId === tank.id).map((record) => record.date)
          : [],
      })
    : undefined;

  const handleDelete = async () => {
    setConfirmOpen(false);
    const success = await removeCreature(id);
    if (success) {
      router.push("/creatures");
    }
  };

  if (loading && !creature) {
    return <p className="text-sm text-zinc-500 dark:text-zinc-400">読み込み中...</p>;
  }

  if (!creature) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        生態が見つかりませんでした。{" "}
        <Link href="/creatures" className="underline">
          一覧に戻る
        </Link>
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
        <div className="flex items-center gap-4">
          <CreatureIcon category={creature.category} size={56} />
          {assessment && <StatusFace status={assessment.status} />}
          <div>
            <p className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">
              {creature.speciesName}
              {creature.individualName && `(${creature.individualName})`}
              <span className="ml-2 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-normal text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
                {CREATURE_CATEGORY_LABELS[creature.category]}
              </span>
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {creature.introducedAt && `導入日: ${creature.introducedAt} / `}
              所属:{" "}
              {tank ? (
                <Link href={`/tanks/${tank.id}`} className="underline">
                  {tank.name}
                </Link>
              ) : (
                "未割り当て"
              )}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/creatures/${creature.id}/edit`}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            編集
          </Link>
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
          >
            削除
          </button>
        </div>
      </div>

      {assessment && (
        <div className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
          <h3 className="text-sm font-medium text-zinc-950 dark:text-zinc-50">健康状態</h3>
          <ul className="mt-2 flex flex-col gap-1">
            {assessment.reasons.map((reason) => (
              <li key={reason} className="text-sm text-zinc-600 dark:text-zinc-400">
                ・{reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {creature.notes && (
        <div className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
          <h3 className="text-sm font-medium text-zinc-950 dark:text-zinc-50">特記事項</h3>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{creature.notes}</p>
        </div>
      )}

      <div className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
        <CreatureLogSection creatureId={creature.id} />
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="生態を削除しますか?"
        message={`「${creature.speciesName}${
          creature.individualName ? `(${creature.individualName})` : ""
        }」を削除します。この操作は取り消せません。よろしいですか？`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
