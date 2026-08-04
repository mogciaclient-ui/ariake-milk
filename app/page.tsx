"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createDemoUser } from "@/lib/demo";
import { saveDemoSession } from "@/lib/demo-session";

function EyeIcon({ hidden }: { hidden: boolean }) {
  return <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">{hidden ? <path strokeLinecap="round" strokeLinejoin="round" d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.4 4.5A10.8 10.8 0 0 1 12 4.2c4.8 0 8.2 4.1 9.2 5.5a.5.5 0 0 1 0 .6 15.8 15.8 0 0 1-3 3.4M6.2 6.2A16.1 16.1 0 0 0 2.8 9.7a.5.5 0 0 0 0 .6c1 1.4 4.4 5.5 9.2 5.5 1 0 1.9-.2 2.7-.5" /> : <><path strokeLinecap="round" strokeLinejoin="round" d="M2.8 9.7a.5.5 0 0 0 0 .6c1 1.4 4.4 5.5 9.2 5.5s8.2-4.1 9.2-5.5a.5.5 0 0 0 0-.6C20.2 8.3 16.8 4.2 12 4.2S3.8 8.3 2.8 9.7Z" /><circle cx="12" cy="10" r="2.5" /></>}</svg>;
}

export default function Home() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("demo@milmo.jp");
  const [loading, setLoading] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    saveDemoSession({
      ...createDemoUser(email, "headquarters"),
      name: "デモユーザー",
      roleLabel: "全機能アクセス",
      office: "全営業所",
    });
    window.setTimeout(() => router.push("/dashboard"), 450);
  }

  return <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-5 py-10 text-[#0F172A]">
    <div aria-hidden="true" className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-[#2563EB]/[0.07] blur-2xl" />
    <div aria-hidden="true" className="absolute -bottom-40 -right-28 h-96 w-96 rounded-full bg-[#EF4444]/[0.05] blur-3xl" />
    <section className="relative w-full max-w-[460px]">
      <div className="mb-7 text-center"><p className="font-logo text-[3.3rem] font-bold leading-none tracking-[-0.025em] text-[#2563EB]">milmo<span className="text-[#EF4444]">.</span></p><h1 className="mt-5 text-2xl font-bold tracking-tight">ログイン</h1><p className="mt-2 text-sm leading-6 text-slate-500">すべての機能をデモでお試しいただけます</p></div>
      <div className="rounded-3xl border border-[#E5E7EB] bg-[#F8FAFC] p-6 shadow-[0_20px_55px_-32px_rgba(15,23,42,0.35)] sm:p-8">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div><label className="mb-2 block text-sm font-semibold" htmlFor="email">メールアドレス</label><input autoComplete="email" className="h-12 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 text-[15px] outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10" id="email" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} /></div>
          <div><label className="mb-2 block text-sm font-semibold" htmlFor="password">パスワード</label><div className="relative"><input autoComplete="current-password" className="h-12 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 pr-12 text-[15px] outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10" defaultValue="milmo-demo" id="password" required type={showPassword ? "text" : "password"} /><button aria-label={showPassword ? "パスワードを非表示にする" : "パスワードを表示する"} className="absolute right-1 top-1 flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-[#2563EB]" onClick={() => setShowPassword((current) => !current)} type="button"><EyeIcon hidden={showPassword} /></button></div></div>
          <div className="rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-3 text-xs leading-5 text-blue-700">デモ版のため、入力内容は外部へ送信されません。初期値のままログインできます。</div>
          <button className="flex h-12 w-full items-center justify-center rounded-xl bg-[#2563EB] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-65" disabled={loading} type="submit">{loading ? <><span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />ログイン中...</> : "ログイン"}</button>
        </form>
      </div>
    </section>
  </main>;
}
