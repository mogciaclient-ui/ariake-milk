"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ContractPerformanceScreen } from "@/components/contract-performance-screen";
import { isScheduledDelivery, type DeliveryPattern } from "@/lib/delivery-schedule";
import { loadDemo2State, saveDemo2BillingMonth, saveDemo2Field, saveDemo2NestedField, saveDemo2RecordChanges } from "@/lib/demo2-firestore";

type View = "home" | "customers" | "customer-detail" | "delivery" | "billing" | "analysis" | "settings";
type Customer = { id: string; name: string; kana: string; route: string; order: number; products: string; payment: string; status: string; note: string; address: string; phoneHome: string; phoneMobile: string; start: string; birthday: string; follow: string };

type ProductRow = [string, string, string, string, string, string];
type StoredProduct = { code: string; name: string; category: string; price: string; tax: string; supplier: string };
type Demo2Settings = { invoiceName: string; deliveryName: string; deliveryCourses: string[]; collectionCourses: string[]; closingDay: string; withdrawalDay: string; closedMonths: string[]; permission: string };
type InvoiceContract = { code: string; product: string; price: number; start: string; days: number[]; quantity: number; status: string; deliveryPattern?: DeliveryPattern; nthWeeks?: number[] };
type SpotSale = { product: string; unitPrice?: number; quantity?: number; soldAt?: string; price?: number; at: string };
type DeliveryActual = { completedAt: string; quantities: Record<string, number> };
type DeliveryActuals = Record<string, Record<string, DeliveryActual>>;
type InvoiceLine = { key: string; product: string; quantity: number; unitPrice: number; amount: number; kind: "contract" | "spot"; dailyQuantities?: Record<string, number> };
type InvoiceSnapshot = { customerId: string; customerName: string; address: string; lines: InvoiceLine[]; subtotal: number; createdAt: string };
const emptySettings: Demo2Settings = { invoiceName: "", deliveryName: "", deliveryCourses: ["Aコース", "Bコース"], collectionCourses: ["集金Aコース", "集金Bコース"], closingDay: "", withdrawalDay: "", closedMonths: [], permission: "一般：閲覧のみ" };
const normalizeCourses = (value: unknown, fallback: string[]) => {
  const courses = Array.from(new Set((Array.isArray(value) ? value : typeof value === "string" ? value.split(/[、,\n]/) : fallback).map((item) => String(item).trim()).filter(Boolean)));
  return courses.length ? courses : fallback;
};
const normalizeSettings = (value: Record<string, unknown> | undefined): Demo2Settings => ({
  ...emptySettings,
  ...value,
  deliveryCourses: normalizeCourses(value?.deliveryCourses ?? value?.deliveryCourse, emptySettings.deliveryCourses),
  collectionCourses: normalizeCourses(value?.collectionCourses ?? value?.collectionCourse, emptySettings.collectionCourses),
});

const toStoredProduct = ([code, name, category, price, tax, supplier]: ProductRow): StoredProduct => ({ code, name, category, price, tax, supplier });
const toProductRow = (value: unknown): ProductRow | null => {
  if (Array.isArray(value) && value.length === 6 && value.every((item) => typeof item === "string")) return value as ProductRow;
  if (!value || typeof value !== "object") return null;
  const item = value as Partial<StoredProduct>;
  return [item.code, item.name, item.category, item.price, item.tax, item.supplier].every((field) => typeof field === "string")
    ? [item.code!, item.name!, item.category!, item.price!, item.tax!, item.supplier!]
    : null;
};

const initialCustomers: Customer[] = [];

const nav: Array<{ id: View; label: string; icon: string }> = [
  { id: "home", label: "ホーム", icon: "⌂" }, { id: "delivery", label: "配達", icon: "▣" },
  { id: "customers", label: "顧客", icon: "◎" }, { id: "billing", label: "請求・入金", icon: "¥" },
  { id: "analysis", label: "売上・分析", icon: "↗" }, { id: "settings", label: "商品・設定", icon: "⚙" },
];

export function MilmoSimpleSystem() {
  const [view, setView] = useState<View>("home");
  const [customers, setCustomers] = useState(initialCustomers);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Customer | null>(null);
  const [notice, setNotice] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [office, setOffice] = useState("本社営業所");
  const [billingCustomer, setBillingCustomer] = useState("");
  const [customersLoaded, setCustomersLoaded] = useState(false);
  const [deliveryCourses, setDeliveryCourses] = useState(emptySettings.deliveryCourses);
  const savedCustomers = useRef<Customer[]>([]);
  const flash = useCallback((message: string) => { setNotice(message); window.setTimeout(() => setNotice(""), 2200); }, []);

  useEffect(() => {
    let active = true;
    loadDemo2State().then((state) => {
      if (active && Array.isArray(state?.customers)) { const loaded=(state.customers as Array<Partial<Customer>>).map((customer)=>({...customer,phoneHome:customer.phoneHome??"",phoneMobile:customer.phoneMobile??""})) as Customer[]; setCustomers(loaded); savedCustomers.current=loaded; }
      if (active && state?.settings) setDeliveryCourses(normalizeSettings(state.settings).deliveryCourses);
    }).catch(() => flash("Firebaseから顧客情報を読み込めませんでした")).finally(() => {
      if (active) setCustomersLoaded(true);
    });
    return () => { active = false; };
  }, [flash]);

  useEffect(() => {
    if (!customersLoaded) return;
    const timer = window.setTimeout(() => {
      const previous=savedCustomers.current; const previousById=new Map(previous.map((item)=>[item.id,item])); const upserts=customers.filter((item)=>JSON.stringify(previousById.get(item.id))!==JSON.stringify(item)); const currentIds=new Set(customers.map((item)=>item.id)); const deletedIds=previous.filter((item)=>!currentIds.has(item.id)).map((item)=>item.id); saveDemo2RecordChanges("customers",upserts as unknown as Array<Record<string,unknown>>,deletedIds,"id").then(()=>{savedCustomers.current=customers}).catch(() => flash("Firebaseへの顧客保存に失敗しました"));
    }, 400);
    return () => window.clearTimeout(timer);
  }, [customers, customersLoaded, flash]);

  function move(viewId: View) { setView(viewId); setMobileOpen(false); setSelected(null); }

  return <div className="demo2-theme min-h-screen bg-[#f5f7f3]">
    <div className="flex min-h-screen">
      <aside className={`fixed inset-y-0 left-0 z-50 h-screen w-60 overflow-y-auto border-r border-[#dfe5dc] bg-[#17362d] text-white transition-transform ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="flex h-20 items-center border-b border-white/10 px-6"><div><p className="font-logo text-2xl">milmo<span className="text-[#a9dc78]">.</span></p><p className="mt-1 text-[10px] font-bold tracking-[.16em] text-[#a9dc78]">NEW SIMPLE EDITION</p></div></div>
        <nav className="space-y-1 p-3">{nav.map((item) => <button key={item.id} onClick={() => move(item.id)} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold transition ${view === item.id ? "bg-white text-[#17362d] shadow-sm" : "text-white/75 hover:bg-white/10 hover:text-white"}`}><span className={`flex h-7 w-7 items-center justify-center rounded-lg text-sm ${view === item.id ? "bg-[#dff2c9] text-[#254b3f]" : "bg-white/10"}`}>{item.icon}</span>{item.label}</button>)}</nav>
        <div className="absolute inset-x-3 bottom-4 rounded-xl border border-white/10 bg-white/5 p-3"><p className="text-xs font-bold">新設計プロトタイプ</p><p className="mt-1 text-[10px] leading-4 text-white/55">日常業務を6画面に集約した比較案です</p><a href="/dashboard" className="mt-3 block rounded-lg bg-white/10 px-3 py-2 text-center text-[11px] font-bold hover:bg-white/20">既存改善版に戻る</a></div>
      </aside>
      {mobileOpen && <button aria-label="メニューを閉じる" onClick={() => setMobileOpen(false)} className="fixed inset-0 z-40 bg-slate-900/30 lg:hidden" />}
      <div className="min-w-0 flex-1 lg:pl-60">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[#dfe5dc] bg-white/95 px-4 backdrop-blur sm:px-7"><div className="flex items-center gap-3"><button onClick={() => setMobileOpen(true)} className="rounded-lg border p-2 lg:hidden">☰</button><div><select value={office} onChange={(e) => setOffice(e.target.value)} className="-ml-1 rounded-md border-0 bg-transparent text-[10px] font-bold tracking-wider text-[#708078]"><option>本社営業所</option><option>吉野ヶ里営業所</option></select><h1 className="text-base font-black text-[#17362d]">{view === "customer-detail" ? "顧客詳細" : nav.find((item) => item.id === view)?.label}</h1></div></div><div className="flex items-center gap-2"><span className="hidden rounded-full bg-[#e9f5db] px-3 py-1.5 text-xs font-bold text-[#38613f] sm:inline">顧客 {customers.length}件</span><button className="flex h-9 w-9 items-center justify-center rounded-full border bg-white text-sm">通知</button></div></header>
        <main className="mx-auto max-w-[1480px] p-4 sm:p-7">
          {view === "home" && <Home customers={customers} onMove={move} />}
          {view === "customers" && <Customers customers={customers} setCustomers={setCustomers} query={query} setQuery={setQuery} selected={selected} setSelected={setSelected} flash={flash} deliveryCourses={deliveryCourses} openDetail={(customer) => { setSelected(customer); setView("customer-detail"); }} />}
          {view === "customer-detail" && <ContractPerformanceScreen embedded initialCustomerName={selected?.name} initialCustomer={selected ?? undefined} onSaveCustomer={(changes) => { if (!selected) return; const updated = { ...selected, ...changes }; setCustomers((current) => current.map((customer) => customer.id === selected.id ? updated : customer)); setSelected(updated); flash("顧客情報を保存しました"); }} onBack={() => setView("customers")} onOpenBilling={(name) => { setBillingCustomer(name); setView("billing"); }} />}
          {view === "delivery" && <Delivery customers={customers} setCustomers={setCustomers} flash={flash} deliveryCourses={deliveryCourses} />}
          {view === "billing" && <Billing customers={customers} flash={flash} customerFilter={billingCustomer} openCustomer={(name) => { const customer = customers.find((item) => item.name === name); if (!customer) return; setSelected(customer); setView("customer-detail"); }} />}
          {view === "analysis" && <Analysis customers={customers} />}
          {view === "settings" && <Settings flash={flash} onDeliveryCoursesChange={setDeliveryCourses} />}
        </main>
      </div>
    </div>
    {notice && <div className="fixed bottom-6 right-6 z-[70] rounded-xl bg-[#17362d] px-5 py-3 text-sm font-bold text-white shadow-xl">✓ {notice}</div>}
  </div>;
}

function Home({ customers, onMove }: { customers: Customer[]; onMove: (view: View) => void }) {
  const [billing, setBilling] = useState<{ paidAt: Record<string,string>; invoiceTotals: Record<string,number> }>({ paidAt: {}, invoiceTotals: {} });
  useEffect(() => { let active=true; loadDemo2State().then((state)=>{ if(active) setBilling({paidAt:state?.billing?.paidAt??{},invoiceTotals:state?.billing?.invoiceTotals??{}}) }).catch(()=>{}); return()=>{active=false} }, []);
  const currentMonth = new Date().toISOString().slice(0,7);
  const monthlyEntries = Object.entries(billing.invoiceTotals).filter(([key])=>key.startsWith(`${currentMonth}:`));
  const sales = monthlyEntries.reduce((sum,[,total])=>sum+total,0);
  const unpaidEntries = monthlyEntries.filter(([key,total])=>total>0&&!billing.paidAt[key]);
  const followCount = customers.filter((customer) => customer.follow !== "—").length;
  return <><div className="flex flex-wrap items-end justify-between gap-4"><div><span className="rounded-full bg-[#e9f5db] px-3 py-1 text-xs font-bold text-[#38613f]">業務サマリー</span><h2 className="mt-3 text-2xl font-black tracking-tight text-[#17362d] sm:text-3xl">今日やることが、すぐ分かる。</h2><p className="mt-2 text-sm text-[#6b7771]">配達から入金確認まで、必要な操作をここから始められます。</p></div><button onClick={() => onMove("customers")} className="rounded-xl bg-[#e06b45] px-5 py-3 text-sm font-bold text-white shadow-sm">＋ 顧客・契約を登録</button></div>
    <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[["本日の配達",`${customers.length}件`,"配達画面で確認","delivery"],["要フォロー",`${followCount}件`,"登録データから集計","customers"],["未入金",`${unpaidEntries.length}件`,`¥${unpaidEntries.reduce((sum,[,total])=>sum+total,0).toLocaleString()}`,"billing"],["今月の売上",`¥${sales.toLocaleString()}`,monthlyEntries.length?"請求データから集計":"実績データなし","analysis"]].map(([label,value,note,id]) => <button key={label} onClick={() => onMove(id as View)} className="rounded-2xl border border-[#dfe5dc] bg-white p-5 text-left shadow-[0_5px_20px_rgba(23,54,45,.04)] transition hover:-translate-y-0.5 hover:border-[#9ab89f]"><p className="text-xs font-bold text-[#718079]">{label}</p><p className="mt-3 text-3xl font-black text-[#17362d]">{value}</p><p className="mt-2 text-xs font-semibold text-[#e06b45]">{note} →</p></button>)}</div>
    <section className="mt-5 rounded-2xl border border-[#dfe5dc] bg-white p-8 text-center"><h3 className="font-black text-[#17362d]">{customers.length ? "登録データから業務状況を表示します" : "まだデータがありません"}</h3><p className="mt-2 text-sm text-[#718079]">{customers.length ? `顧客 ${customers.length}件をもとに各画面で操作できます。` : "顧客・契約を登録すると、配達や請求の情報がここに反映されます。"}</p>{!customers.length && <button onClick={() => onMove("customers")} className="mt-5 rounded-xl bg-[#e06b45] px-5 py-3 text-sm font-bold text-white">最初の顧客を登録</button>}</section>
  </>;
}

function Customers({ customers, setCustomers, query, setQuery, setSelected, flash, deliveryCourses, openDetail }: { customers: Customer[]; setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>; query: string; setQuery: (v: string) => void; selected: Customer | null; setSelected: (v: Customer | null) => void; flash: (v: string) => void; deliveryCourses: string[]; openDetail: (customer: Customer) => void }) {
  const [adding, setAdding] = useState(false);
  const emptyCustomer = (): Customer => ({ id:`C-${crypto.randomUUID().slice(0,8).toUpperCase()}`, name:"", kana:"", route:"未設定", order:0, products:"", payment:"未設定", status:"登録中", note:"", address:"", phoneHome:"", phoneMobile:"", start:new Date().toISOString().slice(0, 10).replaceAll("-", "/"), birthday:"", follow:"—" });
  const [draft, setDraft] = useState<Customer>(() => emptyCustomer());
  const shown = customers.filter((c) => `${c.name}${c.kana}${c.id}${c.route}`.toLowerCase().includes(query.toLowerCase()));
  const updateDraft = (key: keyof Customer, value: string | number) => setDraft((current) => ({ ...current, [key]: value }));
  const add = () => { if (!draft.name.trim()) return; const next = { ...draft, name: draft.name.trim(), products: draft.products.trim() || "商品未設定" }; setCustomers([...customers,next]); setAdding(false); setDraft(emptyCustomer()); setSelected(next); flash("顧客情報を登録しました"); };
  const followCount = customers.filter((customer) => customer.follow !== "—").length;
  return <><Title eyebrow="CUSTOMERS" title="顧客・契約" text="基本情報、契約商品、配達、支払いを1か所で管理します。" action={<div className="flex gap-2"><button onClick={() => flash("CSVファイルを選択してください")} className="rounded-xl border bg-white px-4 py-2.5 text-sm font-bold">CSV一括登録</button><button onClick={() => { setDraft(emptyCustomer()); setAdding(true); }} className="rounded-xl bg-[#e06b45] px-4 py-2.5 text-sm font-bold text-white">＋ 顧客・契約を登録</button></div>} />
    <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[["顧客総数",`${customers.length}件`],["新規",`${customers.filter((customer) => customer.status === "登録中").length}件`],["契約1〜3ヶ月","0件"],["要フォロー",`${followCount}件`]].map(([label,value])=><div key={label} className="rounded-2xl border border-[#dfe5dc] bg-white p-4"><p className="text-xs font-bold text-[#718079]">{label}</p><p className="mt-2 text-xl font-black text-[#17362d]">{value}</p></div>)}</div>
    <section className="mt-5 overflow-hidden rounded-2xl border border-[#dfe5dc] bg-white"><div className="flex flex-wrap items-center gap-3 border-b p-4"><div className="relative min-w-64 flex-1"><span className="absolute left-3 top-2.5 text-[#8b9992]">⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="顧客名・番号・コースで検索" className="h-10 w-full rounded-xl border bg-[#f8faf7] pl-9 pr-3 text-sm outline-none focus:border-[#78a66f]" /></div><select className="h-10 rounded-xl border bg-white px-3 text-sm font-bold"><option>すべて</option><option>新規</option><option>契約1〜3ヶ月</option><option>要フォロー</option></select><span className="text-xs font-bold text-[#718079]">{shown.length}件</span></div>{shown.length ? <div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-left text-sm"><thead className="bg-[#f7f9f6] text-xs text-[#718079]"><tr><th className="p-4">顧客</th><th>契約開始日</th><th>誕生日</th><th>契約商品</th><th>配達</th><th>フォロー</th><th /></tr></thead><tbody className="divide-y">{shown.map((c) => <tr key={c.id} className="hover:bg-[#f9fbf7]"><td className="p-4"><button onClick={() => openDetail(c)} className="text-left font-black text-[#17362d] hover:underline">{c.name}</button><p className="mt-1 text-[11px] text-[#89958f]">{c.id}・{c.kana}</p></td><td>{c.start}</td><td>{c.birthday}</td><td className="max-w-64 text-xs font-semibold">{c.products}</td><td><b>{c.route}</b><p className="text-[11px] text-[#89958f]">{c.order > 0 ? `${c.order}番` : "順番未設定"}</p></td><td>{c.follow !== "—" ? <Pill tone="amber">{c.follow}</Pill> : "—"}</td><td className="pr-4 text-right"><button onClick={() => openDetail(c)} className="font-bold text-[#3f6b50]">顧客詳細 →</button></td></tr>)}</tbody></table></div> : <div className="p-10 text-center"><p className="font-bold text-[#17362d]">顧客データがありません</p><p className="mt-2 text-sm text-[#718079]">「顧客・契約を登録」から最初の顧客を追加してください。</p></div>}</section>
    {adding && <Modal title="顧客と契約をまとめて登録" onClose={() => setAdding(false)}><form onSubmit={(event) => { event.preventDefault(); add(); }}><div className="grid gap-4 sm:grid-cols-2"><Label label="顧客名（必須）"><input required value={draft.name} onChange={(e) => updateDraft("name", e.target.value)} className="field" /></Label><Label label="フリガナ"><input value={draft.kana} onChange={(e) => updateDraft("kana", e.target.value)} className="field" /></Label><Label label="住所"><input value={draft.address} onChange={(e) => updateDraft("address", e.target.value)} className="field" /></Label><Label label="誕生日"><input type="date" value={draft.birthday.replaceAll("/", "-")} onChange={(e) => updateDraft("birthday", e.target.value.replaceAll("-", "/"))} className="field" /></Label><Label label="自宅電話"><input type="tel" autoComplete="tel-national" value={draft.phoneHome} onChange={(e) => updateDraft("phoneHome", e.target.value)} placeholder="0952-00-0000" className="field" /></Label><Label label="携帯電話"><input type="tel" autoComplete="tel" value={draft.phoneMobile} onChange={(e) => updateDraft("phoneMobile", e.target.value)} placeholder="090-0000-0000" className="field" /></Label><Label label="配達コース"><select value={draft.route} onChange={(e) => updateDraft("route", e.target.value)} className="field"><option>未設定</option>{deliveryCourses.map((course)=><option key={course}>{course}</option>)}</select></Label><Label label="配達順"><input min="1" type="number" value={draft.order || ""} onChange={(e) => updateDraft("order", e.target.value === "" ? 0 : Number(e.target.value))} className="field" /></Label><Label label="契約商品"><input value={draft.products} onChange={(e) => updateDraft("products", e.target.value)} placeholder="有明牛乳 ×2" className="field" /></Label><Label label="支払方法"><select value={draft.payment} onChange={(e) => updateDraft("payment", e.target.value)} className="field"><option>未設定</option><option>口座振替</option><option>クレジット</option><option>現金集金</option><option>LINE</option></select></Label><div className="sm:col-span-2"><Label label="配達メモ"><textarea value={draft.note} onChange={(e) => updateDraft("note", e.target.value)} className="field min-h-24" /></Label></div></div><div className="mt-6 flex justify-end gap-2 border-t pt-4"><button type="button" onClick={() => setAdding(false)} className="rounded-xl border px-5 py-2.5 text-sm font-bold">キャンセル</button><button type="submit" className="rounded-xl bg-[#17362d] px-6 py-2.5 text-sm font-bold text-white">保存</button></div></form></Modal>}
  </>;
}

function Delivery({ customers, setCustomers, flash, deliveryCourses }: { customers: Customer[]; setCustomers: (v: Customer[]) => void; flash: (v: string) => void; deliveryCourses: string[] }) {
  const [route, setRoute] = useState(deliveryCourses[0] ?? "未設定");
  const [date,setDate]=useState(new Date().toISOString().slice(0,10));
  const [dragged,setDragged]=useState<string | null>(null);
  const [contracts,setContracts]=useState<Record<string,InvoiceContract[]>>({});
  const [deliveryActuals,setDeliveryActuals]=useState<DeliveryActuals>({});
  const activeRoute=deliveryCourses.includes(route)?route:(deliveryCourses[0]??"未設定");
  const routeCustomers = customers.filter((c) => c.route === activeRoute);
  const alternativeRoute=deliveryCourses.find((course)=>course!==activeRoute);
  useEffect(()=>{let active=true;loadDemo2State().then((state)=>{if(!active)return;setContracts((state?.contracts??{}) as Record<string,InvoiceContract[]>);setDeliveryActuals((state?.deliveryActuals??{}) as DeliveryActuals)}).catch(()=>flash("Firebaseから配達実績を読み込めませんでした"));return()=>{active=false}},[flash]);
  const moveToRoute=(id:string,target:string)=>{setCustomers(customers.map((c)=>c.id===id?{...c,route:target}:c));flash(`${target}へ移動しました`)};
  const toggleCompleted=(customer:Customer)=>{
    const currentCustomerActuals=deliveryActuals[customer.id]??{};
    const completed=Boolean(currentCustomerActuals[date]);
    const nextCustomerActuals={...currentCustomerActuals};
    if(completed){delete nextCustomerActuals[date]}else{
      const quantities=Object.fromEntries((contracts[customer.id]??[]).filter((contract)=>contract.status==="配送中"&&isScheduledDelivery(contract,date)).map((contract)=>[contract.code,Math.max(0,Number(contract.quantity)||0)]));
      if(!Object.keys(quantities).length){flash(`${customer.name}さんにはこの日の契約配送商品がありません`);return}
      nextCustomerActuals[date]={completedAt:new Date().toISOString(),quantities};
    }
    const next={...deliveryActuals,[customer.id]:nextCustomerActuals};
    setDeliveryActuals(next);
    saveDemo2NestedField("deliveryActuals",customer.id,nextCustomerActuals).then(()=>flash(completed?`${customer.name}さんを未完了に戻しました`:`${customer.name}さんを配達完了にしました`)).catch(()=>{setDeliveryActuals(deliveryActuals);flash("配達完了の保存に失敗しました")});
  };
  return <><Title eyebrow="DELIVERY" title="配達" text="日付ごとの配達順、商品、本数と帳票を管理します。" action={<div className="flex gap-2"><button onClick={() => flash("出力対象のデータがありません")} className="rounded-xl border bg-white px-4 py-2.5 text-sm font-bold">地図用CSV</button><select onChange={(e)=>flash(`${e.target.value}の出力対象がありません`)} defaultValue="" className="rounded-xl bg-[#17362d] px-4 py-2.5 text-sm font-bold text-white"><option value="" disabled>帳票を出力</option>{["順路表","本数集計表","変更リスト","ピッキング","配達納品書","配送リスト"].map((v)=><option key={v}>{v}</option>)}</select></div>} /><div className="mt-5 grid gap-5 xl:grid-cols-[1fr_310px]"><section className="rounded-2xl border border-[#dfe5dc] bg-white"><div className="flex flex-wrap items-center gap-3 border-b p-4"><input type="date" value={date} onChange={(e)=>setDate(e.target.value)} className="h-10 rounded-xl border px-3 text-sm font-bold" /><div className="flex flex-wrap rounded-xl bg-[#eef1ec] p-1">{(deliveryCourses.length?deliveryCourses:["未設定"]).map((r) => <button key={r} onDragOver={(e)=>e.preventDefault()} onDrop={()=>dragged&&moveToRoute(dragged,r)} onClick={() => setRoute(r)} className={`rounded-lg px-4 py-2 text-xs font-bold ${activeRoute===r?"bg-white text-[#17362d] shadow-sm":"text-[#718079]"}`}>{r}</button>)}</div><span className="ml-auto text-xs font-bold text-[#718079]">{routeCustomers.length}件</span></div><div className="p-4"><p className="mb-3 text-[11px] font-bold text-[#89958f]">カードをドラッグして順番変更。上の別コースへドロップするとコース間移動できます。</p>{routeCustomers.length ? <div className="space-y-2">{routeCustomers.map((c,i) => {const completed=Boolean(deliveryActuals[c.id]?.[date]);return <div draggable onDragStart={()=>setDragged(c.id)} onDragOver={(e)=>e.preventDefault()} onDrop={()=>{if(!dragged||dragged===c.id)return;const source=customers.findIndex((x)=>x.id===dragged);const target=customers.findIndex((x)=>x.id===c.id);const copy=[...customers];const [item]=copy.splice(source,1);copy.splice(target,0,item);setCustomers(copy);setDragged(null);flash("配達順を変更しました")}} key={c.id} className={`grid cursor-grab items-center gap-3 rounded-xl border p-3 sm:grid-cols-[56px_1fr_1.2fr_auto] ${completed?"border-[#78a66f] bg-[#f6fbf1]":"border-[#e5e9e2]"}`}><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e9f5db] font-black text-[#38613f]">☰ {i+1}</div><div><p className="font-black">{c.name}</p><p className="mt-1 text-[11px] text-[#89958f]">{c.id}・{c.address}</p></div><div><p className="text-xs font-bold">{c.products}</p><p className="mt-1 text-[11px] text-[#e06b45]">{c.note}</p></div><div className="flex gap-2"><button disabled={!alternativeRoute} onClick={()=>alternativeRoute&&moveToRoute(c.id,alternativeRoute)} className="rounded-lg border px-3 py-2 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-40">別コースへ</button><button onClick={()=>toggleCompleted(c)} className={`rounded-lg px-3 py-2 text-xs font-bold text-white ${completed?"bg-slate-500":"bg-[#78a66f]"}`}>{completed?"完了解除":"完了"}</button></div></div>})}</div> : <div className="py-12 text-center"><p className="font-bold text-[#17362d]">このコースの配達はありません</p><p className="mt-2 text-sm text-[#718079]">顧客登録で配達コースを設定すると表示されます。</p></div>}</div></section><aside className="space-y-4"><div className="rounded-2xl border border-[#f0d8c9] bg-[#fffaf6] p-5"><h3 className="font-black text-[#713b2c]">{date} の変更</h3><p className="mt-4 text-sm text-[#718079]">変更データはありません。</p></div><div className="rounded-2xl border bg-white p-5"><h3 className="font-black">商品別本数・ピッキング</h3><p className="mt-4 text-sm text-[#718079]">集計対象の商品はありません。</p><button onClick={()=>flash(`${activeRoute}の出力対象がありません`)} className="mt-4 w-full rounded-xl border py-2.5 text-xs font-bold">コース別リスト出力</button></div></aside></div></>;
}

function InvoiceDeliveryCalendar({ lines, year, month }: { lines: InvoiceLine[]; year: number; month: number }) {
  const days = Array.from({ length: new Date(year, month, 0).getDate() }, (_, index) => index + 1);
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  return <section className="mt-6 break-inside-avoid"><div className="mb-2 flex items-end justify-between gap-3"><div><h4 className="text-sm font-black">月間お届けカレンダー</h4><p className="mt-1 text-[10px] text-[#718079]">各日のお届け数量と請求明細を照合できます。</p></div><p className="text-xs font-bold">{year}年{month}月</p></div><div className="overflow-x-auto print:overflow-visible"><table className="w-full min-w-[900px] table-fixed border-collapse text-center text-[9px] print:min-w-0 print:text-[7px]"><thead><tr className="bg-[#f1f5f1]"><th className="w-36 border p-1.5 text-left print:w-28">商品</th>{days.map((day)=>{const dayOfWeek=new Date(year,month-1,day).getDay();return <th key={day} className={`w-6 border py-1 ${dayOfWeek===0?"text-red-600":dayOfWeek===6?"text-blue-600":""}`}><span className="block">{day}</span><span className="font-normal">{weekdays[dayOfWeek]}</span></th>})}<th className="w-10 border p-1">計</th></tr></thead><tbody>{lines.length?lines.map((line)=><tr key={`calendar-${line.key}`}><th className="truncate border p-1.5 text-left font-bold" title={line.product}>{line.product}</th>{days.map((day)=><td key={day} className="border py-1 font-bold">{line.dailyQuantities?.[String(day)] || ""}</td>)}<td className="border p-1 font-black">{line.quantity}</td></tr>):<tr><td colSpan={days.length+2} className="border p-4 text-[#718079]">当月のお届けはありません。</td></tr>}</tbody></table></div><p className="mt-2 text-[9px] text-[#718079]">※ 空欄はお届けなし、数字はその日にお届けした数量です。スポット販売は販売日に表示されます。</p></section>;
}

function Billing({ customers, flash, customerFilter, openCustomer }: { customers: Customer[]; flash: (v:string)=>void; customerFilter?: string; openCustomer: (name:string)=>void }) {
  const [paidAt, setPaidAt] = useState<Record<string, string>>({});
  const [invoiceTotals, setInvoiceTotals] = useState<Record<string, number>>({});
  const [billingLoaded, setBillingLoaded] = useState(false);
  const [data, setData] = useState<Awaited<ReturnType<typeof loadDemo2State>>>(null);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [tab, setTab] = useState("請求一覧");
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [query, setQuery] = useState(customerFilter ?? "");

  useEffect(() => {
    let active = true;
    loadDemo2State().then((state) => {
      if (!active) return;
      setData(state);
      setPaidAt(state?.billing?.paidAt ?? {});
      setInvoiceTotals(state?.billing?.invoiceTotals ?? {});
    }).catch(() => flash("Firebaseから請求情報を読み込めませんでした")).finally(() => {
      if (active) setBillingLoaded(true);
    });
    return () => { active = false; };
  }, [flash]);

  const invoices = useMemo(() => {
    const [year, monthNumber] = month.split("-").map(Number);
    if (!year || !monthNumber) return [];
    const daysInMonth = new Date(year, monthNumber, 0).getDate();
    const currentMonth = new Date().toISOString().slice(0, 7);
    const snapshots = (data?.billing?.snapshots ?? {}) as Record<string, InvoiceSnapshot>;
    return customers.map((customer) => {
      const paused = new Set((data?.pausedDeliveries?.[customer.id] ?? []) as string[]);
      const contracts = (data?.contracts?.[customer.id] ?? []) as InvoiceContract[];
      const customerActuals = (data?.deliveryActuals?.[customer.id] ?? {}) as Record<string, DeliveryActual>;
      const lines: InvoiceLine[] = [];
      contracts.filter((contract) => contract.status === "配送中").forEach((contract) => {
        let quantity = 0;
        const dailyQuantities: Record<string, number> = {};
        for (let day = 1; day <= daysInMonth; day += 1) {
          const isoDate = `${month}-${String(day).padStart(2, "0")}`;
          const completedDelivery = customerActuals[isoDate];
          const plannedQuantity = isScheduledDelivery(contract, isoDate) && !paused.has(`${month}-${contract.code}-${day}`) ? Math.max(0, Number(contract.quantity) || 0) : 0;
          const deliveredQuantity = completedDelivery ? Math.max(0, Number(completedDelivery.quantities?.[contract.code]) || 0) : plannedQuantity;
          if (deliveredQuantity > 0) dailyQuantities[String(day)] = deliveredQuantity;
          quantity += deliveredQuantity;
        }
        const unitPrice = Math.max(0, Number(contract.price) || 0);
        if (quantity > 0) lines.push({ key: `contract-${contract.code}`, product: contract.product, quantity, unitPrice, amount: quantity * unitPrice, kind: "contract", dailyQuantities });
      });
      ((data?.spotSales?.[customer.id] ?? []) as SpotSale[])
        .filter((sale) => (sale.soldAt ?? sale.at.slice(0, 10)).slice(0, 7) === month)
        .forEach((sale, index) => {
          const unitPrice = Math.max(0, Number(sale.unitPrice ?? sale.price) || 0);
          const quantity = Math.max(1, Number(sale.quantity) || 1);
          const saleDay = Number((sale.soldAt ?? sale.at.slice(0, 10)).slice(8, 10));
          lines.push({ key: `spot-${sale.at}-${index}`, product: `${sale.product}（スポット）`, quantity, unitPrice, amount: unitPrice * quantity, kind: "spot", dailyQuantities: saleDay ? { [String(saleDay)]: quantity } : {} });
        });
      const key = `${month}:${customer.id}`;
      const savedSnapshot = month < currentMonth ? snapshots[key] : undefined;
      const effectiveLines = savedSnapshot?.lines ?? lines;
      const subtotal = savedSnapshot?.subtotal ?? lines.reduce((sum, line) => sum + line.amount, 0);
      const carryover = Object.entries(invoiceTotals).reduce((sum, [key, total]) => {
        const separator = key.indexOf(":");
        const invoiceMonth = key.slice(0, separator);
        const customerId = key.slice(separator + 1);
        return customerId === customer.id && invoiceMonth < month && !paidAt[key] ? sum + total : sum;
      }, 0);
      return { customer, lines: effectiveLines, subtotal, carryover, total: subtotal + carryover, key };
    });
  }, [customers, data, invoiceTotals, month, paidAt]);

  useEffect(() => {
    if (!billingLoaded) return;
    const timer = window.setTimeout(() => {
      const records = invoices.map((invoice) => ({
        key: invoice.key,
        paidAt: paidAt[invoice.key],
        total: invoice.subtotal,
        snapshot: {
          customerId: invoice.customer.id,
          customerName: invoice.customer.name,
          address: invoice.customer.address,
          lines: invoice.lines,
          subtotal: invoice.subtotal,
          createdAt: new Date().toISOString(),
        } satisfies InvoiceSnapshot,
      }));
      saveDemo2BillingMonth(month, records).then(() => {
        setInvoiceTotals((current) => {
          const next = { ...current };
          let changed = false;
          records.forEach((record) => { if (next[record.key] !== record.total) { next[record.key] = record.total; changed = true; } });
          return changed ? next : current;
        });
      }).catch(() => flash("Firebaseへの請求・入金保存に失敗しました"));
    }, 400);
    return () => window.clearTimeout(timer);
  }, [billingLoaded, flash, invoices, month, paidAt]);

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = invoices.filter(({ customer }) => {
    const matchesCustomer = !normalizedQuery || `${customer.name}${customer.id}`.toLowerCase().includes(normalizedQuery);
    return matchesCustomer && (tab !== "未入金一覧" || !paidAt[`${month}:${customer.id}`]);
  });
  const billedTotal = invoices.reduce((sum, invoice) => sum + invoice.total, 0);
  const paidTotal = invoices.filter((invoice) => paidAt[invoice.key]).reduce((sum, invoice) => sum + invoice.total, 0);
  const unpaid = invoices.filter((invoice) => !paidAt[invoice.key] && invoice.total > 0);
  const monthLabel = month ? `${month.slice(0, 4)}年${Number(month.slice(5))}月分` : "対象月未選択";
  const preview = invoices.find((invoice) => invoice.customer.id === previewId);
  const issueDate = new Date().toLocaleDateString("ja-JP");
  const withdrawalDay = ((data?.settings ?? {}) as Partial<Demo2Settings>).withdrawalDay ?? "";
  const dueLabel = useMemo(() => {
    const day = Number(withdrawalDay.match(/\d+/)?.[0]);
    if (!day) return withdrawalDay || "支払日未設定";
    const [targetYear,targetMonth] = month.split("-").map(Number);
    const nextMonth = withdrawalDay.includes("翌月");
    const lastDay = new Date(targetYear, targetMonth + (nextMonth ? 1 : 0), 0).getDate();
    return new Date(targetYear, targetMonth - 1 + (nextMonth ? 1 : 0), Math.min(day,lastDay)).toLocaleDateString("ja-JP");
  }, [month, withdrawalDay]);
  const issuerName = ((data?.settings ?? {}) as Partial<Demo2Settings>).invoiceName || "発行元未設定";
  const invoiceNumber = preview ? `${month.replace("-", "")}-${preview.customer.id.replace(/[^a-zA-Z0-9]/g, "")}` : "";
  const [invoiceYear, invoiceMonthNumber] = month.split("-").map(Number);

  const togglePaid = (key: string, checked: boolean, name: string) => {
    setPaidAt((current) => {
      const next = { ...current };
      if (checked) next[key] = new Date().toLocaleString("ja-JP");
      else delete next[key];
      return next;
    });
    flash(checked ? `${name}の入金確認日時を記録しました` : `${name}を未入金に戻しました`);
  };

  return <><Title eyebrow="BILLING" title="請求・入金" text={`${monthLabel}の請求書発行と入金確認を管理します。`} action={<div className="flex gap-2"><input type="month" value={month} onChange={(event)=>setMonth(event.target.value)} className="rounded-xl border px-3 text-sm font-bold"/><button disabled={!invoices.length} onClick={()=>setPreviewId(invoices.find((invoice)=>invoice.customer.name===customerFilter)?.customer.id ?? invoices[0]?.customer.id ?? null)} className="rounded-xl bg-[#17362d] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-40">請求書プレビュー</button></div>} />
    <div className="mt-5 flex flex-wrap gap-2">{["請求一覧","未入金一覧","口座振替","キャンペーン請求書"].map((item)=><button key={item} onClick={()=>setTab(item)} className={`rounded-xl px-4 py-2 text-sm font-bold ${tab===item?"bg-[#17362d] text-white":"border bg-white"}`}>{item}</button>)}</div>
    <div className="mt-4 grid gap-4 sm:grid-cols-3">{[["請求額",`¥${billedTotal.toLocaleString()}`],["入金率",billedTotal ? `${Math.round((paidTotal/billedTotal)*100)}%` : "—"],["未入金",`${unpaid.length}名 / ¥${unpaid.reduce((sum, invoice)=>sum+invoice.total,0).toLocaleString()}`]].map(([label,value],index)=><div key={label} className={`rounded-2xl border p-5 ${index===2?"border-[#f0d8c9] bg-[#fffaf6]":"border-[#dfe5dc] bg-white"}`}><p className="text-xs font-bold text-[#718079]">{label}</p><p className="mt-2 text-2xl font-black">{value}</p></div>)}</div>
    {tab==="口座振替" ? <section className="mt-5 rounded-2xl border bg-white p-5"><h3 className="font-black">口座振替 4ステップ</h3><div className="mt-4 grid gap-3 md:grid-cols-4">{["1. 対象を抽出","2. 銀行CSVを出力","3. 結果を取り込む","4. 入金に反映"].map((step,index)=><button key={step} onClick={()=>flash("処理対象のデータがありません")} className="rounded-xl border p-4 text-left text-sm font-bold"><span className="mb-2 block text-xs text-[#718079]">STEP {index+1}</span>{step}</button>)}</div></section> : tab==="キャンペーン請求書" ? <section className="mt-5 rounded-2xl border bg-white p-5"><h3 className="font-black">キャンペーン請求書</h3><p className="mt-2 text-sm text-[#718079]">対象データはありません。</p></section> : <section className="mt-5 overflow-hidden rounded-2xl border border-[#dfe5dc] bg-white"><div className="flex flex-wrap gap-3 border-b p-4"><input value={query} onChange={(event)=>setQuery(event.target.value)} placeholder="顧客名・番号で検索" className="h-10 min-w-56 flex-1 rounded-xl border bg-[#f8faf7] px-3 text-sm"/><select className="h-10 rounded-xl border px-3 text-sm font-bold"><option>すべての支払方法</option><option>口座振替</option><option>クレジット</option><option>現金集金</option><option>LINE</option></select></div>{tab==="未入金一覧" && <div className="border-b bg-amber-50 px-4 py-3 text-xs font-bold text-amber-800">未入金の顧客のみ表示しています（入金済みは除外）。</div>}{filtered.length ? <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-[#f7f9f6] text-xs text-[#718079]"><tr><th className="p-4">入金</th><th>顧客</th><th>支払方法</th><th>当月売上</th><th>繰越</th><th>請求額</th><th>確認日時</th><th>請求書</th></tr></thead><tbody className="divide-y">{filtered.map((invoice)=><tr key={invoice.key}><td className="p-4"><input aria-label={`${invoice.customer.name}の入金確認`} type="checkbox" checked={Boolean(paidAt[invoice.key])} onChange={(event)=>togglePaid(invoice.key,event.target.checked,invoice.customer.name)} className="h-5 w-5 accent-[#78a66f]"/></td><td><button onClick={()=>openCustomer(invoice.customer.name)} className="font-black text-[#3f6b50] hover:underline">{invoice.customer.name}</button><p className="text-[11px] text-[#89958f]">{invoice.customer.id}</p></td><td>{invoice.customer.payment}</td><td>¥{invoice.subtotal.toLocaleString()}</td><td>¥{invoice.carryover.toLocaleString()}</td><td className="font-black">¥{invoice.total.toLocaleString()}</td><td>{paidAt[invoice.key] ?? "—"}</td><td><button onClick={()=>setPreviewId(invoice.customer.id)} className="font-bold text-[#3f6b50]">プレビュー →</button></td></tr>)}</tbody></table></div> : <div className="p-10 text-center text-sm text-[#718079]">請求データはありません。</div>}</section>}
    {preview && <Modal title="請求書プレビュー" onClose={()=>setPreviewId(null)}>
      <div className="print:hidden mb-4 flex justify-end"><button onClick={()=>window.print()} className="rounded-xl bg-[#17362d] px-5 py-2.5 text-sm font-bold text-white">印刷・PDF保存</button></div>
      <article className="mx-auto max-w-[1100px] border bg-white p-6 shadow-sm print:max-w-none print:border-0 print:p-0 print:shadow-none">
        <div className="flex justify-between gap-6 text-xs"><div><p className="text-lg font-black">{issuerName}</p><p className="mt-1 text-[#718079]">請求番号：{invoiceNumber}</p></div><div className="text-right"><p>{monthLabel}</p><p>発行日：{issueDate}</p><p>支払期限：{dueLabel}</p></div></div>
        <h3 className="mt-5 text-center text-2xl font-black">請求書</h3>
        <div className="mt-5 border-b pb-4"><p className="text-xl font-black">{preview.customer.name} 様</p><p className="mt-2 text-sm">{preview.customer.address || "住所未登録"}</p></div>
        <div className="grid items-start gap-5 lg:grid-cols-[1fr_280px] print:grid-cols-[1fr_250px]">
          <table className="mt-5 w-full text-sm"><thead className="bg-[#f7f9f6]"><tr><th className="p-3 text-left">商品</th><th>数量</th><th>単価</th><th className="text-right">金額</th></tr></thead><tbody>{preview.lines.length ? preview.lines.map((line)=><tr key={line.key} className="border-b"><td className="p-3">{line.product}</td><td className="text-center">{line.quantity}{line.kind==="contract"?"本":"点"}</td><td className="text-right">¥{line.unitPrice.toLocaleString()}</td><td className="text-right">¥{line.amount.toLocaleString()}</td></tr>) : <tr><td colSpan={4} className="p-6 text-center text-[#718079]">当月の請求明細はありません。</td></tr>}</tbody></table>
          <div className="mt-5 space-y-2 rounded-xl border p-4 text-sm"><p className="flex justify-between"><span>当月売上</span><b>¥{preview.subtotal.toLocaleString()}</b></p><p className="flex justify-between"><span>前月までの未入金繰越</span><b>¥{preview.carryover.toLocaleString()}</b></p><p className="flex justify-between border-t pt-3 text-xl font-black"><span>ご請求額</span><span>¥{preview.total.toLocaleString()}</span></p></div>
        </div>
        <InvoiceDeliveryCalendar lines={preview.lines} year={invoiceYear} month={invoiceMonthNumber}/>
      </article>
    </Modal>}</>;
}
function Analysis({ customers }: { customers: Customer[] }) {
  const [basis,setBasis]=useState("月別");
  const [month,setMonth]=useState(new Date().toISOString().slice(0,7));
  const [state,setState]=useState<Awaited<ReturnType<typeof loadDemo2State>>>(null);
  useEffect(()=>{let active=true;loadDemo2State().then((value)=>{if(active)setState(value)}).catch(()=>{});return()=>{active=false}},[]);
  const entries=Object.entries(state?.billing?.invoiceTotals??{}).filter(([key])=>key.startsWith(`${month}:`));
  const sales=entries.reduce((sum,[,total])=>sum+total,0);
  const paid=entries.filter(([key])=>Boolean(state?.billing?.paidAt?.[key])).reduce((sum,[,total])=>sum+total,0);
  const newCount=customers.filter((customer)=>customer.start.replaceAll("/","-").startsWith(month)).length;
  const cancelledCount=Object.values(state?.contractHistory??{}).flat().filter((entry)=>{const item=entry as {at?:string;action?:string};return item.action==="解約"&&item.at?.slice(0,7)===month}).length;
  return <><Title eyebrow="SALES & INSIGHTS" title="売上・顧客分析" text="売上、入金進捗、新規・解約を同じ期間条件で確認できます。" action={<div className="flex gap-2"><select value={basis} onChange={(event)=>setBasis(event.target.value)} className="rounded-xl border bg-white px-3 text-sm font-bold"><option>日別</option><option>商品別</option><option>期間指定</option><option>月別</option></select><input aria-label="分析対象月" type="month" value={month} onChange={(event)=>setMonth(event.target.value)} className="rounded-xl border px-3 text-sm font-bold"/></div>} /><div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[["売上",`¥${sales.toLocaleString()}`,entries.length?"請求データから集計":"実績データなし"],["入金率",sales?`${Math.round((paid/sales)*100)}%`:"—",sales?`¥${paid.toLocaleString()} 入金済み`:"入金データなし"],["新規",`${newCount}名`,`${month} 登録`],["解約",`${cancelledCount}件`,`${month} 履歴`]].map(([label,value,note])=><div key={label} className="rounded-2xl border border-[#dfe5dc] bg-white p-5"><p className="text-xs font-bold text-[#718079]">{label}</p><p className="mt-3 text-2xl font-black text-[#17362d]">{value}</p><p className="mt-2 text-xs font-bold text-[#55915b]">{note}</p></div>)}</div><section className="mt-5 rounded-2xl border bg-white p-6"><h3 className="font-black text-[#17362d]">{basis}集計</h3>{entries.length?<div className="mt-4 space-y-3">{entries.map(([key,total])=><div key={key} className="flex items-center justify-between rounded-xl bg-[#f7f9f6] p-4 text-sm"><span>{customers.find((customer)=>key.endsWith(`:${customer.id}`))?.name??key.split(":").slice(1).join(":")}</span><b>¥{total.toLocaleString()}</b></div>)}</div>:<p className="mt-3 text-sm text-[#718079]">対象月の請求データはありません。</p>}</section></>;
}

function Settings({ flash, onDeliveryCoursesChange }: { flash:(v:string)=>void; onDeliveryCoursesChange:(courses:string[])=>void }) {
  const [price,setPrice]=useState(""); const [taxMode,setTaxMode]=useState("内税"); const [taxRate,setTaxRate]=useState(10); const [lockMonth,setLockMonth]=useState(""); const [panel,setPanel]=useState<string | null>(null); const [products,setProducts]=useState<ProductRow[]>([]); const [productsLoaded,setProductsLoaded]=useState(false); const savedProducts=useRef<ProductRow[]>([]); const [settings,setSettings]=useState<Demo2Settings>(emptySettings); const [settingsLoaded,setSettingsLoaded]=useState(false); const [productDraft,setProductDraft]=useState({code:"",name:"",supplier:"",category:"宅配",price:"",tax:"10%"}); const numericPrice=Number(price||0); const tax=Math.round(numericPrice-numericPrice/(1+taxRate/100));
  useEffect(()=>{let active=true;loadDemo2State().then((state)=>{if(active&&Array.isArray(state?.products)){const loaded=state.products.map(toProductRow).filter((row): row is ProductRow => row !== null);setProducts(loaded);savedProducts.current=loaded}if(active&&state?.settings){const loaded=normalizeSettings(state.settings);setSettings(loaded);onDeliveryCoursesChange(loaded.deliveryCourses)}}).catch(()=>flash("Firebaseから設定情報を読み込めませんでした")).finally(()=>{if(active){setProductsLoaded(true);setSettingsLoaded(true)}});return()=>{active=false}},[flash,onDeliveryCoursesChange]);
  useEffect(()=>{if(!productsLoaded)return;const timer=window.setTimeout(()=>{const previous=savedProducts.current;const previousByCode=new Map(previous.map((item)=>[item[0],item]));const upserts=products.filter((item)=>JSON.stringify(previousByCode.get(item[0]))!==JSON.stringify(item)).map(toStoredProduct);const currentCodes=new Set(products.map((item)=>item[0]));const deletedIds=previous.filter((item)=>!currentCodes.has(item[0])).map((item)=>item[0]);saveDemo2RecordChanges("products",upserts as unknown as Array<Record<string,unknown>>,deletedIds,"code").then(()=>{savedProducts.current=products}).catch(()=>flash("Firebaseへの商品保存に失敗しました"))},400);return()=>window.clearTimeout(timer)},[products,productsLoaded,flash]);
  useEffect(()=>{if(!settingsLoaded)return;const timer=window.setTimeout(()=>{saveDemo2Field("settings",settings).catch(()=>flash("Firebaseへの設定保存に失敗しました"))},400);return()=>window.clearTimeout(timer)},[settings,settingsLoaded,flash]);
  const updateProduct=(index:number,column:number,value:string)=>setProducts((current)=>current.map((row,rowIndex)=>rowIndex===index?row.map((cell,columnIndex)=>columnIndex===column?value:cell) as ProductRow:row));
  const addProduct=()=>{if(!productDraft.code.trim()||!productDraft.name.trim()||!productDraft.supplier.trim())return;setProducts((current)=>[...current,[productDraft.code.trim(),productDraft.name.trim(),productDraft.category,`¥${Number(productDraft.price||0).toLocaleString()}`,productDraft.tax,productDraft.supplier.trim()]]);setProductDraft({code:"",name:"",supplier:"",category:"宅配",price:"",tax:"10%"});setPanel(null);flash("商品を登録しました")};
  const updateCourse=(key:"deliveryCourses"|"collectionCourses",index:number,value:string)=>setSettings((current)=>({...current,[key]:current[key].map((course,courseIndex)=>courseIndex===index?value:course)}));
  const saveCourses=()=>{const delivery=normalizeCourses(settings.deliveryCourses,[]);const collection=normalizeCourses(settings.collectionCourses,[]);if(!delivery.length){flash("配達コースを1件以上登録してください");return}setSettings((current)=>({...current,deliveryCourses:delivery,collectionCourses:collection}));onDeliveryCoursesChange(delivery);flash("コース設定を保存しました");setPanel(null)};
  return <><Title eyebrow="PRODUCTS & SETTINGS" title="商品・設定" text="商品、税、締日、帳票、コースと過去データ権限をまとめます。" action={<button onClick={()=>setPanel("商品登録")} className="rounded-xl bg-[#17362d] px-4 py-2.5 text-sm font-bold text-white">＋ 商品登録</button>} />
  <section className="mt-5 overflow-hidden rounded-2xl border bg-white"><div className="border-b p-4"><h3 className="font-black">商品マスタ</h3><p className="mt-1 text-xs text-[#718079]">商品名・価格・仕入先は表から直接編集でき、自動保存されます。</p></div><div className="overflow-x-auto"><table className="w-full min-w-[800px] text-left text-sm"><thead className="bg-[#f7f9f6] text-xs text-[#718079]"><tr><th className="p-4">コード・商品名</th><th>分類</th><th>税込価格</th><th>税区分</th><th>税率</th><th>仕入先</th><th /></tr></thead><tbody className="divide-y">{products.map(([code,name,category,p,productTax,supplier],index)=><tr key={code}><td className="p-4"><input aria-label={`${code}の商品名`} value={name} onChange={(event)=>updateProduct(index,1,event.target.value)} className="w-full min-w-44 border-b border-transparent bg-transparent font-bold outline-none focus:border-[#78a66f]"/><p className="text-[11px] text-[#89958f]">{code}</p></td><td><select value={category} onChange={(event)=>updateProduct(index,2,event.target.value)} className="rounded-lg border-0 bg-[#e9f5db] px-2 py-1 text-xs font-bold"><option>宅配</option><option>スポット</option><option>卸</option></select></td><td><input aria-label={`${code}の税込価格`} value={p} onChange={(event)=>updateProduct(index,3,event.target.value)} className="w-24 border-b border-transparent bg-transparent font-black outline-none focus:border-[#78a66f]"/></td><td>{taxMode}</td><td><select value={productTax} onChange={(event)=>updateProduct(index,4,event.target.value)} className="bg-transparent"><option>8%</option><option>10%</option></select></td><td><input aria-label={`${code}の仕入先`} value={supplier} onChange={(event)=>updateProduct(index,5,event.target.value)} className="w-full border-b border-transparent bg-transparent outline-none focus:border-[#78a66f]"/></td><td><button onClick={()=>setProducts((current)=>current.filter((row)=>row[0]!==code))} className="font-bold text-red-600">削除</button></td></tr>)}</tbody></table></div></section>
  <section className="mt-5 rounded-2xl border bg-white p-5"><h3 className="font-black">価格・税計算</h3><div className="mt-4 grid gap-4 md:grid-cols-5"><Label label="税込価格"><input type="number" value={price} onChange={(e)=>setPrice(e.target.value)} className="field"/></Label><Label label="税区分"><select value={taxMode} onChange={(e)=>setTaxMode(e.target.value)} className="field"><option>内税</option><option>外税</option></select></Label><Label label="税率"><select value={taxRate} onChange={(e)=>setTaxRate(Number(e.target.value))} className="field"><option value="8">8%</option><option value="10">10%</option></select></Label><div><p className="text-xs font-bold text-[#53645b]">税抜価格</p><p className="mt-3 text-lg font-black">{price ? `¥${(numericPrice-tax).toLocaleString()}` : "—"}</p></div><div><p className="text-xs font-bold text-[#53645b]">消費税</p><p className="mt-3 text-lg font-black">{price ? `¥${tax.toLocaleString()}` : "—"}</p></div></div></section>
  <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{[["締日・引落日","月末締め／ゆうちょ等の個別引落日"],["帳票印字名","請求書・納品書に印字する名称"],["コース設定","配達コース・集金コースを管理"]].map(([a,b])=><button key={a} onClick={()=>setPanel(a)} className="rounded-2xl border bg-white p-5 text-left hover:border-[#78a66f]"><h3 className="font-black text-[#17362d]">{a}</h3><p className="mt-2 text-xs leading-5 text-[#718079]">{b}</p><p className="mt-4 text-xs font-bold text-[#3f6b50]">設定する →</p></button>)}</div>
  <section className="mt-5 rounded-2xl border bg-white p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-black">過去データのロック</h3><p className="mt-1 text-xs text-[#718079]">締め済み月は顧客詳細でもグレー表示になり、配送実績を編集できません。</p></div><select value={settings.permission} onChange={(event)=>setSettings((current)=>({...current,permission:event.target.value}))} className="rounded-xl border px-3 py-2 text-sm font-bold"><option>一般：閲覧のみ</option><option>責任者：理由入力で編集</option><option>管理者：締め解除可能</option></select></div><div className="mt-4 rounded-xl border bg-slate-50 p-4"><div className="flex flex-wrap items-center gap-3"><input aria-label="締め対象月" type="month" value={lockMonth} onChange={(event)=>setLockMonth(event.target.value)} className="h-10 rounded-lg border bg-white px-3 text-sm"/><button disabled={!lockMonth} onClick={()=>{setSettings((current)=>({...current,closedMonths:current.closedMonths.includes(lockMonth)?current.closedMonths.filter((value)=>value!==lockMonth):[...current.closedMonths,lockMonth]}));flash(settings.closedMonths.includes(lockMonth)?"締めを解除しました":"対象月を締めました")}} className="rounded-lg border bg-white px-4 py-2 text-xs font-bold disabled:opacity-40">{settings.closedMonths.includes(lockMonth)?"締めを解除":"この月を締める"}</button><span className="text-xs text-[#718079]">締め済み：{settings.closedMonths.length?settings.closedMonths.join("、"):"なし"}</span></div></div></section>
  <section className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5"><h3 className="font-black text-amber-900">要確認</h3><div className="mt-3 grid gap-3 md:grid-cols-3">{[["要フォロー判定条件","自動判定条件を先方確認"],["一括処理","臨時休業・単価変更を残すか確認"],["履歴・変更ログ","独立画面をなくすか確認"]].map(([a,b])=><div key={a} className="rounded-xl bg-white p-4"><span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-black text-amber-800">要確認</span><p className="mt-2 text-sm font-black">{a}</p><p className="mt-1 text-xs text-[#718079]">{b}</p></div>)}</div></section>
  {panel && <Modal title={panel} onClose={()=>setPanel(null)}>{panel==="商品登録" ? <form onSubmit={(event)=>{event.preventDefault();addProduct()}}><div className="grid gap-4 sm:grid-cols-2"><Label label="商品コード（必須）"><input required value={productDraft.code} onChange={(event)=>setProductDraft((current)=>({...current,code:event.target.value}))} className="field" placeholder="例：M-002"/></Label><Label label="商品名（必須）"><input required value={productDraft.name} onChange={(event)=>setProductDraft((current)=>({...current,name:event.target.value}))} className="field"/></Label><Label label="仕入先（必須）"><input required value={productDraft.supplier} onChange={(event)=>setProductDraft((current)=>({...current,supplier:event.target.value}))} className="field"/></Label><Label label="商品分類"><select value={productDraft.category} onChange={(event)=>setProductDraft((current)=>({...current,category:event.target.value}))} className="field"><option>宅配</option><option>スポット</option><option>卸</option></select></Label><Label label="税込価格"><input required min="0" value={productDraft.price} onChange={(event)=>setProductDraft((current)=>({...current,price:event.target.value}))} type="number" className="field"/></Label><Label label="税率"><select value={productDraft.tax} onChange={(event)=>setProductDraft((current)=>({...current,tax:event.target.value}))} className="field"><option>8%</option><option>10%</option></select></Label></div><div className="mt-6 flex justify-end"><button type="submit" className="rounded-xl bg-[#17362d] px-5 py-2.5 text-sm font-bold text-white">保存</button></div></form> : panel==="コース設定" ? <div className="grid gap-6 sm:grid-cols-2"><div><p className="text-sm font-black text-[#17362d]">配達コース</p><div className="mt-3 space-y-2">{settings.deliveryCourses.map((course,index)=><div key={`delivery-${index}`} className="flex gap-2"><input aria-label={`配達コース${index+1}`} value={course} onChange={(event)=>updateCourse("deliveryCourses",index,event.target.value)} className="field"/><button type="button" onClick={()=>setSettings((current)=>({...current,deliveryCourses:current.deliveryCourses.filter((_,courseIndex)=>courseIndex!==index)}))} className="rounded-lg border px-3 text-xs font-bold text-red-600">削除</button></div>)}</div><button type="button" onClick={()=>setSettings((current)=>({...current,deliveryCourses:[...current.deliveryCourses,""]}))} className="mt-3 text-xs font-bold text-[#3f6b50]">＋ 配達コースを追加</button></div><div><p className="text-sm font-black text-[#17362d]">集金コース</p><div className="mt-3 space-y-2">{settings.collectionCourses.map((course,index)=><div key={`collection-${index}`} className="flex gap-2"><input aria-label={`集金コース${index+1}`} value={course} onChange={(event)=>updateCourse("collectionCourses",index,event.target.value)} className="field"/><button type="button" onClick={()=>setSettings((current)=>({...current,collectionCourses:current.collectionCourses.filter((_,courseIndex)=>courseIndex!==index)}))} className="rounded-lg border px-3 text-xs font-bold text-red-600">削除</button></div>)}</div><button type="button" onClick={()=>setSettings((current)=>({...current,collectionCourses:[...current.collectionCourses,""]}))} className="mt-3 text-xs font-bold text-[#3f6b50]">＋ 集金コースを追加</button></div><div className="sm:col-span-2 flex justify-end"><button type="button" onClick={saveCourses} className="rounded-xl bg-[#17362d] px-5 py-2.5 text-sm font-bold text-white">保存</button></div></div> : <div className="grid gap-4 sm:grid-cols-2">{panel==="締日・引落日" ? <><Label label="締日"><input value={settings.closingDay} onChange={(event)=>setSettings((current)=>({...current,closingDay:event.target.value}))} className="field" placeholder="例：月末"/></Label><Label label="引落・集金日"><input value={settings.withdrawalDay} onChange={(event)=>setSettings((current)=>({...current,withdrawalDay:event.target.value}))} className="field" placeholder="例：翌月27日"/></Label></> : <><Label label="請求書の印字名"><input value={settings.invoiceName} onChange={(event)=>setSettings((current)=>({...current,invoiceName:event.target.value}))} className="field"/></Label><Label label="納品書の印字名"><input value={settings.deliveryName} onChange={(event)=>setSettings((current)=>({...current,deliveryName:event.target.value}))} className="field"/></Label></>}<div className="sm:col-span-2 mt-2 flex justify-end"><button onClick={()=>{flash(`${panel}を保存しました`);setPanel(null)}} className="rounded-xl bg-[#17362d] px-5 py-2.5 text-sm font-bold text-white">保存</button></div></div>}</Modal>}</>;
}

function Title({ eyebrow,title,text,action }: { eyebrow:string;title:string;text:string;action?:React.ReactNode }) { return <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-[10px] font-black tracking-[.18em] text-[#78a66f]">{eyebrow}</p><h2 className="mt-1 text-2xl font-black tracking-tight text-[#17362d] sm:text-3xl">{title}</h2><p className="mt-2 text-sm text-[#718079]">{text}</p></div>{action}</div> }
function Pill({ children,tone }: { children:React.ReactNode;tone:"green"|"amber" }) { return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-black ${tone==="green"?"bg-[#e9f5db] text-[#38613f]":"bg-[#fff1d6] text-[#9a641c]"}`}>{children}</span> }
function Label({ label,children }: { label:string;children:React.ReactNode }) { return <label className="block text-xs font-bold text-[#53645b]">{label}{children}</label> }
function Modal({ title,children,onClose }: { title:string;children:React.ReactNode;onClose:()=>void }) { return <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#17362d]/45 p-4" onMouseDown={onClose}><div className="max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-2xl bg-white shadow-2xl" onMouseDown={(e)=>e.stopPropagation()}><div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4"><h3 className="text-xl font-black text-[#17362d]">{title}</h3><button onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">✕</button></div><div className="p-6">{children}</div></div></div> }
