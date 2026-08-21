"use client";

import { useState } from "react";
import { signIn } from "@/lib/supabase/auth";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const { error: signInError } = await signIn(email, password);
    if (signInError) {
      if (signInError.code === "email_not_confirmed") {
        setError(
          "メールアドレスが未確認です。Supabaseダッシュボードのユーザー詳細で確認済みにしてください。"
        );
      } else if (signInError.code === "invalid_credentials") {
        setError("メールアドレスまたはパスワードが正しくありません。");
      } else {
        setError(`ログインに失敗しました: ${signInError.message}(code: ${signInError.code ?? "unknown"})`);
      }
    }
    setSubmitting(false);
  };

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 dark:bg-black">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-zinc-200 p-6 dark:border-zinc-800"
      >
        <div>
          <h1 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">
            AquaLife Manager
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            ログインしてください。
          </p>
        </div>

        <label className="flex flex-col gap-1 text-sm">
          メールアドレス
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          パスワード
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
        >
          {submitting ? "ログイン中..." : "ログイン"}
        </button>
      </form>
    </div>
  );
}
