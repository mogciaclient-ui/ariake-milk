"use client";

import { useEffect, useMemo, useState } from "react";
import { ProductLogo } from "@/components/product-logo";
import { useDemoOffice } from "@/lib/demo-office";
import { demoProducts } from "@/lib/product-navigation";
import { loadDemo2State, saveDemo2Contract, saveDemo2NestedField } from "@/lib/demo2-firestore";

const customers = [
  { code: "0001842", name: "山田 花子", kana: "ヤマダ ハナコ", route: "A-12", address: "佐賀県神埼郡吉野ヶ里町吉田 1234-5", tel: "0952-00-1234" },
  { code: "0002056", name: "鈴木 一郎", kana: "スズキ イチロウ", route: "B-07", address: "佐賀県神埼市神埼町本堀 201-4", tel: "0952-00-2056" },
  { code: "0002311", name: "高橋 悦子", kana: "タカハシ エツコ", route: "A-03", address: "佐賀県三養基郡上峰町坊所 88-2", tel: "0952-00-2311" },
];

type Contract = { code: string; product: string; price: number; start: string; days: number[]; quantity: number; status: "配送中" | "休配" | "停止" | "解約" };
type HistoryEntry = { at: string; action: string; detail: string };
type MasterProduct = { code: string; name: string; price: string };
type SpotSale = { product: string; unitPrice: number; quantity: number; soldAt: string; at: string };

const initialContracts: Contract[] = [];

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

type EmbeddedCustomer = { id: string; name: string; kana: string; address: string; phoneHome: string; phoneMobile: string; route: string; order: number; start: string; birthday: string; payment: string; note: string; follow: string };

export function ContractPerformanceScreen({ initialCustomerName, initialCustomer, embedded = false, onBack, onOpenBilling, onSaveCustomer }: { initialCustomerName?: string; initialCustomer?: EmbeddedCustomer; embedded?: boolean; onBack?: () => void; onOpenBilling?: (customerName: string) => void; onSaveCustomer?: (changes: Partial<EmbeddedCustomer>) => void } = {}) {
  const product = demoProducts[0];
  const { office } = useDemoOffice();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(() => Math.max(0, customers.findIndex((item) => item.name === initialCustomerName)));
  const [month, setMonth] = useState(() => new Date().getMonth() + 1);
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [notice, setNotice] = useState("");
  const [newContractOpen, setNewContractOpen] = useState(false);
  const [contractRows, setContractRows] = useState(initialContracts);
  const [newProduct, setNewProduct] = useState("");
  const [newDays, setNewDays] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [pausedDeliveries, setPausedDeliveries] = useState<Set<string>>(new Set());
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [closedMonths, setClosedMonths] = useState<string[]>([]);
  const [spotSales, setSpotSales] = useState<SpotSale[]>([]);
  const [spotSaleOpen, setSpotSaleOpen] = useState(false);
  const [spotDraft, setSpotDraft] = useState({ product: "", unitPrice: "", quantity: "1", soldAt: new Date().toISOString().slice(0,10) });
  const [deliveryCourses, setDeliveryCourses] = useState(["Aコース", "Bコース"]);
  const [collectionCourses, setCollectionCourses] = useState(["集金Aコース", "集金Bコース"]);
  const [selectedContractCode, setSelectedContractCode] = useState("");
  const [masterProducts, setMasterProducts] = useState<MasterProduct[]>([]);
  const [billing, setBilling] = useState<{ paidAt: Record<string,string>; invoiceTotals: Record<string,number> }>({ paidAt:{}, invoiceTotals:{} });
  const fallbackCustomer = initialCustomerName === "新規顧客" ? { code: "新規", name: "新規顧客", kana: "", route: "未設定", address: "", tel: "" } : customers[selected];
  const customer = initialCustomer ? { code: initialCustomer.id, name: initialCustomer.name, kana: initialCustomer.kana, route: initialCustomer.route.replace("コース", ""), address: initialCustomer.address, tel: "" } : fallbackCustomer;
  const [customerFields, setCustomerFields] = useState(() => ({
    name: initialCustomer?.name ?? customer.name,
    kana: initialCustomer?.kana ?? customer.kana,
    address: initialCustomer?.address ?? customer.address,
    phoneHome: initialCustomer?.phoneHome ?? customer.tel ?? "",
    phoneMobile: initialCustomer?.phoneMobile ?? "",
    route: initialCustomer?.route ?? `${customer.route}コース`,
    order: initialCustomer?.order ?? selected + 1,
    birthday: initialCustomer?.birthday ?? "1968/04/12",
    note: initialCustomer?.note ?? "玄関横の宅配ボックスへ",
    payment: initialCustomer?.payment ?? "口座振替",
    collectionRoute: "",
    collectionNote: "",
  }));
  const [contractsLoaded, setContractsLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    loadDemo2State().then((state) => {
      const stored = state?.contracts?.[customer.code];
      if (active && Array.isArray(stored)) setContractRows((stored as Array<Partial<Contract>>).map((item) => ({ ...item, quantity: item.quantity ?? 1, status: item.status ?? "配送中" })) as Contract[]);
      const meta = state?.customerMeta?.[customer.code];
      if (active && meta) setCustomerFields((current) => ({ ...current, collectionRoute: String(meta.collectionRoute ?? ""), collectionNote: String(meta.collectionNote ?? "") }));
      if (active && Array.isArray(state?.contractHistory?.[customer.code])) setHistory(state.contractHistory[customer.code] as HistoryEntry[]);
      if (active && Array.isArray(state?.pausedDeliveries?.[customer.code])) setPausedDeliveries(new Set(state.pausedDeliveries[customer.code]));
      if (active && Array.isArray(state?.spotSales?.[customer.code])) setSpotSales((state.spotSales[customer.code] as Array<Partial<SpotSale> & { price?: number }>).map((sale)=>({product:String(sale.product??""),unitPrice:Math.max(0,Number(sale.unitPrice??sale.price)||0),quantity:Math.max(1,Number(sale.quantity)||1),soldAt:String(sale.soldAt??sale.at?.slice(0,10)??new Date().toISOString().slice(0,10)),at:String(sale.at??new Date().toISOString())})));
      if (active && Array.isArray(state?.settings?.closedMonths)) setClosedMonths(state.settings.closedMonths as string[]);
      if (active && Array.isArray(state?.settings?.deliveryCourses)) setDeliveryCourses((state.settings.deliveryCourses as unknown[]).map(String).filter(Boolean));
      if (active && Array.isArray(state?.settings?.collectionCourses)) setCollectionCourses((state.settings.collectionCourses as unknown[]).map(String).filter(Boolean));
      if (active && Array.isArray(state?.products)) setMasterProducts((state.products as Array<Partial<MasterProduct>>).filter((item): item is MasterProduct => typeof item.code==="string"&&typeof item.name==="string"&&typeof item.price==="string"));
      if (active) setBilling({ paidAt: state?.billing?.paidAt ?? {}, invoiceTotals: state?.billing?.invoiceTotals ?? {} });
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
  const monthKey = `${year}-${String(month).padStart(2, "0")}`;
  const isClosedMonth = closedMonths.includes(monthKey);
  const contractMonths = initialCustomer?.start ? Math.max(0, (new Date().getFullYear() - Number(initialCustomer.start.slice(0, 4))) * 12 + new Date().getMonth() + 1 - Number(initialCustomer.start.slice(5, 7))) : 0;
  const days = useMemo(() => Array.from({ length: new Date(year, month, 0).getDate() }, (_, index) => index + 1), [month, year]);
  const visibleCustomers = customers.filter((item) => `${item.code}${item.name}${item.kana}`.includes(query.trim()));
  const monthlyTotal = contractRows.reduce((sum, item) => {
    if ((item.status ?? "配送中") !== "配送中") return sum;
    const plannedDays = days.filter((day) => item.days[new Date(year, month - 1, day).getDay()]);
    const delivered = plannedDays.filter((day) => !pausedDeliveries.has(`${monthKey}-${item.code}-${day}`)).length * (item.quantity ?? 1);
    return sum + delivered * item.price;
  }, 0) + spotSales.filter((sale)=>sale.soldAt.slice(0,7)===monthKey).reduce((sum,sale)=>sum+sale.unitPrice*sale.quantity,0);
  const previousDate = new Date(year, month - 2, 1);
  const previousMonthKey = `${previousDate.getFullYear()}-${String(previousDate.getMonth()+1).padStart(2,"0")}`;
  const previousInvoiceKey = `${previousMonthKey}:${customer.code}`;
  const currentInvoiceKey = `${monthKey}:${customer.code}`;
  const previousInvoice = billing.invoiceTotals[previousInvoiceKey] ?? 0;
  const paidAmount = billing.paidAt[currentInvoiceKey] ? (billing.invoiceTotals[currentInvoiceKey] ?? monthlyTotal) : 0;
  const carryover = Object.entries(billing.invoiceTotals).reduce((sum,[key,total])=>key.endsWith(`:${customer.code}`)&&key.slice(0,7)<monthKey&&!billing.paidAt[key]?sum+total:sum,0);
  const recordHistory = (action: string, detail: string) => {
    const next = [{ at: new Date().toISOString(), action, detail }, ...history];
    setHistory(next);
    saveDemo2NestedField("contractHistory", customer.code, next).catch(() => setNotice("変更履歴の保存に失敗しました"));
  };
  const applyContractAction = (action: string) => {
    const target = contractRows.find((item)=>item.code===selectedContractCode);
    if (!target) { setNotice("対象商品を選択してください"); return; }
    if ((action==="解約"||action==="商品入替")&&!window.confirm(`${target.product}を「${action}」します。よろしいですか？`)) return;
    setContractRows((rows) => rows.map((item) => {
      if (item.code !== selectedContractCode) return item;
      if (action === "休配") return { ...item, status: "休配" };
      if (action === "停止") return { ...item, status: "停止" };
      if (action === "再開") return { ...item, status: "配送中" };
      if (action === "解約") return { ...item, status: "解約" };
      if (action === "パターン変更") return { ...item, days: item.days.map((value, index) => item.days[(index + 6) % 7]) };
      if (action === "商品入替") {
        const replacement=masterProducts.find((product)=>product.name!==item.product);
        return replacement ? { ...item, product: replacement.name, price: Number(replacement.price.replace(/[^0-9]/g,"")) } : item;
      }
      return item;
    }));
    recordHistory(action, `${target.product}に反映`);
    setNotice(`${target.product}の「${action}」を保存しました`);
  };

  return <div className={`mx-auto max-w-[1500px] space-y-5 ${embedded ? "demo2-contract" : ""}`}>
    <div className="flex items-center gap-2 text-xs font-bold text-slate-400">{embedded ? <button onClick={onBack} className="mr-2 rounded-lg border bg-white px-3 py-1.5 text-slate-600">← 顧客一覧</button> : <><ProductLogo product={product} size={20} /><span className="font-logo text-[10px] font-normal text-[#0F172A]">milmo<span className="text-[#EF4444]">.</span></span><span>/</span><span>契約実績</span></>}</div>

    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div><h1 className="text-2xl font-bold tracking-tight">{embedded ? "顧客詳細" : "契約・実績"}</h1><p className="mt-1.5 text-sm text-slate-500">{embedded ? "顧客の基本情報から請求・入金までを一画面で確認します。" : `${office.name}の顧客契約と日別配送実績を確認・更新します。`}</p></div>
      <div className="flex flex-wrap gap-2"><button onClick={() => setHistoryOpen(true)} className="rounded-xl border bg-white px-4 py-2.5 text-sm font-bold text-slate-600">変更履歴</button><button onClick={() => setNewContractOpen(true)} className="rounded-xl border border-[#2563EB] bg-white px-4 py-2.5 text-sm font-bold text-[#2563EB]">＋ 新規契約</button><button onClick={() => { const { collectionRoute, collectionNote, ...customerChanges } = customerFields; onSaveCustomer?.(customerChanges); saveDemo2NestedField("customerMeta", customer.code, { collectionRoute, collectionNote }).catch(() => setNotice("集金情報の保存に失敗しました")); recordHistory("顧客情報変更", "顧客・集金情報を更新"); setNotice("変更内容を保存しました"); }} className="rounded-xl bg-[#2563EB] px-5 py-2.5 text-sm font-bold text-white shadow-sm">変更を保存</button></div>
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

    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[#E5E7EB] bg-white p-4"><span className="mr-2 text-xs font-bold text-slate-400">契約操作</span><select aria-label="操作対象商品" value={selectedContractCode} onChange={(event)=>setSelectedContractCode(event.target.value)} className="rounded-lg border px-3 py-2 text-xs font-bold"><option value="">対象商品を選択</option>{contractRows.map((item)=><option key={item.code} value={item.code}>{item.product}（{item.code}）</option>)}</select>{["休配", "停止", "再開", "パターン変更", "商品入替", "解約"].map((action) => <button disabled={!selectedContractCode} key={action} onClick={() => applyContractAction(action)} className={`rounded-lg border px-4 py-2 text-xs font-bold disabled:opacity-40 ${action === "解約" ? "border-red-200 text-red-600" : "border-[#E5E7EB] text-slate-600"}`}>{action}</button>)}</div>

    <section className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E7EB] px-5 py-4"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-[#2563EB]"><Icon name="user" /></span><div><p className="text-xs font-bold text-[#2563EB]">顧客コード {customer.code}</p><div className="mt-1 flex flex-wrap items-center gap-3"><input aria-label="顧客名" value={customerFields.name} onChange={(event) => setCustomerFields((current) => ({ ...current, name: event.target.value }))} className="min-w-36 border-b border-transparent bg-transparent text-lg font-bold outline-none focus:border-[#2563EB]" /><input aria-label="フリガナ" value={customerFields.kana} onChange={(event) => setCustomerFields((current) => ({ ...current, kana: event.target.value }))} className="min-w-36 border-b border-transparent bg-transparent text-xs font-medium text-slate-400 outline-none focus:border-[#2563EB]" /></div></div></div><span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">契約中</span></div>
      <div className="grid divide-y divide-[#E5E7EB] md:grid-cols-2 md:divide-x md:divide-y-0 xl:grid-cols-4">
        <label className="px-5 py-4"><span className="text-xs font-bold text-slate-400">住所</span><input value={customerFields.address} onChange={(event) => setCustomerFields((current) => ({ ...current, address: event.target.value }))} className="mt-1.5 w-full bg-transparent text-sm font-semibold outline-none" /></label><div className="px-5 py-4"><p className="text-xs font-bold text-slate-400">電話番号</p><input aria-label="自宅電話" type="tel" value={customerFields.phoneHome} onChange={(event)=>setCustomerFields((current)=>({...current,phoneHome:event.target.value}))} placeholder="自宅" className="mt-1.5 w-full bg-transparent text-sm font-semibold outline-none"/><input aria-label="携帯電話" type="tel" value={customerFields.phoneMobile} onChange={(event)=>setCustomerFields((current)=>({...current,phoneMobile:event.target.value}))} placeholder="携帯" className="mt-1 w-full bg-transparent text-sm font-semibold outline-none"/></div><div className="px-5 py-4"><p className="text-xs font-bold text-slate-400">配送コース・配達順</p><div className="mt-1 flex gap-2"><select value={customerFields.route} onChange={(event) => setCustomerFields((current) => ({ ...current, route: event.target.value }))} className="bg-transparent text-sm font-semibold outline-none"><option>未設定</option>{deliveryCourses.map((course)=><option key={course}>{course}</option>)}</select><input aria-label="配達順" min="1" type="number" value={customerFields.order || ""} onChange={(event) => setCustomerFields((current) => ({ ...current, order: event.target.value === "" ? 0 : Number(event.target.value) }))} className="w-16 bg-transparent text-sm font-semibold outline-none" /><span className="text-sm font-semibold">番</span></div></div><div className="px-5 py-4"><p className="text-xs font-bold text-slate-400">契約担当</p><p className="mt-1.5 text-sm font-semibold">—</p></div>
      </div>
      <div className="grid border-t border-[#E5E7EB] bg-[#F8FAFC] md:grid-cols-3"><label className="px-5 py-3 text-sm"><span className="mr-3 text-xs font-bold text-slate-400">誕生日</span><input value={customerFields.birthday} onChange={(event) => setCustomerFields((current) => ({ ...current, birthday: event.target.value }))} className="min-w-0 bg-transparent font-semibold text-slate-600 outline-none" /></label><label className="px-5 py-3 text-sm"><span className="mr-3 text-xs font-bold text-slate-400">メモ</span><input value={customerFields.note} onChange={(event) => setCustomerFields((current) => ({ ...current, note: event.target.value }))} className="min-w-0 bg-transparent font-semibold text-slate-600 outline-none" /></label><label className="px-5 py-3 text-sm"><span className="mr-3 text-xs font-bold text-slate-400">支払方法</span><select value={customerFields.payment} onChange={(event) => setCustomerFields((current) => ({ ...current, payment: event.target.value }))} className="min-w-0 bg-transparent font-semibold text-slate-600 outline-none"><option>口座振替</option><option>クレジット</option><option>現金集金</option><option>LINE</option><option>未設定</option></select></label></div>
      <div className="grid border-t border-[#E5E7EB] bg-white md:grid-cols-2"><label className="px-5 py-3 text-sm"><span className="mr-3 text-xs font-bold text-slate-400">集金コース</span><select value={customerFields.collectionRoute} onChange={(event) => setCustomerFields((current) => ({ ...current, collectionRoute: event.target.value }))} className="min-w-36 bg-transparent font-semibold text-slate-600 outline-none"><option value="">未設定</option>{collectionCourses.map((course)=><option key={course}>{course}</option>)}</select></label><label className="px-5 py-3 text-sm"><span className="mr-3 text-xs font-bold text-slate-400">集金メモ</span><input value={customerFields.collectionNote} onChange={(event) => setCustomerFields((current) => ({ ...current, collectionNote: event.target.value }))} className="min-w-64 bg-transparent font-semibold text-slate-600 outline-none" /></label></div>
      <div className="flex flex-wrap items-center gap-3 border-t border-[#E5E7EB] px-5 py-3 text-xs"><span className="rounded-full bg-blue-50 px-3 py-1.5 font-bold text-[#2563EB]">契約{contractMonths}ヶ月</span>{initialCustomer?.follow && initialCustomer.follow !== "—" && <span className="rounded-full bg-amber-50 px-3 py-1.5 font-bold text-amber-700">要フォロー：{initialCustomer.follow}</span>}<span className="font-semibold text-slate-500">判定条件は要確認</span></div>
    </section>

    <section className={`overflow-hidden rounded-2xl border border-[#E5E7EB] shadow-sm ${isClosedMonth ? "bg-slate-100 text-slate-500" : "bg-white"}`}>
      <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4"><div className="flex items-center gap-2"><span className="text-[#2563EB]"><Icon name="box" /></span><h2 className="font-bold">契約商品</h2><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">{contractRows.length}件</span></div><button onClick={() => setNewContractOpen(true)} className="text-sm font-bold text-[#2563EB]">＋ 商品を追加</button></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-[#F8FAFC] text-xs font-bold text-slate-500"><tr><th className="px-5 py-3">商品コード</th><th className="px-5 py-3">商品名</th><th className="px-5 py-3 text-right">単価</th><th className="px-5 py-3">1回本数</th><th className="px-5 py-3">契約開始日</th><th className="px-5 py-3">配送曜日</th><th className="px-5 py-3">状態</th></tr></thead><tbody className="divide-y divide-[#E5E7EB]">{contractRows.map((item) => <tr key={item.code} className="hover:bg-blue-50/30"><td className="px-5 py-4 font-bold text-[#2563EB]">{item.code}</td><td className="px-5 py-4 font-bold">{item.product}</td><td className="px-5 py-4 text-right font-bold">¥{item.price.toLocaleString()}</td><td className="px-5 py-4"><input aria-label={`${item.product}の1回本数`} type="number" min="1" value={item.quantity} onChange={(event) => setContractRows((rows) => rows.map((row) => row.code === item.code ? { ...row, quantity: Math.max(1, Number(event.target.value) || 1) } : row))} className="w-16 rounded border px-2 py-1" /></td><td className="px-5 py-4 text-slate-500">{item.start}</td><td className="px-5 py-4"><div className="flex gap-1">{weekdays.map((day, index) => <span key={day} className={`flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold ${item.days[index] ? "bg-[#2563EB] text-white" : "bg-slate-100 text-slate-300"}`}>{day}</span>)}</div></td><td className="px-5 py-4"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">{item.status}</span></td></tr>)}</tbody></table></div>
    </section>

    <section className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
      <div className="flex flex-col justify-between gap-4 border-b border-[#E5E7EB] px-5 py-4 sm:flex-row sm:items-center"><div className="flex items-center gap-2"><span className="text-[#2563EB]"><Icon name="calendar" /></span><h2 className="font-bold">月間配送実績</h2></div><div className="flex items-center gap-2"><button onClick={() => { if (month === 1) { setMonth(12); setYear((v) => v - 1); } else setMonth((v) => v - 1); }} className="rounded-lg bg-slate-100 px-3 py-2 font-bold">‹</button><span className="min-w-28 text-center text-sm font-bold">{year}年{month}月</span><button onClick={() => { if (month === 12) { setMonth(1); setYear((v) => v + 1); } else setMonth((v) => v + 1); }} className="rounded-lg bg-slate-100 px-3 py-2 font-bold">›</button></div></div>
      <div className={`border-b px-5 py-3 text-xs font-semibold ${isClosedMonth ? "border-slate-300 bg-slate-200 text-slate-600" : "border-blue-100 bg-blue-50 text-blue-700"}`}>{isClosedMonth ? "締め済みの月です。閲覧のみで、配送実績は編集できません。" : "配送予定の数字を押すと、その商品だけ「0（お休み）」にできます。複数商品のうち1種類だけの休止にも対応します。"}</div>
      <div className="overflow-x-auto"><table className="min-w-[1260px] text-center text-xs"><thead><tr className="border-b border-[#E5E7EB] bg-[#F8FAFC]"><th className="sticky left-0 z-10 w-48 bg-[#F8FAFC] px-4 py-3 text-left">商品名</th>{days.map((day) => { const dow = new Date(year, month - 1, day).getDay(); return <th key={day} className={`w-8 py-2 ${dow === 0 ? "text-red-500" : dow === 6 ? "text-blue-500" : ""}`}><span>{day}</span><br/><span className="font-normal">{weekdays[dow]}</span></th>; })}<th className="px-4">本数</th><th className="px-4">小計（税込）</th></tr></thead><tbody>{contractRows.map((item) => { const plannedDays = item.status === "配送中" ? days.filter((day) => item.days[new Date(year, month - 1, day).getDay()]) : []; const deliveredCount = plannedDays.filter((day) => !pausedDeliveries.has(`${monthKey}-${item.code}-${day}`)).length * item.quantity; return <tr key={item.code} className="border-b border-[#E5E7EB] last:border-0"><th className={`sticky left-0 z-10 px-4 py-4 text-left text-xs font-bold ${isClosedMonth ? "bg-slate-100" : "bg-white"}`}>{item.product}</th>{days.map((day) => { const delivered = plannedDays.includes(day); const key = `${monthKey}-${item.code}-${day}`; const paused = pausedDeliveries.has(key); return <td key={day} className="border-l border-slate-100 py-3">{delivered ? <button disabled={isClosedMonth} title={isClosedMonth ? "締め済みのため編集できません" : paused ? "押すと配送を再開" : "押すとこの商品だけお休み"} onClick={() => { if (isClosedMonth) return; setPausedDeliveries((current) => { const next = new Set(current); if (next.has(key)) next.delete(key); else next.add(key); saveDemo2NestedField("pausedDeliveries", customer.code, [...next]).catch(() => setNotice("配送実績の保存に失敗しました")); return next; }); recordHistory(paused ? "配送再開" : "個別休配", `${month}/${day} ${item.product}`); setNotice(paused ? `${item.product}を${month}/${day}に再開しました` : `${item.product}を${month}/${day}だけお休みにしました`); }} className={`mx-auto flex h-7 min-w-7 items-center justify-center rounded-md px-1 font-bold transition ${isClosedMonth ? "cursor-not-allowed bg-slate-300 text-slate-500" : paused ? "bg-red-100 text-red-600 ring-1 ring-red-200" : "bg-blue-50 text-[#2563EB] hover:bg-blue-100"}`}>{paused ? 0 : item.quantity}</button> : ""}</td>; })}<td className="border-l border-[#E5E7EB] px-4 font-bold">{deliveredCount}</td><td className="border-l border-[#E5E7EB] px-4 font-bold">¥{(deliveredCount * item.price).toLocaleString()}</td></tr>})}<tr className="bg-slate-50 text-sm font-bold"><td className="sticky left-0 bg-slate-50 px-4 py-3 text-left" colSpan={days.length + 2}>月間配送実績 合計</td><td className="px-4 text-right">¥{monthlyTotal.toLocaleString()}</td></tr></tbody></table></div>
    </section>

    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{[["前回請求", `¥${previousInvoice.toLocaleString()}`, previousInvoice?"確定請求":"請求データなし"], ["入金", `¥${paidAmount.toLocaleString()}`, paidAmount?"入金確認済み":"入金データなし"], ["繰越", `¥${carryover.toLocaleString()}`, carryover?"未入金あり":"未収なし"], ["当月売上", `¥${monthlyTotal.toLocaleString()}`, `${month}月実績`], ["今回請求", `¥${(monthlyTotal+carryover).toLocaleString()}`, "月間実績と繰越から計算"]].map(([label, value, note], index) => <button onClick={() => onOpenBilling?.(customer.name)} key={label} className={`rounded-2xl border p-5 text-left shadow-sm ${index === 4 ? "border-blue-200 bg-[#2563EB] text-white" : "border-[#E5E7EB] bg-white"}`}><div className="flex items-center justify-between"><p className={`text-xs font-bold ${index === 4 ? "text-blue-100" : "text-slate-400"}`}>{label}</p><Icon name="yen" /></div><p className="mt-3 text-2xl font-bold">{value}</p><p className={`mt-1 text-xs ${index === 4 ? "text-blue-100" : "text-slate-400"}`}>{note}　→ 請求・入金</p></button>)}</section>
    <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-bold">スポット販売</h2><p className="mt-1 text-xs text-slate-500">販売日・単価・数量を登録すると、該当月の売上と請求に反映されます。</p></div><button onClick={() => {setSpotDraft({product:"",unitPrice:"",quantity:"1",soldAt:new Date().toISOString().slice(0,10)});setSpotSaleOpen(true)}} className="rounded-xl border px-4 py-2 text-sm font-bold">＋ 販売を追加</button></div>{spotSales.length ? <div className="mt-4 divide-y rounded-xl border">{spotSales.map((sale) => <div key={sale.at} className="flex flex-wrap items-center justify-between gap-3 p-3 text-sm"><div><b>{sale.product}</b><p className="mt-1 text-xs text-slate-500">{sale.soldAt}・{sale.quantity}点 × ¥{sale.unitPrice.toLocaleString()}</p></div><b>¥{(sale.unitPrice*sale.quantity).toLocaleString()}</b></div>)}</div> : <p className="mt-4 text-sm text-slate-500">販売データはありません。</p>}</section>
    {spotSaleOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onMouseDown={() => setSpotSaleOpen(false)}><form onMouseDown={(event)=>event.stopPropagation()} onSubmit={(event)=>{event.preventDefault();const sale:SpotSale={product:spotDraft.product.trim(),unitPrice:Math.max(0,Number(spotDraft.unitPrice)||0),quantity:Math.max(1,Number(spotDraft.quantity)||1),soldAt:spotDraft.soldAt,at:new Date().toISOString()};const next=[...spotSales,sale];setSpotSales(next);saveDemo2NestedField("spotSales",customer.code,next).catch(()=>setNotice("スポット販売の保存に失敗しました"));recordHistory("スポット販売",`${sale.soldAt} ${sale.product} ${sale.quantity}点 ¥${(sale.unitPrice*sale.quantity).toLocaleString()}`);setSpotSaleOpen(false);setNotice("スポット販売を保存しました")}} className="w-full max-w-md rounded-2xl bg-white p-6"><h2 className="text-lg font-bold">スポット販売を追加</h2><label className="mt-4 block text-sm font-bold">商品名<input required value={spotDraft.product} onChange={(event)=>setSpotDraft((current)=>({...current,product:event.target.value}))} className="mt-2 h-11 w-full rounded-xl border px-3 font-normal" /></label><label className="mt-4 block text-sm font-bold">販売日<input type="date" required value={spotDraft.soldAt} onChange={(event)=>setSpotDraft((current)=>({...current,soldAt:event.target.value}))} className="mt-2 h-11 w-full rounded-xl border px-3 font-normal" /></label><div className="mt-4 grid grid-cols-2 gap-3"><label className="block text-sm font-bold">税込単価<input type="number" min="0" required value={spotDraft.unitPrice} onChange={(event)=>setSpotDraft((current)=>({...current,unitPrice:event.target.value}))} className="mt-2 h-11 w-full rounded-xl border px-3 font-normal" /></label><label className="block text-sm font-bold">数量<input type="number" min="1" required value={spotDraft.quantity} onChange={(event)=>setSpotDraft((current)=>({...current,quantity:event.target.value}))} className="mt-2 h-11 w-full rounded-xl border px-3 font-normal" /></label></div><p className="mt-4 rounded-xl bg-slate-50 p-3 text-right text-sm">合計 <b className="ml-3 text-lg">¥{(Math.max(0,Number(spotDraft.unitPrice)||0)*Math.max(1,Number(spotDraft.quantity)||1)).toLocaleString()}</b></p><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={()=>setSpotSaleOpen(false)} className="rounded-xl border px-4 py-2 text-sm font-bold">キャンセル</button><button type="submit" className="rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-bold text-white">保存</button></div></form></div>}
    {newContractOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onMouseDown={() => setNewContractOpen(false)}><form onSubmit={(event) => { event.preventDefault(); if(!newDays.some(Boolean)){setNotice("配送曜日を1日以上選択してください");return} const data = new FormData(event.currentTarget); const selectedProduct = masterProducts.find((item)=>item.code===String(data.get("product"))); if(!selectedProduct){setNotice("商品マスタから商品を選択してください");return} const price=Number(selectedProduct.price.replace(/[^0-9]/g,"")); const quantity = Math.max(1, Number(data.get("quantity")) || 1); const contractCode=`${selectedProduct.code}-${crypto.randomUUID().slice(0,4).toUpperCase()}`; setContractRows((rows) => [...rows, { code: contractCode, product: selectedProduct.name, price, quantity, status: "配送中", start: String(data.get("start")).replaceAll("-", "/"), days: newDays }]); setSelectedContractCode(contractCode); recordHistory("新規契約", `${selectedProduct.name} ×${quantity}`); setNewContractOpen(false); setNewProduct(""); setNewDays([0, 0, 0, 0, 0, 0, 0]); setNotice(`${customer.name}さんの新規契約を登録しました`); }} onMouseDown={(event) => event.stopPropagation()} className="max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"><div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#E5E7EB] bg-white px-6 py-5"><div><p className="text-xs font-bold text-[#2563EB]">{customer.code}　{customer.name}</p><h2 className="mt-1 text-xl font-bold">新規契約を登録</h2></div><button type="button" aria-label="閉じる" onClick={() => setNewContractOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-lg text-slate-500">×</button></div><div className="grid gap-5 p-6 sm:grid-cols-2"><label className="text-sm font-bold sm:col-span-2">商品<select name="product" required value={newProduct} onChange={(event) => setNewProduct(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 font-normal outline-none focus:border-[#2563EB]"><option value="" disabled>{masterProducts.length?"商品を選択":"商品マスタが未登録です"}</option>{masterProducts.map((item)=><option key={item.code} value={item.code}>{item.name}（{item.price}）</option>)}</select></label><label className="text-sm font-bold">契約開始日<input name="start" type="date" required className="mt-2 h-12 w-full rounded-xl border border-[#E5E7EB] px-4 font-normal outline-none focus:border-[#2563EB]" /></label><label className="text-sm font-bold">1回本数<input name="quantity" type="number" min="1" required className="mt-2 h-12 w-full rounded-xl border border-[#E5E7EB] px-4 font-normal outline-none focus:border-[#2563EB]" /></label><label className="text-sm font-bold">担当者<select defaultValue="" className="mt-2 h-12 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 font-normal"><option value="">未設定</option><option>佐藤 美咲</option><option>田中 悠斗</option></select></label><fieldset className="sm:col-span-2"><legend className="text-sm font-bold">配送曜日（1日以上）</legend><div className="mt-2 flex flex-wrap gap-2">{weekdays.map((day, index) => <button type="button" key={day} onClick={() => setNewDays((current) => current.map((value, dayIndex) => dayIndex === index ? Number(!value) : value))} className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold ${newDays[index] ? "bg-[#2563EB] text-white" : "bg-slate-100 text-slate-400"}`}>{day}</button>)}</div></fieldset><label className="text-sm font-bold sm:col-span-2">備考<textarea placeholder="配送時の注意事項など" className="mt-2 h-24 w-full rounded-xl border border-[#E5E7EB] p-4 font-normal outline-none focus:border-[#2563EB]" /></label></div><div className="flex justify-end gap-3 border-t border-[#E5E7EB] bg-[#F8FAFC] px-6 py-4"><button type="button" onClick={() => setNewContractOpen(false)} className="rounded-xl border border-[#E5E7EB] bg-white px-5 py-3 text-sm font-bold text-slate-500">キャンセル</button><button type="submit" disabled={!masterProducts.length} className="rounded-xl bg-[#2563EB] px-6 py-3 text-sm font-bold text-white disabled:opacity-40">契約を登録</button></div></form></div>}
    {historyOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onClick={() => setHistoryOpen(false)}><div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="flex justify-between"><div><p className="text-xs font-bold text-[#2563EB]">{customer.code} {customer.name}</p><h2 className="mt-1 text-xl font-bold">契約変更履歴</h2></div><button onClick={() => setHistoryOpen(false)}>✕</button></div>{history.length ? <div className="mt-5 divide-y rounded-xl border">{history.map((entry) => <div key={`${entry.at}-${entry.action}`} className="grid gap-2 p-4 sm:grid-cols-[160px_130px_1fr]"><span className="text-xs text-slate-400">{new Date(entry.at).toLocaleString("ja-JP")}</span><span className="text-sm font-bold">{entry.action}</span><span className="text-sm text-slate-500">{entry.detail}</span></div>)}</div> : <p className="mt-5 rounded-xl border p-6 text-center text-sm text-slate-500">変更履歴はありません。</p>}</div></div>}
    {notice && <button onClick={() => setNotice("")} className="fixed bottom-6 right-6 z-50 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-xl">✓ {notice}</button>}
  </div>;
}
