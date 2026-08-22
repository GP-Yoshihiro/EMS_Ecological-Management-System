import Link from "next/link";
import TankList from "@/components/tanks/TankList";

export const metadata = {
  title: "水槽・ケージ管理 | AquaLife Manager",
};

export default function TanksPage() {
  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-16 sm:px-10">
        <div className="flex flex-col gap-2">
          <Link href="/" className="text-sm text-zinc-500 hover:underline dark:text-zinc-400">
            ← トップに戻る
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            水槽・ケージ管理
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            水槽/ケージごとのサイズ・水量・レイアウト情報を登録・編集します。
          </p>
        </div>

        <TankList />
      </main>
    </div>
  );
}
