import Link from "next/link";

const FEATURES = [
  {
    title: "水槽・ケージ管理",
    description: "サイズ、水量、レイアウト情報を登録・管理します。",
  },
  {
    title: "生態管理",
    description: "種、個体、導入日、健康メモを記録します。",
  },
  {
    title: "カレンダー",
    description: "給餌日・清掃日をアプリ内カレンダーで確認します。",
  },
  {
    title: "自動スケジューリング",
    description: "水槽サイズ・水量から清掃日を自動算出します。",
  },
  {
    title: "AI健康管理",
    description: "生態・水槽データから健康状態を分析します。",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-16 sm:px-10">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            AquaLife Manager
          </h1>
          <p className="text-base text-zinc-600 dark:text-zinc-400">
            飼育している生態と水槽/ケージの情報を一元管理するアプリです。
          </p>
          <Link
            href="/calendar"
            className="mt-2 inline-flex w-fit items-center gap-1 rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            カレンダーを見る
          </Link>
        </header>

        <section className="grid gap-4 sm:grid-cols-2">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <h2 className="text-lg font-medium text-zinc-950 dark:text-zinc-50">
                {feature.title}
              </h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {feature.description}
              </p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
