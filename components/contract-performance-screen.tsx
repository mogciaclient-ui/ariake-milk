"use client";

import { useEffect, useMemo, useState } from "react";
import { ProductLogo } from "@/components/product-logo";
import { useDemoOffice } from "@/lib/demo-office";
import { demoProducts } from "@/lib/product-navigation";
import { yamadaAugustTotal } from "@/lib/demo2-billing";
import { loadDemo2State, saveDemo2Contract } from "@/lib/demo2-firestore";

const customers = [
  { code: "0001842", name: "山田 花子", kana: "ヤマダ ハナコ", route: "A-12", address: "佐賀県神埼郡吉野ヶ里町吉田 1234-5", tel: "0952-00-1234" },
  { code: "0002056", name: "鈴木 一郎", kana: "スズキ イチロウ", route: "B-07", address: "佐賀県神埼市神埼町本堀 201-4", tel: "0952-00-2056" },
  { code: "0002311", name: "高橋 悦子", kana: "タカハシ エツコ", route: "A-03", address: "佐賀県三養基郡上峰町坊所 88-2", tel: "0952-00-2311" },
];

type Contract = { code: string; product: string; price: number; start: string; days: number[]; status?: string };

const initialContracts: Contract[] = [
  { code: "M-001", product: "有明牛乳 900ml", price: 280, start: "2025/04/01", days: [1, 0, 1, 0, 1, 0, 0], status: "配送中" },
  { code: "Y-012", product: "のむヨーグルト", price: 160, start: "2026/01/15", days: [0, 1, 0, 1, 0, 1, 0], status: "配送中" },
  { code: "C-103", product: "宅配専用コーヒー", price: 190, start: "2026/05/01", days: [0, 0, 0, 0, 1, 0, 0], status: "配送中" },
];

const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

function Icon({ name }: { name: "search" | "user" | "calendar" | "box" | "yen" | "chevron" }) {
  const paths = {
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18" /></>,
    box: <><path d="m4 7 8-4 8 4-8 4-8-4Z" /><path d="m4 7v10l8 4 8-4V7M12 11v10" /></>,
    yen: <><path d="m7 4 5 7 5-7M7 13h10M7 17h10M12 11v10" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">{paths[name]}</svg>;
}

type EmbeddedCustomer = { id: string; name: string; kana: string; address: string; route: string; order: number; start: string; birthday: string; payment: string; note: string; follow: string };

export function ContractPerformanceScreen({ initialCustomerName, initialCustomer, embedded = false, onBack, onOpenBilling, onSaveCustomer }: { initialCustomerName?: string; initialCustomer?: EmbeddedCustomer; embedded?: boolean; onBack?: () => void; onOpenBilling?: (customerName: string) => void; onSaveCustomer?: (changes: Partial<EmbeddedCustomer>) => void } = {}) {
  const product = demoProducts[0];
  const { office } = useDemoOffice();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(() => Math.max(0, customers.findIndex((item) => item.name === initialCustomerName)));
  const [month, setMonth] = useState(9);
  const [year, setYear] = useState(2026);
  const [notice, setNotice] = useState("");
  const [newContractOpen, setNewContractOpen] = useState(false);
  const [contractRows, setContractRows] = useState(initialContracts);
  const [newProduct, setNewProduct] = useState("有明牛乳 900ml");
  const [newDays, setNewDays] = useState([0, 1, 0, 1, 0, 0, 0]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [pausedDeliveries, setPausedDeliveries] = useState<Set<string>>(new Set());
  const fallbackCustomer = initialCustomerName === "新規顧客" ? { code: "新規", name: "新規顧客", kana: "", route: "未設定", address: "", tel: "" } : customers[selected];
  const customer = initialCustomer ? { code: initialCustomer.id, name: initialCustomer.name, kana: initialCustomer.kana, route: initialCustomer.route.replace("コース", ""), address: initialCustomer.address, tel: "0952-00-1234" } : fallbackCustomer;
  const [customerFields, setCustomerFields] = useState(() => ({
    name: initialCustomer?.name ?? customer.name,
    kana: initialCustomer?.kana ?? customer.kana,
    address: initialCustomer?.address ?? customer.address,
    route: initialCustomer?.route ?? `${customer.route}コース`,
    order: initialCustomer?.order ?? selected + 1,
    birthday: initialCustomer?.birthday ?? "1968/04/12",
    note: initialCustomer?.note ?? "玄関横の宅配ボックスへ",
    payment: initialCustomer?.payment ?? "口座振替",
  }));
  const [contractsLoaded, setContractsLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    loadDemo2State().then((state) => {
      const stored = state?.contracts?.[customer.code];
      if (active && Array.isArray(stored)) setContractRows(stored as Contract[]);
    }).catch(() => setNotice("Firebaseから契約情報を読み込めませんでした")).finally(() => {
      if (active) setContractsLoaded(true);
    });
    return () => { active = false; };
  }, [customer.code]);

  useEffect(() => {
    if (!contractsLoaded) return;
    const timer = window.setTimeout(() => {
      saveDemo2Contract(customer.code, contractRows).catch(() => setNotice("Firebaseへの契約保存に失敗しました"));
    }, 400);
    return () => window.clearTimeout(timer);
  }, [contractRows, customer.code, contractsLoaded]);
  const isClosedMonth = year === 2026 && month === 8;
  const contractMonths = initialCustomer?.start ? Math.max(0, (2026 - Number(initialCustomer.start.slice(0, 4))) * 12 + 9 - Number(initialCustomer.start.slice(5, 7))) : 17;
  const days = useMemo(() => Array.from({ length: new Date(year, month, 0).getDate() }, (_, index) => index + 1), [month, year]);
  const visibleCustomers = customers.filter((item) => `${item.code}${item.name}${item.kana}`.includes(query.trim()));
  const monthlyTotal = contractRows.reduce((sum, item, row) => {
    const plannedDays = days.filter((day) => row < 3 && (day + row * 2) % (row + 3) === 1);
    const quantityPerDelivery = row === 0 ? 2 : 1;
    const delivered = plannedDays.filter((day) => !pausedDeliveries.has(`${row}-${day}`)).length * quantityPerDelivery;
    return sum + delivered * item.price;
  }, 0);

  return <div className={`mx-auto max-w-[1500px] space-y-5 ${embedded ? "demo2-contract" : ""}`}>
    <div className="flex items-center gap-2 text-xs font-bold text-slate-400">{embedded ? <button onClick={onBack} className="mr-2 rounded-lg border bg-white px-3 py-1.5 text-slate-600">← 顧客一覧</button> : <><ProductLogo product={product} size={20} /><span className="font-logo text-[10px] font-normal text-[#0F172A]">milmo<span className="text-[#EF4444]">.</span></span><span>/</span><span>契約実績</span></>}</div>

    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div><h1 className="text-2xl font-bold tracking-tight">{embedded ? "顧客詳細" : "契約・実績"}</h1><p className="mt-1.5 text-sm text-slate-500">{embedded ? "顧客の基本情報から請求・入金までを一画面で確認します。" : `${office.name}の顧客契約と日別配送実績を確認・更新します。`}</p></div>
      <div className="flex flex-wrap gap-2"><button onClick={() => setHistoryOpen(true)} className="rounded-xl border bg-white px-4 py-2.5 text-sm font-bold text-slate-600">変更履歴</button><button onClick={() => setNewContractOpen(true)} className="rounded-xl border border-[#2563EB] bg-white px-4 py-2.5 text-sm font-bold text-[#2563EB]">＋ 新規契約</button><button onClick={() => { onSaveCustomer?.(customerFields); setNotice("変更内容を保存しました"); }} className="rounded-xl bg-[#2563EB] px-5 py-2.5 text-sm font-bold text-white shadow-sm">変更を保存</button></div>
    </div>

    <section className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex items-center gap-2 font-bold"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-[#2563EB]"><Icon name="search" /></span><span className="whitespace-nowrap text-sm">顧客を検索</span></div>
        <div className="relative flex-1"><span className="pointer-events-none absolute left-3 top-3 text-slate-400"><Icon name="search" /></span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="顧客コード・氏名・フリガナ" className="h-11 w-full rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] pl-11 pr-4 text-sm outline-none focus:border-[#2563EB]" /></div>
        <select value={embedded ? 0 : selected} onChange={(event) => setSelected(Number(event.target.value))} className="h-11 min-w-56 rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm font-semibold outline-none">
          {embedded && initialCustomer ? <option value={0}>{initialCustomer.id}　{initialCustomer.name}</option> : (visibleCustomers.length ? visibleCustomers : customers).map((item) => <option key={item.code} value={customers.indexOf(item)}>{item.code}　{item.name}</option>)}
        </select>
        <button onClick={() => setNotice(`${visibleCustomers.length || customers.length}件見つかりました`)} className="h-11 rounded-xl bg-slate-900 px-6 text-sm font-bold text-white">検索</button>
      </div>
    </section>

    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[#E5E7EB] bg-white p-4"><span className="mr-2 text-xs font-bold text-slate-400">契約操作</span>{["休配", "停止", "再開", "パターン変更", "商品入替", "解約"].map((action) => <button key={action} onClick={() => setNotice(`${customer.name}さんの「${action}」を反映しました（デモ）`)} className={`rounded-lg border px-4 py-2 text-xs font-bold ${action === "解約" ? "border-red-200 text-red-600" : "border-[#E5E7EB] text-slate-600"}`}>{action}</button>)}</div>

    <section className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E7EB] px-5 py-4"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-[#2563EB]"><Icon name="user" /></span><div><p className="text-xs font-bold text-[#2563EB]">顧客コード {customer.code}</p><div className="mt-1 flex flex-wrap items-center gap-3"><input aria-label="顧客名" value={customerFields.name} onChange={(event) => setCustomerFields((current) => ({ ...current, name: event.target.value }))} className="min-w-36 border-b border-transparent bg-transparent text-lg font-bold outline-none focus:border-[#2563EB]" /><input aria-label="フリガナ" value={customerFields.kana} onChange={(event) => setCustomerFields((current) => ({ ...current, kana: event.target.value }))} className="min-w-36 border-b border-transparent bg-transparent text-xs font-medium text-slate-400 outline-none focus:border-[#2563EB]" /></div></div></div><span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">契約中</span></div>
      <div className="grid divide-y divide-[#E5E7EB] md:grid-cols-2 md:divide-x md:divide-y-0 xl:grid-cols-4">
        <label className="px-5 py-4"><span className="text-xs font-bold text-slate-400">住所</span><input value={customerFields.address} onChange={(event) => setCustomerFields((current) => ({ ...current, address: event.target.value }))} className="mt-1.5 w-full bg-transparent text-sm font-semibold outline-none" /></label><div className="px-5 py-4"><p className="text-xs font-bold text-slate-400">電話番号</p><p className="mt-1.5 text-sm font-semibold">{customer.tel}</p></div><div className="px-5 py-4"><p className="text-xs font-bold text-slate-400">配送コース・配達順</p><div className="mt-1 flex gap-2"><select value={customerFields.route} onChange={(event) => setCustomerFields((current) => ({ ...current, route: event.target.value }))} className="bg-transparent text-sm font-semibold outline-none"><option>Aコース</option><option>Bコース</option><option>未設定</option></select><input aria-label="配達順" min="0" type="number" value={customerFields.order} onChange={(event) => setCustomerFields((current) => ({ ...current, order: Number(event.target.value) }))} className="w-16 bg-transparent text-sm font-semibold outline-none" /><span className="text-sm font-semibold">番</span></div></div><div className="px-5 py-4"><p className="text-xs font-bold text-slate-400">契約担当</p><p className="mt-1.5 text-sm font-semibold">佐藤 美咲</p></div>
      </div>
      <div className="grid border-t border-[#E5E7EB] bg-[#F8FAFC] md:grid-cols-3"><label className="px-5 py-3 text-sm"><span className="mr-3 text-xs font-bold text-slate-400">誕生日</span><input value={customerFields.birthday} onChange={(event) => setCustomerFields((current) => ({ ...current, birthday: event.target.value }))} className="min-w-0 bg-transparent font-semibold text-slate-600 outline-none" /></label><label className="px-5 py-3 text-sm"><span className="mr-3 text-xs font-bold text-slate-400">メモ</span><input value={customerFields.note} onChange={(event) => setCustomerFields((current) => ({ ...current, note: event.target.value }))} className="min-w-0 bg-transparent font-semibold text-slate-600 outline-none" /></label><label className="px-5 py-3 text-sm"><span className="mr-3 text-xs font-bold text-slate-400">支払方法</span><select value={customerFields.payment} onChange={(event) => setCustomerFields((current) => ({ ...current, payment: event.target.value }))} className="min-w-0 bg-transparent font-semibold text-slate-600 outline-none"><option>口座振替</option><option>クレジット</option><option>現金集金</option><option>LINE</option><option>未設定</option></select></label></div>
      <div className="grid border-t border-[#E5E7EB] bg-white md:grid-cols-2"><label className="px-5 py-3 text-sm"><span className="mr-3 text-xs font-bold text-slate-400">集金コース</span><select className="min-w-36 bg-transparent font-semibold text-slate-600 outline-none"><option>集金Aコース</option><option>集金Bコース</option></select></label><label className="px-5 py-3 text-sm"><span className="mr-3 text-xs font-bold text-slate-400">集金メモ</span><input defaultValue="毎月25日前後に訪問" className="min-w-64 bg-transparent font-semibold text-slate-600 outline-none" /></label></div>
      <div className="flex flex-wrap items-center gap-3 border-t border-[#E5E7EB] px-5 py-3 text-xs"><span className="rounded-full bg-blue-50 px-3 py-1.5 font-bold text-[#2563EB]">契約{contractMonths}ヶ月</span>{initialCustomer?.follow && initialCustomer.follow !== "—" && <span className="rounded-full bg-amber-50 px-3 py-1.5 font-bold text-amber-700">要フォロー：{initialCustomer.follow}</span>}<span className="font-semibold text-slate-500">判定条件は要確認</span></div>
    </section>

    <section className={`overflow-hidden rounded-2xl border border-[#E5E7EB] shadow-sm ${isClosedMonth ? "bg-slate-100 text-slate-500" : "bg-white"}`}>
      <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4"><div className="flex items-center gap-2"><span className="text-[#2563EB]"><Icon name="box" /></span><h2 className="font-bold">契約商品</h2><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">{contractRows.length}件</span></div><button onClick={() => setNewContractOpen(true)} className="text-sm font-bold text-[#2563EB]">＋ 商品を追加</button></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-[#F8FAFC] text-xs font-bold text-slate-500"><tr><th className="px-5 py-3">商品コード</th><th className="px-5 py-3">商品名</th><th className="px-5 py-3 text-right">単価</th><th className="px-5 py-3">契約開始日</th><th className="px-5 py-3">配送曜日</th><th className="px-5 py-3">状態</th><th /></tr></thead><tbody className="divide-y divide-[#E5E7EB]">{contractRows.map((item) => <tr key={item.code} className="hover:bg-blue-50/30"><td className="px-5 py-4 font-bold text-[#2563EB]">{item.code}</td><td className="px-5 py-4 font-bold">{item.product}</td><td className="px-5 py-4 text-right font-bold">¥{item.price.toLocaleString()}</td><td className="px-5 py-4 text-slate-500">{item.start}</td><td className="px-5 py-4"><div className="flex gap-1">{weekdays.map((day, index) => <span key={day} className={`flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold ${item.days[index] ? "bg-[#2563EB] text-white" : "bg-slate-100 text-slate-300"}`}>{day}</span>)}</div></td><td className="px-5 py-4"><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">配送中</span></td><td className="px-5 py-4 text-slate-400"><Icon name="chevron" /></td></tr>)}</tbody></table></div>
    </section>

    <section className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
      <div className="flex flex-col justify-between gap-4 border-b border-[#E5E7EB] px-5 py-4 sm:flex-row sm:items-center"><div className="flex items-center gap-2"><span className="text-[#2563EB]"><Icon name="calendar" /></span><h2 className="font-bold">月間配送実績</h2></div><div className="flex items-center gap-2"><button onClick={() => { if (month === 1) { setMonth(12); setYear((v) => v - 1); } else setMonth((v) => v - 1); }} className="rounded-lg bg-slate-100 px-3 py-2 font-bold">‹</button><span className="min-w-28 text-center text-sm font-bold">{year}年{month}月</span><button onClick={() => { if (month === 12) { setMonth(1); setYear((v) => v + 1); } else setMonth((v) => v + 1); }} className="rounded-lg bg-slate-100 px-3 py-2 font-bold">›</button></div></div>
      <div className={`border-b px-5 py-3 text-xs font-semibold ${isClosedMonth ? "border-slate-300 bg-slate-200 text-slate-600" : "border-blue-100 bg-blue-50 text-blue-700"}`}>{isClosedMonth ? "締め済みの月です。閲覧のみで、配送実績は編集できません。" : "配送予定の数字を押すと、その商品だけ「0（お休み）」にできます。複数商品のうち1種類だけの休止にも対応します。"}</div>
      <div className="overflow-x-auto"><table className="min-w-[1260px] text-center text-xs"><thead><tr className="border-b border-[#E5E7EB] bg-[#F8FAFC]"><th className="sticky left-0 z-10 w-48 bg-[#F8FAFC] px-4 py-3 text-left">商品名</th>{days.map((day) => { const dow = new Date(year, month - 1, day).getDay(); return <th key={day} className={`w-8 py-2 ${dow === 0 ? "text-red-500" : dow === 6 ? "text-blue-500" : ""}`}><span>{day}</span><br/><span className="font-normal">{weekdays[dow]}</span></th>; })}<th className="px-4">本数</th><th className="px-4">小計（税込）</th></tr></thead><tbody>{contractRows.map((item, row) => { const plannedDays = days.filter((day) => row < 3 && (day + row * 2) % (row + 3) === 1); const quantityPerDelivery = row === 0 ? 2 : 1; const deliveredCount = plannedDays.filter((day) => !pausedDeliveries.has(`${row}-${day}`)).length * quantityPerDelivery; return <tr key={item.code} className="border-b border-[#E5E7EB] last:border-0"><th className={`sticky left-0 z-10 px-4 py-4 text-left text-xs font-bold ${isClosedMonth ? "bg-slate-100" : "bg-white"}`}>{item.product}</th>{days.map((day) => { const delivered = plannedDays.includes(day); const key = `${row}-${day}`; const paused = pausedDeliveries.has(key); return <td key={day} className="border-l border-slate-100 py-3">{delivered ? <button disabled={isClosedMonth} title={isClosedMonth ? "締め済みのため編集できません" : paused ? "押すと配送を再開" : "押すとこの商品だけお休み"} onClick={() => { if (isClosedMonth) return; setPausedDeliveries((current) => { const next = new Set(current); if (next.has(key)) next.delete(key); else next.add(key); return next; }); setNotice(paused ? `${item.product}を${month}/${day}に再開しました` : `${item.product}を${month}/${day}だけお休みにしました`); }} className={`mx-auto flex h-7 w-7 items-center justify-center rounded-md font-bold transition ${isClosedMonth ? "cursor-not-allowed bg-slate-300 text-slate-500" : paused ? "bg-red-100 text-red-600 ring-1 ring-red-200" : "bg-blue-50 text-[#2563EB] hover:bg-blue-100"}`}>{paused ? 0 : quantityPerDelivery}</button> : ""}</td>; })}<td className="border-l border-[#E5E7EB] px-4 font-bold">{deliveredCount}</td><td className="border-l border-[#E5E7EB] px-4 font-bold">¥{(deliveredCount * item.price).toLocaleString()}</td></tr>})}<tr className="bg-slate-50 text-sm font-bold"><td className="sticky left-0 bg-slate-50 px-4 py-3 text-left" colSpan={days.length + 2}>月間配送実績 合計</td><td className="px-4 text-right">¥{monthlyTotal.toLocaleString()}</td></tr></tbody></table></div>
    </section>

    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{[["前回請求", `¥${yamadaAugustTotal.toLocaleString()}`, "2026年8月実績から計算"], ["入金", `¥${yamadaAugustTotal.toLocaleString()}`, "2026年8月分・入金済み"], ["繰越", "¥0", "未収なし"], ["当月売上", `¥${monthlyTotal.toLocaleString()}`, `${month}月実績`], ["今回請求", `¥${monthlyTotal.toLocaleString()}`, "月間実績から自動計算"]].map(([label, value, note], index) => <button onClick={() => onOpenBilling?.(customer.name)} key={label} className={`rounded-2xl border p-5 text-left shadow-sm ${index === 4 ? "border-blue-200 bg-[#2563EB] text-white" : "border-[#E5E7EB] bg-white"}`}><div className="flex items-center justify-between"><p className={`text-xs font-bold ${index === 4 ? "text-blue-100" : "text-slate-400"}`}>{label}</p><Icon name="yen" /></div><p className="mt-3 text-2xl font-bold">{value}</p><p className={`mt-1 text-xs ${index === 4 ? "text-blue-100" : "text-slate-400"}`}>{note}　→ 請求・入金</p></button>)}</section>
    <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-bold">スポット販売</h2><p className="mt-1 text-xs text-slate-500">牛乳以外の物販を顧客に追加し、納品書を発行します。</p></div><div className="flex gap-2"><button onClick={() => setNotice("スポット販売を追加しました（デモ）")} className="rounded-xl border px-4 py-2 text-sm font-bold">＋ 販売を追加</button><button onClick={() => setNotice("納品書プレビューを開きました（デモ）")} className="rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-bold text-white">納品書</button></div></div></section>
    {newContractOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onMouseDown={() => setNewContractOpen(false)}><form onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); const selectedProduct = String(data.get("product")); const price = selectedProduct === "有明牛乳 900ml" ? 280 : selectedProduct === "のむヨーグルト" ? 160 : 190; setContractRows((rows) => [...rows, { code: `N-${String(rows.length + 1).padStart(3, "0")}`, product: selectedProduct, price, start: String(data.get("start")).replaceAll("-", "/"), days: newDays }]); setNewContractOpen(false); setNotice(`${customer.name}さんの新規契約を登録しました（デモ）`); }} onMouseDown={(event) => event.stopPropagation()} className="max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"><div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#E5E7EB] bg-white px-6 py-5"><div><p className="text-xs font-bold text-[#2563EB]">{customer.code}　{customer.name}</p><h2 className="mt-1 text-xl font-bold">新規契約を登録</h2></div><button type="button" aria-label="閉じる" onClick={() => setNewContractOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-lg text-slate-500">×</button></div><div className="grid gap-5 p-6 sm:grid-cols-2"><label className="text-sm font-bold sm:col-span-2">商品<select name="product" value={newProduct} onChange={(event) => setNewProduct(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 font-normal outline-none focus:border-[#2563EB]"><option>有明牛乳 900ml</option><option>のむヨーグルト</option><option>宅配専用コーヒー</option></select></label><label className="text-sm font-bold">契約開始日<input name="start" type="date" required defaultValue="2026-08-12" className="mt-2 h-12 w-full rounded-xl border border-[#E5E7EB] px-4 font-normal outline-none focus:border-[#2563EB]" /></label><label className="text-sm font-bold">担当者<select className="mt-2 h-12 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 font-normal"><option>佐藤 美咲</option><option>田中 悠斗</option></select></label><fieldset className="sm:col-span-2"><legend className="text-sm font-bold">配送曜日</legend><div className="mt-2 flex flex-wrap gap-2">{weekdays.map((day, index) => <button type="button" key={day} onClick={() => setNewDays((current) => current.map((value, dayIndex) => dayIndex === index ? Number(!value) : value))} className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold ${newDays[index] ? "bg-[#2563EB] text-white" : "bg-slate-100 text-slate-400"}`}>{day}</button>)}</div></fieldset><label className="text-sm font-bold sm:col-span-2">備考<textarea placeholder="配送時の注意事項など" className="mt-2 h-24 w-full rounded-xl border border-[#E5E7EB] p-4 font-normal outline-none focus:border-[#2563EB]" /></label></div><div className="flex justify-end gap-3 border-t border-[#E5E7EB] bg-[#F8FAFC] px-6 py-4"><button type="button" onClick={() => setNewContractOpen(false)} className="rounded-xl border border-[#E5E7EB] bg-white px-5 py-3 text-sm font-bold text-slate-500">キャンセル</button><button type="submit" className="rounded-xl bg-[#2563EB] px-6 py-3 text-sm font-bold text-white">契約を登録</button></div></form></div>}
    {historyOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onClick={() => setHistoryOpen(false)}><div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="flex justify-between"><div><p className="text-xs font-bold text-[#2563EB]">{customer.code} {customer.name}</p><h2 className="mt-1 text-xl font-bold">契約変更履歴</h2></div><button onClick={() => setHistoryOpen(false)}>✕</button></div><div className="mt-5 divide-y rounded-xl border">{[["2026/08/05", "配送曜日変更", "月・木 → 月・水・金"], ["2026/07/18", "商品追加", "宅配専用コーヒー"], ["2026/06/30", "単価変更", "¥270 → ¥280"]].map((row) => <div key={row[0]} className="grid gap-2 p-4 sm:grid-cols-[110px_130px_1fr]"><span className="text-xs text-slate-400">{row[0]}</span><span className="text-sm font-bold">{row[1]}</span><span className="text-sm text-slate-500">{row[2]}</span></div>)}</div></div></div>}
    {notice && <button onClick={() => setNotice("")} className="fixed bottom-6 right-6 z-50 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-xl">✓ {notice}</button>}
  </div>;
}
