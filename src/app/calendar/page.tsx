import Link from "next/link";
import MonthCalendar from "@/components/calendar/MonthCalendar";

export const metadata = {
  title: "カレンダー | AquaLife Manager",
};

export default function CalendarPage() {
  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-16 sm:px-10">
        <div className="flex flex-col gap-2">
          <Link
            href="/"
            className="text-sm text-zinc-500 hover:underline dark:text-zinc-400"
          >
            ← トップに戻る
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            カレンダー
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            登録した水槽・生態のデータから、給餌日・清掃日をアプリ内カレンダーで確認できます。
            清掃日は水槽のサイズ・水量・収容生体数から自動算出しています。
          </p>
        </div>

        <MonthCalendar />
      </main>
    </div>
  );
}
