"use client";

import { useState } from "react";
import { PageHeading, StatusBadge } from "@/components/page-heading";
import { demoDeliveries } from "@/lib/demo";
import { useDemoOffice } from "@/lib/demo-office";

type DeliveryStatus = "pending" | "delivering" | "completed" | "absent";
const statusData: Record<DeliveryStatus, { label: string; tone: "slate" | "blue" | "green" | "red" }> = { pending: { label: "未配達", tone: "slate" }, delivering: { label: "配送中", tone: "blue" }, completed: { label: "完了", tone: "green" }, absent: { label: "不在", tone: "red" } };

export default function DeliveriesPage() {
  const { office } = useDemoOffice();
  const [items, setItems] = useState(demoDeliveries.map((item) => ({ ...item, status: item.status as DeliveryStatus })));
  const completed = items.filter((item) => item.status === "completed").length;
  function advance(id: string) { setItems((current) => current.map((item) => item.id === id ? { ...item, status: item.status === "pending" ? "delivering" : "completed" } : item)); }

  return <div className="mx-auto max-w-7xl"><PageHeading title="配送管理" description={`2026年8月5日（水）・${office.name}の配送状況`} action={<div className="flex gap-2"><button className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-bold">ルート：A</button><button className="rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-bold text-white">配送順を編集</button></div>} />
    <div className="grid gap-4 sm:grid-cols-3"><div className="rounded-2xl border border-[#E5E7EB] bg-white p-5"><p className="text-sm font-semibold text-slate-500">進捗</p><p className="mt-2 text-3xl font-bold">{completed}<span className="text-base text-slate-400"> / {items.length}件</span></p><div className="mt-4 h-2 rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#2563EB] transition-all" style={{ width: `${completed / items.length * 100}%` }} /></div></div><div className="rounded-2xl border border-[#E5E7EB] bg-white p-5"><p className="text-sm font-semibold text-slate-500">担当スタッフ</p><p className="mt-2 text-xl font-bold">中村 大輔</p><p className="mt-2 text-xs text-slate-400">車両 12-34</p></div><div className="rounded-2xl border border-[#E5E7EB] bg-white p-5"><p className="text-sm font-semibold text-slate-500">予定終了</p><p className="mt-2 text-xl font-bold">14:30</p><p className="mt-2 text-xs font-semibold text-emerald-600">予定より12分早い</p></div></div>
    <section className="mt-6 rounded-2xl border border-[#E5E7EB] bg-white shadow-sm"><div className="border-b border-[#E5E7EB] p-5"><h2 className="font-bold">{office.shortName} Aルート</h2><p className="mt-1 text-xs text-slate-500">顧客を選択してステータスを更新できます</p></div><div className="divide-y divide-[#E5E7EB]">{items.map((item) => <div key={item.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-500">{item.order}</div><div className="min-w-0 flex-1"><div className="flex items-center gap-3"><p className="font-bold">{item.customer}</p><StatusBadge tone={statusData[item.status].tone}>{statusData[item.status].label}</StatusBadge></div><p className="mt-1 text-sm text-slate-500">{item.address}</p><p className="mt-2 text-xs font-semibold text-[#2563EB]">{item.items}</p></div><div className="flex gap-2">{item.status === "pending" && <button onClick={() => setItems((current) => current.map((currentItem) => currentItem.id === item.id ? { ...currentItem, status: "absent" } : currentItem))} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600">不在</button>}{item.status !== "completed" && <button onClick={() => advance(item.id)} className="rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-bold text-white">{item.status === "pending" || item.status === "absent" ? "配送開始" : "完了にする"}</button>}</div></div>)}</div></section>
  </div>;
}
