import Link from "next/link";
import TankForm from "@/components/tanks/TankForm";

export const metadata = {
  title: "水槽/ケージを追加 | AquaLife Manager",
};

export default function NewTankPage() {
  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-16 sm:px-10">
        <div className="flex flex-col gap-2">
          <Link href="/tanks" className="text-sm text-zinc-500 hover:underline dark:text-zinc-400">
            ← 一覧に戻る
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            水槽/ケージを追加
          </h1>
        </div>

        <TankForm />
      </main>
    </div>
  );
}
