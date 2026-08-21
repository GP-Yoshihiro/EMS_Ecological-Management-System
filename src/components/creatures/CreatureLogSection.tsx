"use client";

import { useState } from "react";
import { useCreatureLogs } from "@/lib/supabase/creature-logs";
import type { CreatureLog } from "@/types/creature-log";

function todayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function CreatureLogSection({ creatureId }: { creatureId: string }) {
  const { logs, upsertLog, removeLog } = useCreatureLogs();
  const [expanded, setExpanded] = useState(false);
  const [date, setDate] = useState(todayIsoDate());
  const [note, setNote] = useState("");

  const creatureLogs = logs
    .filter((log) => log.creatureId === creatureId)
    .sort((a, b) => b.date.localeCompare(a.date));

  const handleAdd = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = note.trim();
    if (!trimmed) return;

    const log: CreatureLog = {
      id: crypto.randomUUID(),
      creatureId,
      date,
      note: trimmed,
      createdAt: new Date().toISOString(),
    };

    const success = await upsertLog(log);
    if (success) {
      setNote("");
      setDate(todayIsoDate());
    }
  };

  return (
    <div className="mt-3 border-t border-zinc-200 pt-3 dark:border-zinc-800">
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="text-xs font-medium text-sky-600 hover:underline dark:text-sky-400"
      >
        {expanded ? "体調記録を閉じる" : `体調記録(${creatureLogs.length})`}
      </button>

      {expanded && (
        <div className="mt-2 flex flex-col gap-2">
          <form onSubmit={handleAdd} className="flex flex-col gap-2 sm:flex-row">
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="rounded-md border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-900"
            />
            <input
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="例: 食欲旺盛、色つやが良い"
              className="flex-1 rounded-md border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-900"
            />
            <button
              type="submit"
              className="rounded-md bg-zinc-950 px-3 py-1 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              記録する
            </button>
          </form>

          <ul className="flex flex-col gap-1">
            {creatureLogs.length === 0 && (
              <li className="text-xs text-zinc-500 dark:text-zinc-500">記録はまだありません。</li>
            )}
            {creatureLogs.map((log) => (
              <li
                key={log.id}
                className="flex items-center justify-between gap-2 text-xs text-zinc-600 dark:text-zinc-400"
              >
                <span>
                  {log.date}: {log.note}
                </span>
                <button
                  type="button"
                  onClick={() => removeLog(log.id)}
                  className="shrink-0 text-red-500 hover:underline dark:text-red-400"
                >
                  削除
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
