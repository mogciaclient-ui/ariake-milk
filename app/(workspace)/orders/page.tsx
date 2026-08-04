"use client";

import { useState } from "react";
import { PageHeading, StatusBadge } from "@/components/page-heading";
import { demoOrders } from "@/lib/demo";
import { useDemoOffice } from "@/lib/demo-office";

export default function OrdersPage() {
  const { office } = useDemoOffice();
  const [orders, setOrders] = useState(demoOrders);
  const [filter, setFilter] = useState("すべて");
  const shown = filter === "すべて" ? orders : orders.filter((order) => order.status === filter);
  function confirm(id: string) { setOrders((current) => current.map((order) => order.id === id ? { ...order, status: "確定" } : order)); }
  return <div className="mx-auto max-w-7xl"><PageHeading title="注文管理" description={`${office.name}・管理画面、電話、LINEからの注文を一元管理`} action={<button className="rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-bold text-white">＋ 注文を登録</button>} />
    <div className="mb-4 flex gap-2 overflow-x-auto pb-1">{["すべて", "確認待ち", "確定", "準備中", "配送中"].map((item) => <button key={item} onClick={() => setFilter(item)} className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold ${filter === item ? "bg-[#0F172A] text-white" : "border border-[#E5E7EB] bg-white text-slate-500"}`}>{item}</button>)}</div>
    <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[840px] text-left"><thead className="bg-[#F8FAFC] text-xs font-bold text-slate-500"><tr><th className="px-5 py-4">注文番号</th><th className="px-5 py-4">顧客</th><th className="px-5 py-4">注文経路</th><th className="px-5 py-4">商品</th><th className="px-5 py-4">金額</th><th className="px-5 py-4">状態</th><th className="px-5 py-4" /></tr></thead><tbody className="divide-y divide-[#E5E7EB]">{shown.map((order) => <tr key={order.id} className="hover:bg-blue-50/30"><td className="px-5 py-4"><p className="text-sm font-bold">{order.id}</p><p className="mt-1 text-xs text-slate-400">{order.date}</p></td><td className="px-5 py-4 text-sm font-semibold">{order.customer}</td><td className="px-5 py-4"><StatusBadge tone={order.channel === "LINE" ? "green" : order.channel === "電話" ? "amber" : "slate"}>{order.channel}</StatusBadge></td><td className="px-5 py-4 text-sm text-slate-600">{order.item}</td><td className="px-5 py-4 text-sm font-bold">¥{order.amount.toLocaleString()}</td><td className="px-5 py-4"><StatusBadge tone={order.status === "確認待ち" ? "red" : order.status === "確定" ? "blue" : "amber"}>{order.status}</StatusBadge></td><td className="px-5 py-4">{order.status === "確認待ち" ? <button onClick={() => confirm(order.id)} className="rounded-lg bg-[#2563EB] px-3 py-2 text-xs font-bold text-white">確認する</button> : <button className="text-xs font-bold text-[#2563EB]">詳細 →</button>}</td></tr>)}</tbody></table></div></div>
  </div>;
}
