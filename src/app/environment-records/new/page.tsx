import { Suspense } from "react";
import Link from "next/link";
import TankEnvironmentRecordForm from "@/components/tanks/TankEnvironmentRecordForm";

export const metadata = {
  title: "環境記録を追加 | AquaLife Manager",
};

export default function NewTankEnvironmentRecordPage() {
  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-16 sm:px-10">
        <div className="flex flex-col gap-2">
          <Link href="/calendar" className="text-sm text-zinc-500 hover:underline dark:text-zinc-400">
            ← カレンダーに戻る
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            環境記録を追加
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            水槽/ケージを選び、現在の温度・湿度・水温・綺麗度を記録します。記録日時は自動的に現在時刻が使われます。
          </p>
        </div>

        <Suspense fallback={<p className="text-sm text-zinc-500 dark:text-zinc-400">読み込み中...</p>}>
          <TankEnvironmentRecordForm />
        </Suspense>
      </main>
    </div>
  );
}
