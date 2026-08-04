"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { demoDeliveries } from "@/lib/demo";
import { clearDemoSession, getDemoSession } from "@/lib/demo-session";

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
  if (!ready) return <div className="min-h-screen bg-[#F8FAFC]" />;
  const completed = items.filter((item) => item.status === "completed").length;
  return <main className="mx-auto min-h-screen max-w-lg bg-[#F8FAFC] pb-28 text-[#0F172A]"><header className="sticky top-0 z-10 bg-[#2563EB] px-5 pb-5 pt-4 text-white"><div className="flex items-center justify-between"><span className="font-logo text-3xl font-bold">milmo<span className="text-red-300">.</span></span><button onClick={() => { clearDemoSession(); router.push("/"); }} className="rounded-lg bg-white/15 px-3 py-2 text-xs font-bold">終了</button></div><p className="mt-5 text-sm font-semibold text-blue-100">有明 Aルート・中村 大輔</p><div className="mt-2 flex items-end justify-between"><h1 className="text-2xl font-bold">今日の配送</h1><p className="text-sm font-bold">{completed} / {items.length}件完了</p></div><div className="mt-4 h-2 rounded-full bg-white/20"><div className="h-full rounded-full bg-white transition-all" style={{ width: `${completed / items.length * 100}%` }} /></div></header><div className="space-y-3 p-4">{items.map((item) => <article key={item.id} className={`rounded-2xl border bg-white p-5 shadow-sm ${item.status === "delivering" ? "border-[#2563EB] ring-2 ring-[#2563EB]/10" : "border-[#E5E7EB]"}`}><div className="flex items-start gap-4"><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${item.status === "completed" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{item.status === "completed" ? "✓" : item.order}</span><div className="flex-1"><div className="flex justify-between gap-2"><h2 className="font-bold">{item.customer}</h2><span className="text-xs font-bold text-slate-400">{item.status === "completed" ? "完了" : item.status === "delivering" ? "配送中" : "未配達"}</span></div><p className="mt-1 text-sm text-slate-500">{item.address}</p><p className="mt-3 rounded-lg bg-[#F8FAFC] px-3 py-2 text-sm font-semibold text-[#2563EB]">{item.items}</p>{item.status !== "completed" && <div className="mt-4 grid grid-cols-2 gap-2"><button onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.address)}`, "_blank")} className="h-12 rounded-xl border border-[#E5E7EB] text-sm font-bold text-slate-600">地図を開く</button><button onClick={() => setItems((current) => current.map((currentItem) => currentItem.id === item.id ? { ...currentItem, status: item.status === "pending" ? "delivering" : "completed" } : currentItem))} className="h-12 rounded-xl bg-[#2563EB] text-sm font-bold text-white">{item.status === "pending" ? "配送開始" : "配送完了"}</button></div>}</div></div></article>)}</div></main>;
}
