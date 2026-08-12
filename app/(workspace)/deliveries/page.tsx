"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PageHeading, StatusBadge } from "@/components/page-heading";
import { demoDeliveries } from "@/lib/demo";
import { useDemoOffice } from "@/lib/demo-office";

type DeliveryStatus = "pending" | "preparing" | "delivering" | "completed" | "absent" | "redelivery";
type Delivery = (typeof demoDeliveries)[number] & { status: DeliveryStatus; phone: string; note: string; time: string; route: string; staff: string };

const statusData: Record<DeliveryStatus, { label: string; tone: "slate" | "blue" | "green" | "red" | "amber" }> = {
  pending: { label: "未配達", tone: "slate" },
  preparing: { label: "準備中", tone: "amber" },
  delivering: { label: "配送中", tone: "blue" },
  completed: { label: "完了", tone: "green" },
  absent: { label: "不在", tone: "red" },
  redelivery: { label: "再配達", tone: "amber" },
};

const initialItems: Delivery[] = demoDeliveries.map((item, index) => ({
  ...item,
  status: item.status as DeliveryStatus,
  phone: `090-1234-${String(5600 + index).padStart(4, "0")}`,
  note: index === 0 ? "玄関横の宅配ボックスへ" : index === 2 ? "呼び鈴不要。勝手口へ" : "手渡し希望",
  time: `${9 + index}:00〜${10 + index}:00`,
  route: index < 3 ? "有明 Aコース" : "有明 Bコース",
  staff: index < 3 ? "中村 大輔" : "松本 翔太",
}));

export default function DeliveriesPage() {
  const { office } = useDemoOffice();
  const [items, setItems] = useState(initialItems);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | DeliveryStatus>("all");
  const [route, setRoute] = useState("すべてのコース");
  const [selectedId, setSelectedId] = useState(initialItems[2]?.id ?? initialItems[0].id);
  const [orderMode, setOrderMode] = useState(false);

  const shown = useMemo(() => items.filter((item) => {
    const matchesQuery = `${item.customer}${item.address}${item.items}`.includes(query);
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesRoute = route === "すべてのコース" || item.route === route;
    return matchesQuery && matchesStatus && matchesRoute;
  }), [items, query, statusFilter, route]);
  const selected = items.find((item) => item.id === selectedId) ?? items[0];
  const completed = items.filter((item) => item.status === "completed").length;
  const active = items.filter((item) => item.status === "delivering").length;
  const issues = items.filter((item) => item.status === "absent" || item.status === "redelivery").length;
  const progress = Math.round(completed / items.length * 100);

  function updateStatus(id: string, status: DeliveryStatus) {
    setItems((current) => current.map((item) => item.id === id ? { ...item, status } : item));
  }

  function move(id: string, direction: -1 | 1) {
    setItems((current) => {
      const index = current.findIndex((item) => item.id === id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((item, order) => ({ ...item, order: order + 1 }));
    });
  }

  return <div className="mx-auto max-w-[1500px]">
    <PageHeading title="配送管理" description={`2026年8月12日（水）・${office.name}の配送状況`} action={<div className="flex gap-2"><Link href="/mobile/deliveries" className="rounded-xl border border-[#2563EB] bg-white px-4 py-2.5 text-sm font-bold text-[#2563EB]">スマホ表示</Link><button onClick={() => setOrderMode((current) => !current)} className="rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-bold text-white">{orderMode ? "並び順を確定" : "配送順を編集"}</button></div>} />

    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryCard label="本日の配送" value={`${items.length}件`} note="2コース稼働" color="blue" />
      <SummaryCard label="配送完了" value={`${completed}件`} note={`進捗 ${progress}%`} color="green" />
      <SummaryCard label="配送中" value={`${active}件`} note="予定どおり" color="blue" />
      <SummaryCard label="要対応" value={`${issues}件`} note="不在・再配達" color="red" />
    </section>

    <section className="mt-5 rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
      <div className="grid gap-3 lg:grid-cols-[180px_210px_210px_1fr]">
        <input type="date" defaultValue="2026-08-12" className="h-11 rounded-xl border border-[#E5E7EB] px-3 text-sm font-bold" />
        <select value={route} onChange={(event) => setRoute(event.target.value)} className="h-11 rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm font-bold"><option>すべてのコース</option><option>有明 Aコース</option><option>有明 Bコース</option></select>
        <select className="h-11 rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm font-bold"><option>すべての配達員</option><option>中村 大輔</option><option>松本 翔太</option></select>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="顧客名・住所・商品で検索" className="h-11 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 text-sm outline-none focus:border-[#2563EB]" />
      </div>
      <div className="mt-4 flex gap-2 overflow-x-auto">{([['all','すべて'],['pending','未配達'],['preparing','準備中'],['delivering','配送中'],['completed','完了'],['absent','不在'],['redelivery','再配達']] as const).map(([value, label]) => <button key={value} onClick={() => setStatusFilter(value)} className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold ${statusFilter === value ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>{label}</button>)}</div>
    </section>

    <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_390px]">
      <section className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4"><div><h2 className="font-bold">配送先一覧</h2><p className="mt-1 text-xs text-slate-400">{shown.length}件を表示中</p></div><div className="flex items-center gap-2 text-xs font-bold text-slate-400"><span className="h-2 w-2 rounded-full bg-emerald-500" />リアルタイム更新</div></div>
        <div className="divide-y divide-[#E5E7EB]">{shown.map((item) => <div key={item.id} role="button" tabIndex={0} onClick={() => setSelectedId(item.id)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setSelectedId(item.id); }} className={`grid w-full cursor-pointer gap-3 p-4 text-left transition hover:bg-blue-50/40 md:grid-cols-[48px_1.2fr_1fr_120px_auto] md:items-center ${selectedId === item.id ? "bg-blue-50/70" : ""}`}>
          <div className="flex items-center gap-1">{orderMode && <span onClick={(event) => event.stopPropagation()} className="flex flex-col"><button onClick={() => move(item.id, -1)} className="text-[10px] text-slate-400 hover:text-[#2563EB]">▲</button><button onClick={() => move(item.id, 1)} className="text-[10px] text-slate-400 hover:text-[#2563EB]">▼</button></span>}<span className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${item.status === "completed" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{item.status === "completed" ? "✓" : item.order}</span></div>
          <div><div className="flex items-center gap-2"><p className="font-bold">{item.customer}</p><StatusBadge tone={statusData[item.status].tone}>{statusData[item.status].label}</StatusBadge></div><p className="mt-1 text-xs text-slate-500">{item.address}</p></div>
          <div><p className="text-sm font-semibold text-[#2563EB]">{item.items}</p><p className="mt-1 text-xs text-slate-400">{item.note}</p></div>
          <div><p className="text-xs font-bold text-slate-600">{item.time}</p><p className="mt-1 text-xs text-slate-400">{item.staff}</p></div>
          <span className="text-sm text-slate-300">›</span>
        </div>)}</div>
        {shown.length === 0 && <div className="py-16 text-center text-sm text-slate-400">条件に一致する配送先がありません</div>}
      </section>

      <aside className="h-fit overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm xl:sticky xl:top-24">
        <div className="bg-[#2563EB] p-5 text-white"><div className="flex items-start justify-between"><div><p className="text-xs font-bold text-blue-100">配送番号 {selected.id}</p><h2 className="mt-1 text-xl font-bold">{selected.customer}</h2></div><StatusBadge tone={statusData[selected.status].tone}>{statusData[selected.status].label}</StatusBadge></div><p className="mt-3 text-sm text-blue-100">{selected.address}</p></div>
        <div className="p-5"><div className="grid grid-cols-2 gap-3">{[["配送時間", selected.time], ["担当者", selected.staff], ["コース", selected.route], ["順番", `${selected.order}番`]].map(([label, value]) => <div key={label} className="rounded-xl bg-[#F8FAFC] p-3"><p className="text-[11px] font-bold text-slate-400">{label}</p><p className="mt-1 text-sm font-bold">{value}</p></div>)}</div><div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/60 p-4"><p className="text-xs font-bold text-blue-500">配送商品</p><p className="mt-1 text-sm font-bold text-blue-900">{selected.items}</p></div><div className="mt-3 rounded-xl border border-amber-100 bg-amber-50/60 p-4"><p className="text-xs font-bold text-amber-600">配送メモ</p><p className="mt-1 text-sm text-amber-900">{selected.note}</p></div><textarea className="mt-3 h-20 w-full rounded-xl border border-[#E5E7EB] p-3 text-sm outline-none focus:border-[#2563EB]" placeholder="配達員への連絡メモ" /><div className="mt-4 grid grid-cols-2 gap-2"><a href={`tel:${selected.phone}`} className="rounded-xl border border-[#E5E7EB] py-3 text-center text-sm font-bold text-slate-600">電話する</a><button onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selected.address)}`, "_blank")} className="rounded-xl border border-[#E5E7EB] py-3 text-sm font-bold text-slate-600">地図を開く</button></div><div className="mt-2 grid grid-cols-3 gap-2"><button onClick={() => updateStatus(selected.id, "absent")} className="rounded-xl border border-red-200 py-3 text-xs font-bold text-red-600">不在</button><button onClick={() => updateStatus(selected.id, "redelivery")} className="rounded-xl border border-amber-200 py-3 text-xs font-bold text-amber-700">再配達</button><button onClick={() => updateStatus(selected.id, selected.status === "delivering" ? "completed" : "delivering")} className="rounded-xl bg-[#2563EB] py-3 text-xs font-bold text-white">{selected.status === "delivering" ? "完了" : "配送開始"}</button></div></div>
      </aside>
    </div>
  </div>;
}

function SummaryCard({ label, value, note, color }: { label: string; value: string; note: string; color: "blue" | "green" | "red" }) {
  return <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><p className="text-sm font-semibold text-slate-500">{label}</p><span className={`h-2.5 w-2.5 rounded-full ${color === "green" ? "bg-emerald-500" : color === "red" ? "bg-red-500" : "bg-blue-500"}`} /></div><p className="mt-3 text-3xl font-bold tracking-tight">{value}</p><p className="mt-2 text-xs font-semibold text-slate-400">{note}</p></div>;
}
