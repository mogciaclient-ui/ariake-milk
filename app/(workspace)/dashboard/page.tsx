"use client";

import Link from "next/link";
import { PageHeading, StatusBadge } from "@/components/page-heading";
import { useDemoOffice } from "@/lib/demo-office";

const stats = [
  { label: "本日の配送", value: "128", unit: "件", note: "完了 84件", color: "blue" },
  { label: "契約顧客", value: "2,846", unit: "名", note: "前月比 +32", color: "green" },
  { label: "未確認の注文", value: "12", unit: "件", note: "LINE注文 8件", color: "amber" },
  { label: "今月の売上", value: "¥8.42", unit: "M", note: "目標達成率 92%", color: "red" },
];

export default function DashboardPage() {
  const { office } = useDemoOffice();
  const officeStats = office.id === "all" ? stats : office.id === "head-office" ? [
    { ...stats[0], value: "76", note: "完了 51件" },
    { ...stats[1], value: "1,724", note: "前月比 +18" },
    { ...stats[2], value: "7", note: "LINE注文 5件" },
    { ...stats[3], value: "¥5.08", note: "目標達成率 94%" },
  ] : [
    { ...stats[0], value: "52", note: "完了 33件" },
    { ...stats[1], value: "1,122", note: "前月比 +14" },
    { ...stats[2], value: "5", note: "LINE注文 3件" },
    { ...stats[3], value: "¥3.34", note: "目標達成率 89%" },
  ];
  return <div className="mx-auto max-w-7xl"><PageHeading title="ダッシュボード" description={`2026年8月5日（水） ${office.name}の状況`} />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{officeStats.map((stat) => <div key={stat.label} className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><p className="text-sm font-semibold text-slate-500">{stat.label}</p><span className={`h-2.5 w-2.5 rounded-full ${stat.color === "blue" ? "bg-blue-500" : stat.color === "green" ? "bg-emerald-500" : stat.color === "amber" ? "bg-amber-500" : "bg-red-500"}`} /></div><div className="mt-4 flex items-baseline gap-1"><span className="text-3xl font-bold tracking-tight">{stat.value}</span><span className="text-sm font-semibold text-slate-500">{stat.unit}</span></div><p className="mt-2 text-xs font-semibold text-slate-400">{stat.note}</p></div>)}</div>
    <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
      <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm sm:p-6"><div className="flex items-center justify-between"><div><h2 className="font-bold">配送進捗</h2><p className="mt-1 text-xs text-slate-500">本日の全5ルート</p></div><Link href="/deliveries" className="text-sm font-bold text-[#2563EB]">詳細を見る →</Link></div><div className="mt-6 space-y-5">{[["有明 Aルート", "中村 大輔", 92], ["有明 Bルート", "松本 翔太", 68], ["豊洲 Aルート", "小林 直樹", 45], ["晴海ルート", "加藤 健", 20]].map(([route, person, progress]) => <div key={String(route)}><div className="mb-2 flex justify-between text-sm"><span className="font-semibold">{route} <span className="ml-2 text-xs font-normal text-slate-400">{person}</span></span><span className="font-bold text-[#2563EB]">{progress}%</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#2563EB]" style={{ width: `${progress}%` }} /></div></div>)}</div></section>
      <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm sm:p-6"><div className="flex items-center justify-between"><h2 className="font-bold">対応が必要です</h2><span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600">5件</span></div><div className="mt-4 divide-y divide-[#E5E7EB]">{[["LINE注文の確認", "8件の新規注文", "amber"], ["再配達の調整", "本日中 2件", "red"], ["契約更新の確認", "今週期限 4件", "blue"], ["商品変更申請", "承認待ち 3件", "slate"]].map(([title, text, tone]) => <button key={String(title)} className="flex w-full items-center justify-between py-4 text-left"><div><p className="text-sm font-bold">{title}</p><p className="mt-1 text-xs text-slate-500">{text}</p></div><StatusBadge tone={tone as "blue" | "amber" | "red" | "slate"}>確認</StatusBadge></button>)}</div></section>
    </div>
    <section className="mt-6 rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm sm:p-6"><h2 className="font-bold">主要機能</h2><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[["顧客を探す", "/customers", "契約・担当・配送情報"], ["配送を確認", "/deliveries", "ルート別の進捗"], ["注文を処理", "/orders", "全経路の注文"], ["営業活動を見る", "/sales", "実績と次回予定"]].map(([title, href, detail]) => <Link href={href} key={title} className="rounded-xl border border-[#E5E7EB] p-4 transition hover:-translate-y-0.5 hover:border-[#2563EB]/30 hover:shadow-md"><p className="font-bold">{title}</p><p className="mt-2 text-xs text-slate-500">{detail}</p><p className="mt-4 text-xs font-bold text-[#2563EB]">開く →</p></Link>)}</div></section>
  </div>;
}
