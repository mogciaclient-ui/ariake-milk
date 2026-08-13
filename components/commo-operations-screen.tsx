"use client";

import { useState } from "react";
import { PageHeading } from "@/components/page-heading";
import { useDemoOffice } from "@/lib/demo-office";
import type { DemoScreen } from "@/lib/product-navigation";

const violet = "#7C3AED";
const customers = [
  ["山田 花子", "C-10482", "連携済み", "牛乳・ヨーグルト", "2026/08/12 09:42"],
  ["鈴木 一郎", "C-10479", "連携済み", "牛乳", "2026/08/11 18:20"],
  ["高橋 悦子", "C-10461", "未連携", "休配中", "2026/08/10 12:05"],
  ["伊藤 健二", "C-10435", "連携済み", "コーヒー", "2026/08/09 20:18"],
];
const campaigns = [
  ["夏の健康応援キャンペーン", "2026/08/15 10:00", "予約中", "1,248人", "—"],
  ["ヨーグルト追加提案", "2026/08/10 09:00", "配信済み", "842人", "68.4%"],
  ["休配前リマインド", "2026/08/08 18:00", "配信済み", "126人", "82.1%"],
];

export function CommoOperationsScreen({ screen }: { screen: DemoScreen }) {
  if (screen.slug === "home") return <CommoHome screen={screen} />;
  if (["customer-analysis", "survey-analysis", "analysis-line", "analysis-customers", "analysis-broadcasts", "analysis-conversions"].includes(screen.slug)) return <CommoAnalysis screen={screen} />;
  if (["segment-create", "broadcast-create", "ai-message-create", "settings-auto-classification", "settings-account"].includes(screen.slug)) return <CommoForm screen={screen} />;
  if (screen.slug === "ai-recommendations") return <Recommendations screen={screen} />;
  if (screen.slug === "settings-line") return <LineSettings screen={screen} />;
  return <CommoList screen={screen} />;
}

function Frame({ screen, children, action }: { screen: DemoScreen; children: React.ReactNode; action?: React.ReactNode }) {
  const { office } = useDemoOffice();
  return <div className="mx-auto max-w-7xl"><div className="mb-3 text-xs font-bold text-slate-400">commo. / {screen.label}</div><PageHeading title={screen.label} description={`${office.name}・${screen.description}`} action={action} />{children}</div>;
}

function CommoHome({ screen }: { screen: DemoScreen }) {
  return <Frame screen={screen}><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[["LINE友だち", "2,846人", "+38人"], ["顧客連携率", "87.2%", "+1.8pt"], ["今月の配信", "12件", "予約 2件"], ["コンバージョン", "4.8%", "+0.6pt"]].map(([label, value, note]) => <div key={label} className="rounded-2xl border bg-white p-5 shadow-sm"><p className="text-sm font-bold text-slate-500">{label}</p><p className="mt-3 text-2xl font-bold">{value}</p><p className="mt-2 text-xs font-bold text-violet-600">{note}</p></div>)}</div><div className="mt-5 grid gap-5 lg:grid-cols-[1.3fr_1fr]"><section className="rounded-2xl border bg-white p-6"><h2 className="font-bold">配信パフォーマンス</h2><div className="mt-6 flex h-52 items-end gap-4 border-b">{[42, 58, 51, 72, 64, 84, 76].map((height, index) => <div key={index} className="flex flex-1 flex-col justify-end"><div className="rounded-t-lg bg-violet-500" style={{ height: `${height}%` }} /><p className="mt-2 text-center text-[10px] text-slate-400">{index + 7}日</p></div>)}</div></section><section className="rounded-2xl border bg-white p-6"><h2 className="font-bold">今日の対応</h2><div className="mt-4 space-y-3">{[["未返信メッセージ", "8件"], ["配信予約", "2件"], ["未連携顧客", "14件"], ["アンケート新着", "23件"]].map(([label, value]) => <div key={label} className="flex items-center justify-between rounded-xl bg-slate-50 p-4"><span className="text-sm font-bold">{label}</span><span className="text-sm font-bold text-violet-600">{value}</span></div>)}</div></section></div></Frame>;
}

function CommoList({ screen }: { screen: DemoScreen }) {
  const [query, setQuery] = useState("");
  const isCustomer = screen.slug === "customers";
  const isBroadcast = screen.slug.startsWith("broadcast-");
  const rows = isCustomer ? customers : isBroadcast ? campaigns : screen.slug === "survey-responses" ? [["満足度アンケート", "山田 花子", "回答済み", "★★★★★", "2026/08/12"], ["商品追加アンケート", "鈴木 一郎", "回答済み", "ヨーグルト", "2026/08/11"], ["配送品質アンケート", "伊藤 健二", "未回答", "—", "2026/08/10"]] : screen.slug === "segments" ? [["牛乳契約・未追加", "842人", "自動更新", "8/12", "配信可能"], ["休配予定者", "126人", "毎日更新", "8/12", "配信可能"], ["3か月反応なし", "214人", "自動更新", "8/12", "要確認"]] : [["健康志向", "顧客", "286件", "自動付与", "利用中"], ["ヨーグルト関心", "行動", "142件", "手動・自動", "利用中"], ["休配注意", "業務", "38件", "自動付与", "利用中"]];
  const shown = rows.filter((row) => row.join("").includes(query));
  return <Frame screen={screen} action={<button className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white">＋ 新規登録</button>}><section className="overflow-hidden rounded-2xl border bg-white shadow-sm"><div className="flex gap-3 border-b p-4"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`${screen.label}を検索`} className="h-11 flex-1 rounded-xl border bg-slate-50 px-4 text-sm outline-none focus:border-violet-500" /><button className="rounded-xl border px-4 text-sm font-bold">絞り込み</button></div><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr>{(isCustomer ? ["顧客", "顧客番号", "LINE", "契約・状態", "最終反応"] : isBroadcast ? ["配信名", "配信日時", "状態", "対象", "開封率"] : ["名称", "対象", "状態", "内容", "更新日"]).map((heading) => <th key={heading} className="px-5 py-4">{heading}</th>)}</tr></thead><tbody className="divide-y">{shown.map((row) => <tr key={row[0]} className="hover:bg-violet-50/30">{row.map((cell, index) => <td key={`${cell}-${index}`} className={`px-5 py-4 ${index === 0 ? "font-bold" : "text-slate-600"}`}>{cell}</td>)}</tr>)}</tbody></table></div></section></Frame>;
}

const analysisContent: Record<string, { metrics: string[][]; title: string }> = {
  "customer-analysis": { title: "顧客属性とLINE反応", metrics: [["連携顧客", "2,482人", "87.2%"], ["アクティブ", "1,924人", "77.5%"], ["休眠顧客", "214人", "8.6%"], ["平均購入額", "¥4,280", "+5.2%"]] },
  "survey-analysis": { title: "アンケート回答傾向", metrics: [["回答数", "486件", "回答率 38.9%"], ["満足度", "4.2", "/ 5.0"], ["商品関心", "62%", "ヨーグルト"], ["改善要望", "84件", "配送時間最多"]] },
  "analysis-line": { title: "LINE友だち推移", metrics: [["友だち", "2,846人", "+38"], ["ブロック率", "8.4%", "-0.3pt"], ["反応率", "24.8%", "+2.1pt"], ["未読率", "18.2%", "-1.4pt"]] },
  "analysis-customers": { title: "顧客セグメント構成", metrics: [["新規", "186人", "6.5%"], ["継続", "2,126人", "74.7%"], ["休配", "248人", "8.7%"], ["解約懸念", "92人", "3.2%"]] },
  "analysis-broadcasts": { title: "配信効果推移", metrics: [["配信数", "12件", "今月"], ["開封率", "68.4%", "+4.8pt"], ["クリック率", "12.6%", "+1.2pt"], ["反応数", "324件", "+28件"]] },
  "analysis-conversions": { title: "コンバージョン推移", metrics: [["CV数", "62件", "+14件"], ["CV率", "4.8%", "+0.6pt"], ["追加契約", "38件", "61.3%"], ["売上貢献", "¥286,400", "+18.2%"]] },
};

function CommoAnalysis({ screen }: { screen: DemoScreen }) {
  const config = analysisContent[screen.slug];
  return <Frame screen={screen} action={<select className="rounded-xl border bg-white px-4 py-3 text-sm font-bold"><option>2026年8月</option><option>2026年7月</option></select>}><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{config.metrics.map(([label, value, note]) => <div key={label} className="rounded-2xl border bg-white p-5"><p className="text-sm font-bold text-slate-500">{label}</p><p className="mt-3 text-2xl font-bold">{value}</p><p className="mt-2 text-xs font-bold text-violet-600">{note}</p></div>)}</div><section className="mt-5 rounded-2xl border bg-white p-6"><h2 className="font-bold">{config.title}</h2><div className="mt-8 flex h-64 items-end gap-5 border-b px-3">{[46, 62, 58, 74, 69, 88].map((height, index) => <div key={index} className="flex flex-1 flex-col justify-end"><p className="mb-2 text-center text-xs font-bold text-violet-600">{height}</p><div className="rounded-t-lg" style={{ height: `${height}%`, backgroundColor: violet }} /><p className="mt-3 text-center text-xs text-slate-400">{index + 3}月</p></div>)}</div></section></Frame>;
}

function CommoForm({ screen }: { screen: DemoScreen }) {
  const [saved, setSaved] = useState(false);
  const isMessage = screen.slug === "broadcast-create" || screen.slug === "ai-message-create";
  return <Frame screen={screen}><form onSubmit={(event) => { event.preventDefault(); setSaved(true); }} className="grid gap-5 lg:grid-cols-[1fr_340px]"><section className="rounded-2xl border bg-white p-6 shadow-sm"><h2 className="font-bold">{screen.label}の設定</h2><div className="mt-5 grid gap-5 sm:grid-cols-2"><label className="text-sm font-bold sm:col-span-2">名称・タイトル<input placeholder={`${screen.label}の名称を入力`} className="mt-2 h-12 w-full rounded-xl border px-4 font-normal focus:border-violet-500" /></label>{isMessage && <><label className="text-sm font-bold">配信対象<select className="mt-2 h-12 w-full rounded-xl border bg-white px-4 font-normal"><option>牛乳契約・未追加</option><option>全顧客</option></select></label><label className="text-sm font-bold">配信日時<input type="datetime-local" defaultValue="2026-08-15T10:00" className="mt-2 h-12 w-full rounded-xl border px-4 font-normal" /></label><label className="text-sm font-bold sm:col-span-2">配信メッセージ<textarea className="mt-2 h-52 w-full rounded-xl border p-4 font-normal" placeholder="LINEで配信する文章を入力" /></label></>}{!isMessage && <><label className="text-sm font-bold">条件<select className="mt-2 h-12 w-full rounded-xl border bg-white px-4 font-normal"><option>契約商品</option><option>最終反応日</option><option>顧客タグ</option></select></label><label className="text-sm font-bold">判定値<input placeholder="条件の値" className="mt-2 h-12 w-full rounded-xl border px-4 font-normal" /></label><label className="text-sm font-bold sm:col-span-2">説明<textarea className="mt-2 h-28 w-full rounded-xl border p-4 font-normal" /></label></>}</div><button className="mt-6 w-full rounded-xl bg-violet-600 py-3.5 text-sm font-bold text-white">保存する</button>{saved && <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-700">✓ 保存しました（デモ）</p>}</section><aside className="rounded-2xl border border-violet-100 bg-violet-50/60 p-5"><h2 className="font-bold text-violet-800">プレビュー</h2><div className="mt-5 rounded-2xl bg-white p-4 shadow-sm"><p className="text-xs text-slate-400">commo. からのお知らせ</p><p className="mt-3 text-sm leading-6">いつもご利用ありがとうございます。お客様におすすめの商品をご案内します。</p></div></aside></form></Frame>;
}

function Recommendations({ screen }: { screen: DemoScreen }) {
  return <Frame screen={screen}><div className="grid gap-4 lg:grid-cols-2">{[["ヨーグルト追加提案", "牛乳のみを3か月以上継続している842人へ、健康訴求の配信がおすすめです。", "期待CV 42件"], ["休配前フォロー", "来月休配予定の126人へ、配送変更と振替方法を事前案内します。", "問い合わせ削減 18%"], ["休眠顧客の再活性化", "90日以上反応がない214人へ、回答しやすいアンケートを配信します。", "反応見込 32件"], ["解約懸念フォロー", "配送頻度が減少した92人へ、少量プランと商品変更を提案します。", "継続見込 16件"]].map(([title, description, effect]) => <article key={title} className="rounded-2xl border bg-white p-6 shadow-sm"><span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700">AIおすすめ</span><h2 className="mt-4 text-lg font-bold">{title}</h2><p className="mt-3 text-sm leading-7 text-slate-600">{description}</p><div className="mt-5 flex items-center justify-between"><span className="text-xs font-bold text-emerald-600">{effect}</span><button className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white">施策を作成</button></div></article>)}</div></Frame>;
}

function LineSettings({ screen }: { screen: DemoScreen }) {
  return <Frame screen={screen}><div className="grid gap-5 lg:grid-cols-[1fr_320px]"><section className="rounded-2xl border bg-white p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-bold">LINE公式アカウント</p><p className="mt-1 text-xs text-slate-500">有明乳業 公式LINE</p></div><span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">● 連携中</span></div><dl className="mt-6 divide-y">{[["チャネルID", "2004••••••"], ["友だち数", "2,846人"], ["Webhook", "正常"], ["最終同期", "2026/08/13 00:20"]].map(([label, value]) => <div key={label} className="flex justify-between py-4 text-sm"><dt className="text-slate-500">{label}</dt><dd className="font-bold">{value}</dd></div>)}</dl></section><aside className="rounded-2xl border bg-white p-6"><h2 className="font-bold">接続確認</h2><p className="mt-3 text-sm leading-6 text-slate-500">メッセージ送受信と顧客同期は正常に動作しています。</p><button className="mt-6 w-full rounded-xl border border-violet-300 py-3 text-sm font-bold text-violet-700">接続テスト</button></aside></div></Frame>;
}
