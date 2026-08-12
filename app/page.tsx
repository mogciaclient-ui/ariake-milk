"use client";

import Image from "next/image";
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

  return <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#eef6ff] px-4 py-8 text-[#0F172A] sm:px-6">
    <div aria-hidden="true" className="absolute inset-0 hidden bg-[url('/milmo-pc.png')] bg-cover bg-center bg-no-repeat md:block" />
    <div aria-hidden="true" className="absolute inset-0 bg-[url('/milmo-responsive.png')] bg-cover bg-center bg-no-repeat md:hidden" />
    <div aria-hidden="true" className="absolute inset-0 bg-white/5 backdrop-blur-[0.5px]" />

    <section className="relative z-10 w-full max-w-[440px] md:-translate-y-6">
      <div className="rounded-[2rem] border border-white/80 bg-white/88 p-5 shadow-[0_28px_80px_-32px_rgba(37,99,235,0.35)] backdrop-blur-xl sm:p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center gap-3">
            <Image src="/milmo.png" alt="milmo" width={52} height={52} className="rounded-2xl shadow-sm" priority />
            <p className="font-logo text-[2.8rem] font-normal leading-none text-[#2563EB]">milmo<span className="text-[#EF4444]">.</span></p>
          </div>
          <h1 className="mt-5 text-xl font-bold tracking-tight sm:text-2xl">管理画面へログイン</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">配送・契約・売上業務をひとつの画面で</p>
        </div>

        <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
          <div><label className="mb-2 block text-sm font-semibold" htmlFor="email">メールアドレス</label><input autoComplete="email" className="h-12 w-full rounded-xl border border-slate-200 bg-white/95 px-4 text-[15px] shadow-sm outline-none transition placeholder:text-slate-300 focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10" id="email" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} /></div>
          <div><div className="mb-2 flex items-center justify-between"><label className="block text-sm font-semibold" htmlFor="password">パスワード</label><button type="button" className="text-xs font-bold text-[#2563EB]">パスワードを忘れた方</button></div><div className="relative"><input autoComplete="current-password" className="h-12 w-full rounded-xl border border-slate-200 bg-white/95 px-4 pr-12 text-[15px] shadow-sm outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10" defaultValue="milmo-demo" id="password" required type={showPassword ? "text" : "password"} /><button aria-label={showPassword ? "パスワードを非表示にする" : "パスワードを表示する"} className="absolute right-1 top-1 flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-[#2563EB]" onClick={() => setShowPassword((current) => !current)} type="button"><EyeIcon hidden={showPassword} /></button></div></div>
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-500"><input type="checkbox" defaultChecked className="h-4 w-4 rounded border-slate-300 accent-[#2563EB]" />ログイン状態を保持する</label>
          <button className="flex h-12 w-full items-center justify-center rounded-xl bg-[#2563EB] px-5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:opacity-65" disabled={loading} type="submit">{loading ? <><span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />ログイン中...</> : "ログイン"}</button>
        </form>

        <div className="mt-5 rounded-xl border border-blue-100/80 bg-blue-50/80 px-4 py-3 text-center text-xs leading-5 text-blue-700">デモ環境です。初期値のままログインできます。</div>
      </div>
      <p className="mt-4 text-center text-[11px] font-semibold text-slate-500/80">© 2026 milmo. All rights reserved.</p>
    </section>
  </main>;
}
