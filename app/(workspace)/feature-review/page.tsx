"use client";

import { useMemo, useState } from "react";
import { PageHeading, StatusBadge } from "@/components/page-heading";
import { legacyCategories, legacyFeatures } from "@/lib/legacy-features";

type Decision = "needed" | "pending" | "unneeded";

const decisionData: Record<Decision, { label: string; active: string }> = {
  needed: { label: "必要", active: "border-emerald-500 bg-emerald-500 text-white" },
  pending: { label: "保留", active: "border-amber-500 bg-amber-500 text-white" },
  unneeded: { label: "不要", active: "border-red-500 bg-red-500 text-white" },
};

export default function FeatureReviewPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("すべて");
  const [scope, setScope] = useState<"all" | "office" | "headquarters">("all");
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});

  const shown = useMemo(() => legacyFeatures.filter((feature) => {
    const matchesQuery = `${feature.category}${feature.name}${feature.description}`.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = category === "すべて" || feature.category === category;
    const matchesScope = scope === "all" || feature.scope === scope;
    return matchesQuery && matchesCategory && matchesScope;
  }), [query, category, scope]);

  const counts = Object.values(decisions).reduce((result, decision) => ({ ...result, [decision]: result[decision] + 1 }), { needed: 0, pending: 0, unneeded: 0 });

  function decide(id: string, decision: Decision) {
    setDecisions((current) => ({ ...current, [id]: decision }));
  }

  return <div className="mx-auto max-w-7xl">
    <PageHeading title="現行機能の選別" description={`現行管理画面のスクリーンショットから抽出した ${legacyFeatures.length}機能`} action={<button onClick={() => window.print()} className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-bold text-slate-600 shadow-sm">選別結果を印刷</button>} />

    <div className="mb-6 grid gap-3 sm:grid-cols-4">
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4"><p className="text-xs font-bold text-slate-400">全機能</p><p className="mt-2 text-2xl font-bold">{legacyFeatures.length}</p></div>
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4"><p className="text-xs font-bold text-emerald-600">必要</p><p className="mt-2 text-2xl font-bold text-emerald-700">{counts.needed}</p></div>
      <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4"><p className="text-xs font-bold text-amber-600">保留</p><p className="mt-2 text-2xl font-bold text-amber-700">{counts.pending}</p></div>
      <div className="rounded-2xl border border-red-100 bg-red-50/60 p-4"><p className="text-xs font-bold text-red-600">不要</p><p className="mt-2 text-2xl font-bold text-red-700">{counts.unneeded}</p></div>
    </div>

    <div className="rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
      <div className="grid gap-3 border-b border-[#E5E7EB] p-4 lg:grid-cols-[1fr_220px_auto]">
        <div className="relative"><svg className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="機能名・業務内容で検索" className="h-12 w-full rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] pl-11 pr-4 text-sm outline-none focus:border-[#2563EB]" /></div>
        <select aria-label="機能分類" value={category} onChange={(event) => setCategory(event.target.value)} className="h-12 rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-semibold"><option>すべて</option>{legacyCategories.map((item) => <option key={item}>{item}</option>)}</select>
        <div className="flex rounded-xl bg-[#F8FAFC] p-1">{[["all", "すべて"], ["office", "営業所"], ["headquarters", "本部"]].map(([value, label]) => <button key={value} onClick={() => setScope(value as typeof scope)} className={`rounded-lg px-4 py-2 text-xs font-bold ${scope === value ? "bg-white text-[#2563EB] shadow-sm" : "text-slate-500"}`}>{label}</button>)}</div>
      </div>

      <div className="divide-y divide-[#E5E7EB]">{shown.map((feature) => <article key={feature.id} className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center">
        <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="font-bold">{feature.name}</h2><StatusBadge tone={feature.scope === "headquarters" ? "red" : "blue"}>{feature.scope === "headquarters" ? "本部専用" : "営業所共通"}</StatusBadge><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">{feature.category}</span></div><p className="mt-2 text-sm text-slate-500">{feature.description}</p></div>
        <div className="flex shrink-0 gap-2">{(Object.keys(decisionData) as Decision[]).map((decision) => <button key={decision} onClick={() => decide(feature.id, decision)} className={`min-w-16 rounded-lg border px-3 py-2 text-xs font-bold transition ${decisions[feature.id] === decision ? decisionData[decision].active : "border-[#E5E7EB] bg-white text-slate-500 hover:bg-slate-50"}`}>{decisionData[decision].label}</button>)}</div>
      </article>)}</div>
      {shown.length === 0 && <div className="py-16 text-center text-sm text-slate-500">条件に一致する機能がありません</div>}
    </div>
    <p className="mt-4 text-center text-xs text-slate-400">選択内容は現在のブラウザ表示中のみ保持されるデモ仕様です。</p>
  </div>;
}
