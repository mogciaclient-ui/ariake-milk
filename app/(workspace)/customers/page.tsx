"use client";

import { useMemo, useState } from "react";
import { PageHeading, StatusBadge } from "@/components/page-heading";
import { demoCustomers } from "@/lib/demo";
import { useDemoOffice } from "@/lib/demo-office";

export default function CustomersPage() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<(typeof demoCustomers)[number] | null>(null);
  const { office } = useDemoOffice();
  const filtered = useMemo(() => demoCustomers.filter((customer) => {
    const belongsToOffice = office.id === "all" || customer.office === office.name;
    return belongsToOffice && `${customer.name}${customer.kana}${customer.id}${customer.area}`.toLowerCase().includes(query.toLowerCase());
  }), [query, office]);

  return <div className="mx-auto max-w-7xl"><PageHeading title="顧客管理" description={`${office.name}・契約顧客 ${filtered.length.toLocaleString()}件（デモデータ）`} action={<button onClick={() => alert("顧客登録フォームは次回のデモ候補です")} className="rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-bold text-white shadow-sm">＋ 顧客を登録</button>} />
    <div className="rounded-2xl border border-[#E5E7EB] bg-white shadow-sm"><div className="flex flex-col gap-3 border-b border-[#E5E7EB] p-4 sm:flex-row"><div className="relative flex-1"><svg className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="氏名・顧客番号・住所で検索" className="h-12 w-full rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] pl-11 pr-4 text-sm outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10" /></div><select className="h-12 rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-semibold text-slate-600"><option>すべての契約状態</option><option>契約中</option><option>一時休止</option></select></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[860px] text-left"><thead className="bg-[#F8FAFC] text-xs font-bold text-slate-500"><tr><th className="px-5 py-4">顧客</th><th className="px-5 py-4">エリア</th><th className="px-5 py-4">契約商品</th><th className="px-5 py-4">配送</th><th className="px-5 py-4">担当営業</th><th className="px-5 py-4">状態</th></tr></thead><tbody className="divide-y divide-[#E5E7EB]">{filtered.map((customer) => <tr key={customer.id} onClick={() => setSelected(customer)} className="cursor-pointer transition hover:bg-blue-50/40"><td className="px-5 py-4"><p className="text-sm font-bold">{customer.name}</p><p className="mt-1 text-xs text-slate-400">{customer.id}</p></td><td className="px-5 py-4 text-sm text-slate-600">{customer.area}</td><td className="px-5 py-4 text-sm text-slate-600">{customer.product}</td><td className="px-5 py-4 text-sm font-semibold">{customer.delivery}</td><td className="px-5 py-4 text-sm text-slate-600">{customer.sales}</td><td className="px-5 py-4"><StatusBadge tone={customer.status === "契約中" ? "green" : customer.status === "一時休止" ? "amber" : "blue"}>{customer.status}</StatusBadge></td></tr>)}</tbody></table></div>
      {filtered.length === 0 && <div className="py-16 text-center text-sm text-slate-500">条件に一致する顧客がいません</div>}
    </div>
    {selected && <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30" onClick={() => setSelected(null)}><aside className="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="flex items-start justify-between"><div><p className="text-xs font-bold text-[#2563EB]">{selected.id}</p><h2 className="mt-2 text-2xl font-bold">{selected.name}</h2><p className="mt-1 text-sm text-slate-400">{selected.kana}</p></div><button onClick={() => setSelected(null)} className="rounded-lg bg-slate-100 p-2 text-slate-500">✕</button></div><div className="mt-6 rounded-2xl bg-[#F8FAFC] p-4"><div className="flex items-center justify-between"><span className="text-sm font-semibold text-slate-500">契約状態</span><StatusBadge tone="green">{selected.status}</StatusBadge></div></div><div className="mt-6 space-y-5">{[["電話番号", selected.phone], ["住所", selected.area], ["契約商品", selected.product], ["配送曜日", selected.delivery], ["担当営業", selected.sales], ["営業所", selected.office]].map(([label, value]) => <div key={label} className="border-b border-[#E5E7EB] pb-4"><p className="text-xs font-semibold text-slate-400">{label}</p><p className="mt-1.5 text-sm font-semibold">{value}</p></div>)}</div><button className="mt-7 w-full rounded-xl bg-[#2563EB] py-3 text-sm font-bold text-white">顧客詳細を開く</button></aside></div>}
  </div>;
}
