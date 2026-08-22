"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTanks } from "@/lib/supabase/tanks";
import { useCreatures } from "@/lib/supabase/creatures";
import { useTankEnvironmentRecords } from "@/lib/supabase/tank-environment-records";
import { useFeedingRecords } from "@/lib/supabase/feeding-records";
import { useCleaningRecords } from "@/lib/supabase/cleaning-records";
import { useCreatureLogs } from "@/lib/supabase/creature-logs";
import { assessTankEnvironment } from "@/lib/environment-analysis";
import { assessCreatureHealth, type HealthStatus } from "@/lib/health-analysis";
import StatusFace from "@/components/common/StatusFace";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import TankIcon from "@/components/common/TankIcon";
import { TANK_CATEGORY_LABELS, LIGHT_TYPE_LABELS } from "@/types/tank";
import { CREATURE_CATEGORY_LABELS } from "@/types/creature";
import { formatOneDecimal } from "@/lib/decimal";

const HEALTH_STATUS_LABELS: Record<HealthStatus, string> = {
  good: "良好",
  watch: "要観察",
  alert: "要注意",
};

export default function TankDetail({ id }: { id: string }) {
  const router = useRouter();
  const { tanks, loading, removeTank } = useTanks();
  const { creatures } = useCreatures();
  const { records: environmentRecords } = useTankEnvironmentRecords();
  const { records: feedingRecords } = useFeedingRecords();
  const { records: cleaningRecords } = useCleaningRecords();
  const { logs } = useCreatureLogs();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const tank = tanks.find((t) => t.id === id);

  const tankRecords = useMemo(
    () =>
      environmentRecords
        .filter((record) => record.tankId === id)
        .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt)),
    [environmentRecords, id]
  );
  const latestRecord = tankRecords[0];
  const environmentAssessment = assessTankEnvironment(latestRecord);

  const tankCreatures = creatures.filter((creature) => creature.tankId === id);

  const equipmentSummary: string[] = [];
  if (tank?.lightTypes.length) {
    const types = tank.lightTypes.map((type) => LIGHT_TYPE_LABELS[type]).join("・");
    const time =
      tank.lightStartTime && tank.lightEndTime ? `(${tank.lightStartTime}〜${tank.lightEndTime})` : "";
    equipmentSummary.push(`ライト: ${types}${time}`);
  }
  if (tank?.heaterEnabled) {
    const time =
      tank.heaterStartTime && tank.heaterEndTime ? `(${tank.heaterStartTime}〜${tank.heaterEndTime})` : "";
    equipmentSummary.push(`ヒーター${time}`);
  }
  if (tank?.fanEnabled) {
    const time = tank.fanStartTime && tank.fanEndTime ? `(${tank.fanStartTime}〜${tank.fanEndTime})` : "";
    equipmentSummary.push(`ファン${time}`);
  }

  const handleDelete = async () => {
    setConfirmOpen(false);
    const success = await removeTank(id);
    if (success) {
      router.push("/tanks");
    }
  };

  if (loading && !tank) {
    return <p className="text-sm text-zinc-500 dark:text-zinc-400">読み込み中...</p>;
  }

  if (!tank) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        水槽/ケージが見つかりませんでした。{" "}
        <Link href="/tanks" className="underline">
          一覧に戻る
        </Link>
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
        <div className="flex items-center gap-4">
          <TankIcon shape={tank.shape} category={tank.category} size={56} />
          <StatusFace status={environmentAssessment.status} />
          <div>
            <p className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">
              {tank.name}
              <span className="ml-2 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-normal text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
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
        <div className="flex gap-2">
          <Link
            href={`/environment-records/new?tankId=${tank.id}`}
            className="rounded-md border border-sky-300 px-3 py-1.5 text-sm text-sky-700 hover:bg-sky-50 dark:border-sky-800 dark:text-sky-300 dark:hover:bg-sky-950"
          >
            環境記録を追加
          </Link>
          <Link
            href={`/tanks/${tank.id}/edit`}
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

      <div className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
        <h3 className="text-sm font-medium text-zinc-950 dark:text-zinc-50">環境状態(最新の記録)</h3>
        {latestRecord ? (
          <>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              記録日時: {new Date(latestRecord.recordedAt).toLocaleString("ja-JP")}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">気温</p>
                <p className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
                  {latestRecord.ambientTemperatureC !== null
                    ? `${formatOneDecimal(latestRecord.ambientTemperatureC)}℃`
                    : "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">湿度</p>
                <p className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
                  {latestRecord.humidityPercent !== null
                    ? `${formatOneDecimal(latestRecord.humidityPercent)}%`
                    : "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">水温</p>
                <p className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
                  {latestRecord.waterTemperatureC !== null
                    ? `${formatOneDecimal(latestRecord.waterTemperatureC)}℃`
                    : "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">綺麗度</p>
                <p className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
                  {latestRecord.cleanlinessPercent}%
                </p>
              </div>
            </div>
          </>
        ) : (
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            まだ環境記録がありません。「環境記録を追加」から記録してください。
          </p>
        )}
        <ul className="mt-3 flex flex-col gap-1">
          {environmentAssessment.reasons.map((reason) => (
            <li key={reason} className="text-sm text-zinc-600 dark:text-zinc-400">
              ・{reason}
            </li>
          ))}
        </ul>

        {tankRecords.length > 1 && (
          <div className="mt-4 border-t border-zinc-200 pt-3 dark:border-zinc-800">
            <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">過去の記録</p>
            <ul className="mt-2 flex flex-col gap-1">
              {tankRecords.slice(1, 6).map((record) => (
                <li key={record.id} className="text-xs text-zinc-500 dark:text-zinc-500">
                  {new Date(record.recordedAt).toLocaleString("ja-JP")} / 気温
                  {record.ambientTemperatureC !== null ? formatOneDecimal(record.ambientTemperatureC) : "-"}
                  ℃ / 湿度
                  {record.humidityPercent !== null ? formatOneDecimal(record.humidityPercent) : "-"}
                  % / 水温
                  {record.waterTemperatureC !== null ? formatOneDecimal(record.waterTemperatureC) : "-"}
                  ℃ / 綺麗度{record.cleanlinessPercent}%
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {(tank.layoutNotes || equipmentSummary.length > 0) && (
        <div className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
          <h3 className="text-sm font-medium text-zinc-950 dark:text-zinc-50">設備・レイアウト</h3>
          {equipmentSummary.length > 0 && (
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              {equipmentSummary.join(" / ")}
            </p>
          )}
          {tank.layoutNotes && (
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{tank.layoutNotes}</p>
          )}
        </div>
      )}

      <div className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
        <h3 className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
          収容している生態({tankCreatures.length})
        </h3>
        {tankCreatures.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">まだ登録がありません。</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {tankCreatures.map((creature) => {
              const creatureLogs = logs.filter((log) => log.creatureId === creature.id);
              const feedingRecordDates = feedingRecords
                .filter((record) => record.creatureId === creature.id)
                .map((record) => record.date);
              const cleaningRecordDates = cleaningRecords
                .filter((record) => record.tankId === tank.id)
                .map((record) => record.date);
              const assessment = assessCreatureHealth({
                creature,
                logs: creatureLogs,
                tank,
                tankCreatureCount: tankCreatures.length,
                feedingRecordDates,
                cleaningRecordDates,
              });
              return (
                <li key={creature.id}>
                  <Link
                    href={`/creatures/${creature.id}`}
                    className="flex items-center justify-between gap-2 rounded-md border border-zinc-200 px-3 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
                  >
                    <span className="text-zinc-700 dark:text-zinc-300">
                      {creature.speciesName}
                      {creature.individualName && `(${creature.individualName})`}
                      <span className="ml-2 rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
                        {CREATURE_CATEGORY_LABELS[creature.category]}
                      </span>
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {HEALTH_STATUS_LABELS[assessment.status]}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="水槽/ケージを削除しますか?"
        message={`「${tank.name}」を削除します。この操作は取り消せません。よろしいですか？`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
