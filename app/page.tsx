"use client";

import { FormEvent, useState } from "react";
import { FirebaseError } from "firebase/app";
import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

const authErrorMessages: Record<string, string> = {
  "auth/invalid-credential":
    "メールアドレスまたはパスワードが正しくありません。",
  "auth/invalid-email": "メールアドレスの形式を確認してください。",
  "auth/missing-password": "パスワードを入力してください。",
  "auth/too-many-requests":
    "試行回数が多すぎます。しばらく時間をおいてお試しください。",
  "auth/user-disabled": "このアカウントは現在利用できません。",
  "auth/network-request-failed":
    "通信に失敗しました。ネットワーク接続を確認してください。",
};

function getAuthErrorMessage(error: unknown) {
  if (error instanceof FirebaseError) {
    return (
      authErrorMessages[error.code] ??
      "ログインできませんでした。入力内容を確認してください。"
    );
  }

  return "予期しないエラーが発生しました。もう一度お試しください。";
}

function EyeIcon({ hidden }: { hidden: boolean }) {
  return hidden ? (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.4 4.5A10.8 10.8 0 0 1 12 4.2c4.8 0 8.2 4.1 9.2 5.5a.5.5 0 0 1 0 .6 15.8 15.8 0 0 1-3 3.4M6.2 6.2A16.1 16.1 0 0 0 2.8 9.7a.5.5 0 0 0 0 .6c1 1.4 4.4 5.5 9.2 5.5 1 0 1.9-.2 2.7-.5"
      />
    </svg>
  ) : (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.8 9.7a.5.5 0 0 0 0 .6c1 1.4 4.4 5.5 9.2 5.5s8.2-4.1 9.2-5.5a.5.5 0 0 0 0-.6C20.2 8.3 16.8 4.2 12 4.2S3.8 8.3 2.8 9.7Z"
      />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export default function Home() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");

    if (!auth) {
      setMessage({
        type: "error",
        text: "現在ログイン機能を利用できません。管理者へお問い合わせください。",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      setMessage({ type: "success", text: "ログインしました。" });
    } catch (error) {
      setMessage({ type: "error", text: getAuthErrorMessage(error) });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handlePasswordReset() {
    setMessage(null);

    if (!auth) {
      setMessage({
        type: "error",
        text: "現在ログイン機能を利用できません。管理者へお問い合わせください。",
      });
      return;
    }

    if (!email.trim()) {
      setMessage({
        type: "error",
        text: "先にメールアドレスを入力してください。",
      });
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email.trim());
      setMessage({
        type: "success",
        text: "パスワード再設定メールを送信しました。",
      });
    } catch (error) {
      setMessage({ type: "error", text: getAuthErrorMessage(error) });
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-5 py-12 text-[#0F172A]">
      <div
        aria-hidden="true"
        className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-[#2563EB]/[0.06] blur-2xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-40 -right-28 h-96 w-96 rounded-full bg-[#EF4444]/[0.05] blur-3xl"
      />

      <section className="relative w-full max-w-[440px]">
        <div className="mb-8 text-center">
          <p className="inline-block font-logo text-[3.25rem] font-bold leading-none tracking-[-0.025em] text-[#2563EB]">
            milmo<span className="text-[#EF4444]">.</span>
          </p>
          <h1 className="mt-5 text-2xl font-bold tracking-tight">ログイン</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            アカウント情報を入力してください
          </p>
        </div>

        <div className="rounded-3xl border border-[#E5E7EB] bg-[#F8FAFC] p-6 shadow-[0_20px_55px_-32px_rgba(15,23,42,0.35)] sm:p-8">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label
                className="mb-2 block text-sm font-semibold"
                htmlFor="email"
              >
                メールアドレス
              </label>
              <input
                autoComplete="email"
                className="h-12 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 text-[15px] outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10"
                id="email"
                name="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@example.com"
                required
                type="email"
                value={email}
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-4">
                <label className="text-sm font-semibold" htmlFor="password">
                  パスワード
                </label>
                <button
                  className="text-xs font-semibold text-[#2563EB] transition hover:text-blue-700"
                  onClick={handlePasswordReset}
                  type="button"
                >
                  パスワードを忘れた方
                </button>
              </div>
              <div className="relative">
                <input
                  autoComplete="current-password"
                  className="h-12 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 pr-12 text-[15px] outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10"
                  id="password"
                  name="password"
                  placeholder="パスワードを入力"
                  required
                  type={showPassword ? "text" : "password"}
                />
                <button
                  aria-label={
                    showPassword
                      ? "パスワードを非表示にする"
                      : "パスワードを表示する"
                  }
                  aria-pressed={showPassword}
                  className="absolute right-1 top-1 flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-[#2563EB] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#2563EB]"
                  onClick={() => setShowPassword((current) => !current)}
                  type="button"
                >
                  <EyeIcon hidden={showPassword} />
                </button>
              </div>
            </div>

            {message && (
              <div
                aria-live="polite"
                className={`rounded-xl border px-4 py-3 text-sm leading-5 ${
                  message.type === "error"
                    ? "border-[#EF4444]/25 bg-[#EF4444]/[0.06] text-red-700"
                    : "border-[#2563EB]/25 bg-[#2563EB]/[0.06] text-blue-700"
                }`}
                role={message.type === "error" ? "alert" : "status"}
              >
                {message.text}
              </div>
            )}

            <button
              className="mt-2 flex h-12 w-full items-center justify-center rounded-xl bg-[#2563EB] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-65"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? (
                <>
                  <span
                    aria-hidden="true"
                    className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                  />
                  ログイン中...
                </>
              ) : (
                "ログイン"
              )}
            </button>
          </form>
        </div>

        <p className="mt-7 text-center text-sm text-slate-500">
          アカウントをお持ちでない方は{" "}
          <button
            className="font-semibold text-[#2563EB] transition hover:text-blue-700"
            type="button"
          >
            新規登録
          </button>
        </p>
      </section>
    </main>
  );
}
