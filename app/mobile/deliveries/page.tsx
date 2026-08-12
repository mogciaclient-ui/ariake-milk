"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { demoDeliveries } from "@/lib/demo";
import { clearDemoSession, getDemoSession } from "@/lib/demo-session";
import { MilmoLoadingScreen } from "@/components/milmo-loading-screen";

export default function MobileDeliveriesPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [items, setItems] = useState(demoDeliveries);
  useEffect(() => {
    if (!getDemoSession()) {
      router.replace("/");
      return;
    }
    const timer = window.setTimeout(() => setReady(true), 0);
    return () => window.clearTimeout(timer);
  }, [router]);
  if (!ready) return <MilmoLoadingScreen message="配送情報を準備中..." />;
  const completed = items.filter((item) => item.status === "completed").length;
  const pending = items.filter((item) => item.status === "pending").length;
  const delivering = items.filter((item) => item.status === "delivering").length;

  return <main className="min-h-screen bg-[#F8FAFC] pb-24 text-[#0F172A] lg:pb-10">
    <header className="sticky top-0 z-10 bg-[#2563EB] text-white lg:static">
      <div className="mx-auto max-w-7xl px-5 py-3 lg:flex lg:items-center lg:justify-between lg:px-8 lg:py-4">
        <div className="flex items-center justify-between lg:block"><Link href="/dashboard" aria-label="milmo管理画面へ戻る" className="inline-flex rounded-lg font-logo text-3xl font-bold outline-none transition hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/70">milmo<span className="text-red-300">.</span></Link><button onClick={() => { clearDemoSession(); router.push("/"); }} className="rounded-lg bg-white/15 px-3 py-2 text-xs font-bold lg:hidden">終了</button></div>
        <div className="mt-3 lg:mt-0 lg:flex lg:items-center lg:gap-8"><div><p className="text-xs font-semibold text-blue-100">有明 Aルート・中村 大輔</p><div className="mt-0.5 flex items-end justify-between gap-10"><h1 className="text-xl font-bold">今日の配送</h1><p className="text-xs font-bold">{completed} / {items.length}件完了</p></div><div className="mt-2 h-1.5 rounded-full bg-white/20 lg:w-96"><div className="h-full rounded-full bg-white transition-all" style={{ width: `${completed / items.length * 100}%` }} /></div></div><button onClick={() => { clearDemoSession(); router.push("/"); }} className="hidden rounded-lg bg-white/15 px-4 py-2 text-xs font-bold lg:block">業務を終了</button></div>
      </div>
    </header>

    <div className="mx-auto max-w-lg p-4 lg:max-w-7xl lg:px-8 lg:py-6">
      <section className="mb-5 hidden grid-cols-4 gap-4 lg:grid">{[["全配送", items.length, "件"], ["完了", completed, "件"], ["配送中", delivering, "件"], ["未配達", pending, "件"]].map(([label, value, unit]) => <div key={label} className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm"><p className="text-sm font-semibold text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold">{value}<span className="ml-1 text-sm text-slate-400">{unit}</span></p></div>)}</section>
      <div className="space-y-3 lg:grid lg:grid-cols-2 lg:items-start lg:gap-4 lg:space-y-0">{items.map((item) => <article key={item.id} className={`rounded-2xl border bg-white p-5 shadow-sm ${item.status === "delivering" ? "border-[#2563EB] ring-2 ring-[#2563EB]/10" : "border-[#E5E7EB]"}`}><div className="flex items-start gap-4"><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${item.status === "completed" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{item.status === "completed" ? "✓" : item.order}</span><div className="flex-1"><div className="flex justify-between gap-2"><h2 className="font-bold">{item.customer}</h2><span className="text-xs font-bold text-slate-400">{item.status === "completed" ? "完了" : item.status === "delivering" ? "配送中" : item.status === "absent" ? "不在" : "未配達"}</span></div><p className="mt-1 text-sm text-slate-500">{item.address}</p><p className="mt-3 rounded-lg bg-[#F8FAFC] px-3 py-2 text-sm font-semibold text-[#2563EB]">{item.items}</p><p className="mt-2 text-xs text-slate-500">配送メモ：玄関横の宅配ボックスへ</p>{item.status !== "completed" && <><div className="mt-4 grid grid-cols-3 gap-2"><button onClick={() => window.open("tel:09000000000")} className="h-11 rounded-xl border border-[#E5E7EB] text-xs font-bold text-slate-600">電話</button><button onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.address)}`, "_blank")} className="h-11 rounded-xl border border-[#E5E7EB] text-xs font-bold text-slate-600">地図</button><button onClick={() => setItems((current) => current.map((currentItem) => currentItem.id === item.id ? { ...currentItem, status: "absent" } : currentItem))} className="h-11 rounded-xl border border-red-200 text-xs font-bold text-red-600">不在</button></div><textarea className="mt-2 h-16 w-full rounded-xl border border-[#E5E7EB] p-3 text-sm" placeholder="配達メモを入力" /><div className="mt-2 grid grid-cols-[1fr_2fr] gap-2"><button onClick={() => alert("写真を登録しました（デモ）")} className="h-12 rounded-xl border border-[#E5E7EB] text-sm font-bold text-slate-600">写真</button><button onClick={() => setItems((current) => current.map((currentItem) => currentItem.id === item.id ? { ...currentItem, status: item.status === "pending" || item.status === "absent" ? "delivering" : "completed" } : currentItem))} className="h-12 rounded-xl bg-[#2563EB] text-sm font-bold text-white">{item.status === "pending" || item.status === "absent" ? "配送開始" : "配送完了"}</button></div></>}</div></div></article>)}</div>
    </div>
  </main>;
}
