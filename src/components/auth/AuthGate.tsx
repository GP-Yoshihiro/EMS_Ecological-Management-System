"use client";

import { useSession, signOut } from "@/lib/supabase/auth";
import LoginForm from "./LoginForm";

/**
 * アプリ全体を認証で保護するゲート。未ログインの場合はログインフォームのみを表示し、
 * アプリ本体(水槽/生態データ等)には一切アクセスさせない。
 * ユーザーアカウントはSupabaseダッシュボードから作成する運用とし、
 * アプリ内には公開のサインアップ画面を設けていない。
 */
export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { session, loading } = useSession();

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">読み込み中...</p>
      </div>
    );
  }

  if (!session) {
    return <LoginForm />;
  }

  return (
    <>
      <div className="flex items-center justify-end border-b border-zinc-200 bg-white px-4 py-2 dark:border-zinc-800 dark:bg-zinc-950">
        <button
          type="button"
          onClick={() => signOut()}
          className="text-xs text-zinc-500 hover:underline dark:text-zinc-400"
        >
          ログアウト
        </button>
      </div>
      {children}
    </>
  );
}
