"use client";

import { useState } from "react";
import { PageHeading, StatusBadge } from "@/components/page-heading";

export default function LinePage() {
  const [handled, setHandled] = useState<string[]>([]);
  const messages = [
    { id: "m1", name: "山田 花子", text: "次回、ヨーグルトを2本追加できますか？", time: "10:32", linked: true },
    { id: "m2", name: "みっちゃん", text: "配送日を金曜日に変えたいです。", time: "09:48", linked: false },
    { id: "m3", name: "鈴木 一郎", text: "今月の請求額を教えてください。", time: "昨日", linked: true },
  ];
  return <div className="mx-auto max-w-7xl"><PageHeading title="LINE管理" description="顧客からのメッセージとLINE注文を確認" action={<StatusBadge tone="green">LINE接続：デモ</StatusBadge>} />
    <div className="grid gap-4 sm:grid-cols-3"><div className="rounded-2xl border border-[#E5E7EB] bg-white p-5"><p className="text-sm text-slate-500">友だち数</p><p className="mt-2 text-3xl font-bold">2,184</p><p className="mt-2 text-xs text-emerald-600">今月 +48</p></div><div className="rounded-2xl border border-[#E5E7EB] bg-white p-5"><p className="text-sm text-slate-500">未対応メッセージ</p><p className="mt-2 text-3xl font-bold">{Math.max(0, 3 - handled.length)}</p><p className="mt-2 text-xs text-red-600">要確認</p></div><div className="rounded-2xl border border-[#E5E7EB] bg-white p-5"><p className="text-sm text-slate-500">LINE注文</p><p className="mt-2 text-3xl font-bold">18</p><p className="mt-2 text-xs text-slate-400">今月</p></div></div>
    <section className="mt-6 rounded-2xl border border-[#E5E7EB] bg-white shadow-sm"><div className="flex items-center justify-between border-b border-[#E5E7EB] p-5"><h2 className="font-bold">新着メッセージ</h2><button className="text-sm font-bold text-[#2563EB]">すべて見る</button></div><div className="divide-y divide-[#E5E7EB]">{messages.map((message) => <div key={message.id} className={`flex flex-col gap-4 p-5 sm:flex-row sm:items-center ${handled.includes(message.id) ? "opacity-55" : ""}`}><div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">{message.name.slice(0, 1)}</div><div className="flex-1"><div className="flex items-center gap-2"><p className="font-bold">{message.name}</p>{message.linked ? <StatusBadge tone="blue">顧客連携済み</StatusBadge> : <StatusBadge tone="amber">未連携</StatusBadge>}<span className="ml-auto text-xs text-slate-400">{message.time}</span></div><p className="mt-2 text-sm text-slate-600">{message.text}</p></div><button onClick={() => setHandled((current) => current.includes(message.id) ? current : [...current, message.id])} className="rounded-lg border border-[#E5E7EB] px-3 py-2 text-xs font-bold text-slate-600">{handled.includes(message.id) ? "対応済み" : "対応する"}</button></div>)}</div></section>
    <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5"><p className="font-bold text-amber-800">デモでのLINE連携</p><p className="mt-2 text-sm leading-6 text-amber-700">現在はモックデータです。Webhook、配信、顧客紐付けは、採用判断後にサーバーAPIとLINE Messaging APIへ接続します。</p></div>
  </div>;
}
