import Link from "next/link";
import HealthDashboard from "@/components/health/HealthDashboard";

export const metadata = {
  title: "健康管理 | AquaLife Manager",
};

export default function HealthPage() {
  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-16 sm:px-10">
        <div className="flex flex-col gap-2">
          <Link href="/" className="text-sm text-zinc-500 hover:underline dark:text-zinc-400">
            ← トップに戻る
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            健康管理
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            体調記録・特記事項・水槽の飼育密度から、ルールベースで健康状態の目安を表示します
            (外部AIは使用していません)。
          </p>
        </div>

        <HealthDashboard />
      </main>
    </div>
  );
}
