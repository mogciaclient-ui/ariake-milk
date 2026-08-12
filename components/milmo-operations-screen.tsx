"use client";

import { useState } from "react";
import { PageHeading, StatusBadge } from "@/components/page-heading";
import { useDemoOffice } from "@/lib/demo-office";
import type { DemoScreen } from "@/lib/product-navigation";
import { getLegacyScreenConfig } from "@/lib/milmo-legacy-screens";
import { MilmoLegacySuiteScreen } from "@/components/milmo-legacy-suite-screen";

type Row = { id: string; primary: string; secondary: string; meta: string; amount: number; status: string };

const financeRows: Row[] = [
  { id: "C-10482", primary: "山田 花子", secondary: "2026年7月分", meta: "口座振替", amount: 8420, status: "入金済み" },
  { id: "C-10479", primary: "鈴木 一郎", secondary: "2026年7月分", meta: "訪問集金", amount: 7680, status: "入金待ち" },
  { id: "C-10461", primary: "高橋 悦子", secondary: "2026年6月分", meta: "銀行振込", amount: 5240, status: "未入金" },
  { id: "C-10435", primary: "伊藤 健二", secondary: "2026年7月分", meta: "口座振替", amount: 9100, status: "確認中" },
];

const masterData: Record<string, Row[]> = {
  "master-customers": [
    { id: "C-10482", primary: "山田 花子", secondary: "有明 Aコース", meta: "佐藤 美咲", amount: 0, status: "利用中" },
    { id: "C-10479", primary: "鈴木 一郎", secondary: "有明 Bコース", meta: "田中 悠斗", amount: 0, status: "利用中" },
    { id: "C-10461", primary: "高橋 悦子", secondary: "豊洲コース", meta: "佐藤 美咲", amount: 0, status: "一時休止" },
  ],
  "master-products": [
    { id: "M-001", primary: "有明牛乳 900ml", secondary: "牛乳", meta: "宅配契約商品", amount: 280, status: "販売中" },
    { id: "Y-012", primary: "のむヨーグルト", secondary: "乳飲料", meta: "宅配契約商品", amount: 160, status: "販売中" },
    { id: "C-103", primary: "宅配専用コーヒー", secondary: "乳飲料", meta: "宅配契約商品", amount: 190, status: "販売中" },
  ],
  "master-routes": [
    { id: "RT-A01", primary: "有明 Aコース", secondary: "月・木", meta: "中村 大輔 / 42件", amount: 0, status: "運用中" },
    { id: "RT-A02", primary: "有明 Bコース", secondary: "火・金", meta: "松本 翔太 / 38件", amount: 0, status: "運用中" },
    { id: "RT-T01", primary: "豊洲コース", secondary: "水・土", meta: "小林 直樹 / 31件", amount: 0, status: "運用中" },
  ],
  "master-staff": [
    { id: "ST-014", primary: "佐藤 美咲", secondary: "営業", meta: "本社営業所", amount: 0, status: "在籍" },
    { id: "ST-021", primary: "中村 大輔", secondary: "配達", meta: "有明 Aコース", amount: 0, status: "在籍" },
    { id: "ST-026", primary: "松本 翔太", secondary: "配達", meta: "有明 Bコース", amount: 0, status: "在籍" },
  ],
  "master-offices": [
    { id: "OF-001", primary: "本社営業所", secondary: "東京都江東区有明", meta: "顧客 1,742名", amount: 0, status: "稼働中" },
    { id: "OF-002", primary: "吉野ヶ里営業所", secondary: "佐賀県神埼郡吉野ヶ里町", meta: "顧客 1,104名", amount: 0, status: "稼働中" },
  ],
};

const reportCopy: Record<string, [string, string]> = {
  "schedule-ledger": ["予定台帳", "配送予定をコース順にまとめ、現場確認用の台帳を作成します。"],
  picking: ["ピッキング集計", "配送前に必要な商品数を商品・コース別に集計します。"],
  "delivery-list": ["配送リスト", "顧客住所・商品・数量・配送メモを配送順に出力します。"],
  "route-table": ["順路表", "配達員ごとの訪問順と配送先情報を出力します。"],
  collections: ["集金予定", "担当者別の訪問集金予定と金額を出力します。"],
};

const analysisCopy: Record<string, { metrics: Array<[string, string, string]>; title: string }> = {
  "quantity-summary": { title: "商品別本数", metrics: [["配送予定", "368本", "+18本"], ["有明牛乳", "184本", "50.0%"], ["ヨーグルト", "112本", "30.4%"], ["その他", "72本", "19.6%"]] },
  "product-summary": { title: "商品別売上", metrics: [["商品売上", "¥5.08M", "+8.1%"], ["販売本数", "18,420本", "+4.2%"], ["平均単価", "¥276", "+1.4%"], ["稼働商品", "42商品", "3商品増"]] },
  "acquisition-cancellation": { title: "新規・解約推移", metrics: [["新規契約", "38件", "+8件"], ["解約", "12件", "-3件"], ["純増", "+26件", "良好"], ["解約率", "0.42%", "-0.11pt"]] },
  "customer-analysis": { title: "顧客構成・継続状況", metrics: [["契約顧客", "2,846名", "+32名"], ["継続率", "96.8%", "+0.6pt"], ["平均契約", "4.2年", "+0.2年"], ["顧客単価", "¥4,180", "+3.1%"]] },
  "hq-summary": { title: "営業所別業績", metrics: [["全社売上", "¥12.8M", "+7.4%"], ["配送", "8,420件", "+3.8%"], ["新規契約", "82件", "+14件"], ["稼働営業所", "2拠点", "正常"]] },
};

export function MilmoOperationsScreen({ screen }: { screen: DemoScreen }) {
  const legacyConfig = getLegacyScreenConfig(screen.slug);
  if (screen.slug === "field-materials") return <FieldMaterialsScreen screen={screen} />;
  if (legacyConfig) return <MilmoLegacySuiteScreen screen={screen} config={legacyConfig} />;
  if (reportCopy[screen.slug]) return <ReportScreen screen={screen} />;
  if (analysisCopy[screen.slug]) return <AnalysisScreen screen={screen} />;
  if (masterData[screen.slug]) return <MasterScreen screen={screen} />;
  if (["payments", "invoices", "unpaid", "sales-details"].includes(screen.slug)) return <FinanceScreen screen={screen} />;
  if (screen.slug === "route-staff") return <RouteChangeScreen screen={screen} />;
  if (["route-staff", "customer-transfer", "hq-products"].includes(screen.slug)) return <AssignmentScreen screen={screen} />;
  if (["bank-transfer", "branch-status"].includes(screen.slug)) return <ProcessScreen screen={screen} />;
  return <SettingsScreen screen={screen} />;
}

const fieldMaterialTabs = [
  ["予定台帳", "配送予定をコース順にまとめ、現場確認用の台帳を作成します。"],
  ["ピッキングリスト", "配送前の商品準備数を商品・コース別に集計します。"],
  ["クレートピッキング", "クレート単位の商品準備数を出力します。"],
  ["配送リスト", "住所、商品、配送メモを含む配送リストを作成します。"],
  ["クレート配送", "配送コースごとのクレート積載内容を出力します。"],
  ["変更リスト", "契約・商品・配送曜日の変更内容を出力します。"],
  ["順路表", "担当コースの配送順と顧客情報を一覧表示します。"],
  ["本数集計表", "指定日の商品本数を営業所・コース別に集計します。"],
  ["配達納品書", "配送先ごとの商品・数量・金額を納品書形式で出力します。"],
  ["休配リスト", "休配期間中の顧客と振替状況を出力します。"],
] as const;

function FieldMaterialsScreen({ screen }: { screen: DemoScreen }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [preview, setPreview] = useState(true);
  const [targetDate, setTargetDate] = useState("2026-08-12");
  const [office, setOffice] = useState("全営業所");
  const [course, setCourse] = useState("すべてのコース");
  const [sortOrder, setSortOrder] = useState("配送順");
  const active = fieldMaterialTabs[activeIndex];
  const previews = [
    { columns: ["順番", "顧客", "商品", "数量", "配送メモ"], rows: [["1", "山田 花子", "有明牛乳 900ml", "2本", "玄関横ボックス"], ["2", "鈴木 一郎", "のむヨーグルト", "4本", "呼び鈴不要"], ["3", "伊藤 健二", "宅配専用コーヒー", "2本", "手渡し"]], summary: "3件・8本" },
    { columns: ["商品コード", "商品名", "有明 A", "有明 B", "豊洲", "合計"], rows: [["M-001", "有明牛乳 900ml", "48", "42", "36", "126本"], ["Y-012", "のむヨーグルト", "32", "28", "24", "84本"], ["C-103", "宅配専用コーヒー", "18", "22", "16", "56本"]], summary: "合計 266本" },
    { columns: ["クレート", "商品名", "入数", "必要数", "端数", "積込先"], rows: [["CR-01", "有明牛乳 900ml", "12本", "10箱", "6本", "有明 A・B"], ["CR-02", "のむヨーグルト", "20本", "4箱", "4本", "全コース"], ["CR-03", "宅配専用コーヒー", "12本", "4箱", "8本", "豊洲" ]], summary: "18クレート・端数18本" },
    { columns: ["順番", "顧客", "住所", "商品・数量", "連絡事項"], rows: [["1", "山田 花子", "江東区有明1-2-3", "有明牛乳 ×2", "玄関横"], ["2", "鈴木 一郎", "江東区豊洲2-4-1", "ヨーグルト ×4", "呼び鈴不要"], ["3", "伊藤 健二", "江東区東雲3-1-8", "コーヒー ×2", "手渡し"]], summary: "配送先 3件" },
    { columns: ["順番", "コース", "クレート番号", "商品", "数量", "確認"], rows: [["1", "有明 A", "CR-01-01", "有明牛乳", "12本", "□"], ["2", "有明 A", "CR-01-02", "有明牛乳", "12本", "□"], ["3", "有明 B", "CR-02-01", "ヨーグルト", "20本", "□"]], summary: "積載 18クレート" },
    { columns: ["受付日", "顧客", "変更区分", "変更前", "変更後", "適用日"], rows: [["8/10", "山田 花子", "本数変更", "牛乳 1本", "牛乳 2本", "8/12"], ["8/11", "鈴木 一郎", "曜日変更", "火・金", "月・木", "8/15"], ["8/11", "高橋 悦子", "商品追加", "—", "ヨーグルト 2本", "8/12"]], summary: "変更 3件" },
    { columns: ["順番", "顧客", "住所", "到着目安", "前回結果", "注意"], rows: [["1", "山田 花子", "有明1-2-3", "08:40", "完了", "一方通行"], ["2", "鈴木 一郎", "豊洲2-4-1", "08:55", "完了", "駐車場奥"], ["3", "伊藤 健二", "東雲3-1-8", "09:15", "不在", "宅配BOX"]], summary: "走行目安 48分" },
    { columns: ["商品コード", "商品名", "契約", "臨時", "増減", "配送合計"], rows: [["M-001", "有明牛乳 900ml", "122", "4", "+2", "128本"], ["Y-012", "のむヨーグルト", "82", "2", "0", "84本"], ["C-103", "宅配専用コーヒー", "54", "2", "0", "56本"]], summary: "全商品合計 268本" },
    { columns: ["伝票番号", "お届け先", "商品", "数量", "単価", "金額"], rows: [["D-0812-01", "山田 花子", "有明牛乳 900ml", "2", "¥280", "¥560"], ["D-0812-02", "鈴木 一郎", "のむヨーグルト", "4", "¥160", "¥640"], ["D-0812-03", "伊藤 健二", "宅配専用コーヒー", "2", "¥190", "¥380"]], summary: "納品額合計 ¥1,580" },
    { columns: ["顧客", "コース", "休配期間", "対象商品", "振替", "状態"], rows: [["高橋 悦子", "豊洲", "8/12〜8/19", "全商品", "8/20", "受付済"], ["佐々木 正人", "有明 A", "8/12のみ", "有明牛乳", "なし", "確認済"], ["木村 洋子", "有明 B", "8/15〜8/18", "全商品", "8/19", "受付済"]], summary: "休配 3件" },
  ];
  const previewData = previews[activeIndex];

  return <ScreenFrame screen={screen} action={<button onClick={() => window.print()} className="rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-bold text-white">印刷・PDF</button>}>
    <div className="mb-6 overflow-x-auto border-b border-[#DCE3ED]">
      <div role="tablist" aria-label="現場資料" className="flex min-w-max gap-7 px-1">
        {fieldMaterialTabs.map(([label], index) => <button key={label} type="button" role="tab" aria-selected={activeIndex === index} onClick={() => { setActiveIndex(index); setPreview(true); }} className={`relative whitespace-nowrap pb-4 text-sm font-bold transition ${activeIndex === index ? "text-[#2563EB]" : "text-slate-500 hover:text-slate-900"}`}>{label}{activeIndex === index && <span className="absolute inset-x-0 bottom-0 h-[3px] rounded-t-full bg-[#2563EB]" />}</button>)}
      </div>
    </div>
    <div className="mb-5"><h2 className="text-xl font-bold">{active[0]}</h2><p className="mt-1 text-sm text-slate-500">{active[1]}</p></div>
    <section className="rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
      <div className="border-b border-[#E5E7EB] px-5 py-4"><h3 className="font-bold">帳票の抽出条件</h3><p className="mt-1 text-xs text-slate-500">表示する日付・営業所・コースを変更できます。</p></div>
      <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-4"><Field label="対象日" value={targetDate} type="date" onChange={setTargetDate} /><SelectField label="営業所" options={["全営業所", "本社営業所", "吉野ヶ里営業所"]} value={office} onChange={setOffice} /><SelectField label="コース" options={["すべてのコース", "有明 Aコース", "有明 Bコース", "豊洲コース"]} value={course} onChange={setCourse} /><SelectField label="出力順" options={["配送順", "顧客番号順", "商品順"]} value={sortOrder} onChange={setSortOrder} /></div>
      <div className="grid gap-4 border-t border-[#E5E7EB] p-5 lg:grid-cols-[1fr_auto] lg:items-center"><div className="flex flex-wrap gap-x-5 gap-y-3 text-sm text-slate-600"><label className="flex items-center gap-2"><input type="checkbox" defaultChecked className="h-4 w-4 accent-[#2563EB]" />配送メモ</label><label className="flex items-center gap-2"><input type="checkbox" defaultChecked className="h-4 w-4 accent-[#2563EB]" />電話番号</label><label className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4 accent-[#2563EB]" />休配を含む</label></div><button onClick={() => setPreview(true)} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#2563EB] bg-blue-50 px-6 text-sm font-bold text-[#2563EB] transition hover:bg-[#2563EB] hover:text-white lg:w-auto"><span aria-hidden="true">↻</span><span>プレビューを更新</span></button></div>
    </section>
    {preview && <section className="mt-5 overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm"><div className="flex items-start justify-between gap-4 border-b border-[#E5E7EB] p-5 sm:items-center"><div><h2 className="text-lg font-bold sm:text-xl">{active[0]}</h2><p className="mt-1 text-xs text-slate-400">{targetDate.replaceAll("-", "/")}・{office}・{course}・{sortOrder}</p></div><StatusBadge tone="blue">帳票プレビュー</StatusBadge></div><div className="overflow-x-auto p-4 sm:p-6"><table className="w-full min-w-[720px] text-left text-sm"><thead className="border-y bg-[#F8FAFC] text-xs text-slate-500"><tr>{previewData.columns.map((heading) => <th key={heading} className="p-3">{heading}</th>)}</tr></thead><tbody className="divide-y">{previewData.rows.map((row, rowIndex) => <tr key={`${activeIndex}-${rowIndex}`} className="hover:bg-slate-50">{row.map((cell, cellIndex) => <td key={`${cell}-${cellIndex}`} className="p-3">{cell}</td>)}</tr>)}</tbody></table><div className="border-t-2 px-3 py-4 text-right text-sm font-bold">{previewData.summary}</div></div></section>}
  </ScreenFrame>;
}

function ScreenFrame({ screen, children, action }: { screen: DemoScreen; children: React.ReactNode; action?: React.ReactNode }) {
  const { office } = useDemoOffice();
  return <div className="mx-auto max-w-7xl"><div className="mb-3 text-xs font-bold text-slate-400">milmo. / {screen.label}</div><PageHeading title={screen.label} description={`${office.name}・${screen.description}`} action={action} />{children}</div>;
}

function FinanceScreen({ screen }: { screen: DemoScreen }) {
  const [rows, setRows] = useState(financeRows);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("すべて");
  const [selected, setSelected] = useState<Row | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const shown = rows.filter((row) => (status === "すべて" || row.status === status) && `${row.id}${row.primary}${row.secondary}`.includes(query));
  const isSales = screen.slug === "sales-details";
  return <ScreenFrame screen={screen} action={<button onClick={() => setFormOpen(true)} className="rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-bold text-white">＋ {isSales ? "売上" : screen.slug === "payments" ? "入金" : "請求"}を登録</button>}>
    <div className="mb-4 grid gap-3 sm:grid-cols-3">{[["対象件数", `${shown.length}件`], [isSales ? "売上合計" : "請求合計", `¥${shown.reduce((sum, row) => sum + row.amount, 0).toLocaleString()}`], ["未対応", `${shown.filter((row) => ["未入金", "入金待ち"].includes(row.status)).length}件`]].map(([label, value]) => <div key={label} className="rounded-2xl border border-[#E5E7EB] bg-white p-4"><p className="text-xs font-bold text-slate-400">{label}</p><p className="mt-2 text-xl font-bold">{value}</p></div>)}</div>
    <section className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm"><div className="flex flex-col gap-3 border-b border-[#E5E7EB] p-4 sm:flex-row"><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="顧客名・顧客番号・対象月で検索" className="h-11 flex-1 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 text-sm outline-none focus:border-[#2563EB]" /><select value={status} onChange={(e) => setStatus(e.target.value)} className="h-11 rounded-xl border border-[#E5E7EB] px-4 text-sm font-bold"><option>すべて</option><option>入金済み</option><option>入金待ち</option><option>未入金</option><option>確認中</option></select><button className="rounded-xl border border-[#E5E7EB] px-4 text-sm font-bold">CSV出力</button></div><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead className="bg-[#F8FAFC] text-xs text-slate-500"><tr><th className="px-5 py-4">顧客</th><th className="px-5 py-4">対象</th><th className="px-5 py-4">区分</th><th className="px-5 py-4 text-right">金額</th><th className="px-5 py-4">状態</th><th /></tr></thead><tbody className="divide-y divide-[#E5E7EB]">{shown.map((row) => <tr key={row.id} className="hover:bg-blue-50/30"><td className="px-5 py-4"><p className="text-sm font-bold">{row.primary}</p><p className="mt-1 text-xs text-slate-400">{row.id}</p></td><td className="px-5 py-4 text-sm">{row.secondary}</td><td className="px-5 py-4 text-sm text-slate-500">{row.meta}</td><td className="px-5 py-4 text-right text-sm font-bold">¥{row.amount.toLocaleString()}</td><td className="px-5 py-4"><StatusBadge tone={row.status === "入金済み" ? "green" : row.status === "未入金" ? "red" : "amber"}>{row.status}</StatusBadge></td><td className="px-5 py-4"><button onClick={() => setSelected(row)} className="text-xs font-bold text-[#2563EB]">詳細・編集 →</button></td></tr>)}</tbody></table></div></section>
    {(selected || formOpen) && <EditModal title={selected ? `${selected.primary}の${screen.label}` : `${screen.label}を登録`} onClose={() => { setSelected(null); setFormOpen(false); }} onSave={() => { if (selected) setRows((current) => current.map((row) => row.id === selected.id ? { ...row, status: "入金済み" } : row)); setSelected(null); setFormOpen(false); }}><div className="grid gap-4 sm:grid-cols-2"><Field label="顧客" value={selected?.primary ?? "山田 花子"} /><Field label="対象月" value={selected?.secondary ?? "2026年8月分"} /><Field label="金額" value={String(selected?.amount ?? 8660)} type="number" /><SelectField label="状態" options={["未請求", "請求済み", "入金待ち", "入金済み", "未入金", "対応中"]} value={selected?.status} /><label className="text-sm font-bold sm:col-span-2">備考<textarea className="mt-2 h-24 w-full rounded-xl border border-[#E5E7EB] p-3 font-normal" placeholder="対応内容や入金方法を入力" /></label></div></EditModal>}
  </ScreenFrame>;
}

function MasterScreen({ screen }: { screen: DemoScreen }) {
  const [rows, setRows] = useState(masterData[screen.slug]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Row | null>(null);
  const shown = rows.filter((row) => `${row.id}${row.primary}${row.secondary}${row.meta}`.includes(query));
  return <ScreenFrame screen={screen} action={<button onClick={() => setSelected({ id: "NEW", primary: "", secondary: "", meta: "", amount: 0, status: "利用中" })} className="rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-bold text-white">＋ 新規登録</button>}><section className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm"><div className="flex gap-3 border-b border-[#E5E7EB] p-4"><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`${screen.label}を検索`} className="h-11 flex-1 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 text-sm" /><button className="rounded-xl border border-[#E5E7EB] px-4 text-sm font-bold">CSV出力</button></div><div className="divide-y divide-[#E5E7EB]">{shown.map((row) => <button key={row.id} onClick={() => setSelected(row)} className="grid w-full gap-3 p-5 text-left hover:bg-blue-50/30 sm:grid-cols-[120px_1.3fr_1fr_1fr_auto] sm:items-center"><span className="text-xs font-bold text-[#2563EB]">{row.id}</span><span className="font-bold">{row.primary}</span><span className="text-sm text-slate-500">{row.secondary}</span><span className="text-sm text-slate-500">{row.meta}</span><StatusBadge tone={row.status.includes("休止") ? "amber" : "green"}>{row.status}</StatusBadge></button>)}</div></section>{selected && <EditModal title={selected.id === "NEW" ? `${screen.label}を登録` : `${selected.primary}を編集`} onClose={() => setSelected(null)} onSave={() => { if (selected.id === "NEW") setRows((current) => [...current, { ...selected, id: `NEW-${current.length + 1}`, primary: selected.primary || "新規データ" }]); setSelected(null); }}><div className="grid gap-4 sm:grid-cols-2"><Field label="名称" value={selected.primary} onChange={(value) => setSelected({ ...selected, primary: value })} /><Field label="コード" value={selected.id} /><Field label="分類・所在地" value={selected.secondary} /><Field label="担当・備考" value={selected.meta} /><SelectField label="利用状態" options={["利用中", "一時休止", "停止"]} value={selected.status} /></div></EditModal>}</ScreenFrame>;
}

function ReportScreen({ screen }: { screen: DemoScreen }) {
  const [preview, setPreview] = useState(true);
  const [course, setCourse] = useState("すべてのコース");
  const items = [["1", "山田 花子", "有明牛乳 900ml", "2本", "玄関横ボックス"], ["2", "鈴木 一郎", "のむヨーグルト", "4本", "呼び鈴不要"], ["3", "伊藤 健二", "有明牛乳 900ml", "2本", "手渡し"]];
  return <ScreenFrame screen={screen} action={<button onClick={() => window.print()} className="rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-bold text-white">印刷・PDF</button>}><section className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm"><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><Field label="対象日" value="2026-08-12" type="date" /><SelectField label="営業所" options={["全営業所", "本社営業所", "吉野ヶ里営業所"]} /><SelectField label="コース" options={["すべてのコース", "有明 Aコース", "有明 Bコース", "豊洲コース"]} value={course} onChange={setCourse} /><SelectField label="出力順" options={["配送順", "顧客番号順", "商品順"]} /></div><div className="mt-5 grid gap-4 border-t border-[#E5E7EB] pt-5 lg:grid-cols-[1fr_auto] lg:items-center"><div className="flex flex-wrap gap-x-5 gap-y-3 text-sm text-slate-600"><label className="flex items-center gap-2"><input type="checkbox" defaultChecked className="h-4 w-4 accent-[#2563EB]" />配送メモ</label><label className="flex items-center gap-2"><input type="checkbox" defaultChecked className="h-4 w-4 accent-[#2563EB]" />電話番号</label><label className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4 accent-[#2563EB]" />休配を含む</label></div><button onClick={() => setPreview(true)} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#2563EB] bg-blue-50 px-6 text-sm font-bold text-[#2563EB] transition hover:bg-[#2563EB] hover:text-white lg:w-auto"><span aria-hidden="true">▤</span><span>{preview ? "プレビューを更新" : "集計・プレビュー"}</span></button></div></section>{preview && <section className="mt-5 overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm"><div className="flex items-start justify-between gap-4 border-b border-[#E5E7EB] p-5 sm:items-center"><div><h2 className="text-lg font-bold sm:text-xl">{reportCopy[screen.slug][0]}</h2><p className="mt-1 text-xs text-slate-400">2026年8月12日・{course}</p></div><StatusBadge tone="blue">プレビュー</StatusBadge></div><div className="overflow-x-auto p-4 sm:p-6"><table className="w-full min-w-[640px] text-left text-sm"><thead className="border-y bg-[#F8FAFC] text-xs text-slate-500"><tr>{["順番", "顧客", "商品", "数量", "配送メモ"].map((h) => <th key={h} className="p-3">{h}</th>)}</tr></thead><tbody className="divide-y">{items.map((row) => <tr key={row[0]}>{row.map((cell) => <td key={cell} className="p-3">{cell}</td>)}</tr>)}</tbody><tfoot className="border-t-2 font-bold"><tr><td colSpan={3} className="p-3 text-right">合計</td><td className="p-3">8本</td><td /></tr></tfoot></table></div></section>}</ScreenFrame>;
}

function AnalysisScreen({ screen }: { screen: DemoScreen }) {
  const config = analysisCopy[screen.slug];
  const values = [62, 74, 68, 83, 78, 92];
  return <ScreenFrame screen={screen} action={<button className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-bold">CSV出力</button>}><div className="mb-5 flex flex-wrap gap-3"><select className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-bold"><option>2026年8月</option><option>2026年7月</option></select><select className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-bold"><option>全営業所</option><option>本社営業所</option><option>吉野ヶ里営業所</option></select></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{config.metrics.map(([label, value, note]) => <div key={label} className="rounded-2xl border border-[#E5E7EB] bg-white p-5"><p className="text-sm font-semibold text-slate-500">{label}</p><p className="mt-3 text-2xl font-bold">{value}</p><p className="mt-2 text-xs font-bold text-emerald-600">{note}</p></div>)}</div><section className="mt-5 rounded-2xl border border-[#E5E7EB] bg-white p-6"><h2 className="font-bold">{config.title}</h2><div className="mt-8 flex h-64 items-end gap-5 border-b px-4">{values.map((value, index) => <div key={index} className="flex h-full flex-1 flex-col justify-end"><div className="mb-2 text-center text-xs font-bold text-[#2563EB]">{value}</div><div className="rounded-t-lg bg-[#2563EB]" style={{ height: `${value}%` }} /><p className="mt-3 text-center text-xs text-slate-400">{index + 3}月</p></div>)}</div></section></ScreenFrame>;
}

function AssignmentScreen({ screen }: { screen: DemoScreen }) {
  const [saved, setSaved] = useState(false);
  const rows = [["C-10482", "山田 花子", "有明 Aコース", "佐藤 美咲"], ["C-10479", "鈴木 一郎", "有明 Bコース", "田中 悠斗"], ["C-10461", "高橋 悦子", "豊洲コース", "佐藤 美咲"]];
  return <ScreenFrame screen={screen} action={<button onClick={() => setSaved(true)} className="rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-bold text-white">変更を保存</button>}><section className="rounded-2xl border border-[#E5E7EB] bg-white shadow-sm"><div className="grid gap-3 border-b p-4 md:grid-cols-[1fr_220px_220px]"><input placeholder="顧客名・顧客番号で検索" className="h-11 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 text-sm" /><select className="rounded-xl border border-[#E5E7EB] px-3 text-sm"><option>すべてのコース</option><option>有明 Aコース</option></select><select className="rounded-xl border border-[#E5E7EB] px-3 text-sm"><option>すべての担当者</option><option>佐藤 美咲</option></select></div><div className="divide-y">{rows.map((row) => <div key={row[0]} className="grid gap-3 p-5 md:grid-cols-[110px_1fr_220px_220px]"><span className="text-xs font-bold text-[#2563EB]">{row[0]}</span><span className="font-bold">{row[1]}</span><select defaultValue={row[2]} className="rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm"><option>有明 Aコース</option><option>有明 Bコース</option><option>豊洲コース</option></select><select defaultValue={row[3]} className="rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm"><option>佐藤 美咲</option><option>田中 悠斗</option><option>中村 大輔</option></select></div>)}</div></section>{saved && <div className="fixed bottom-6 right-6 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white">✓ 変更を保存しました（デモ）</div>}</ScreenFrame>;
}

function RouteChangeScreen({ screen }: { screen: DemoScreen }) {
  const seed = ["山田 花子", "佐々木 正人", "木村 洋子", "鈴木 一郎", "伊藤 健二"];
  const [left, setLeft] = useState(seed);
  const [right, setRight] = useState(["高橋 悦子", "渡辺 直子"]);
  const [leftSelected, setLeftSelected] = useState<string[]>([]);
  const [rightSelected, setRightSelected] = useState<string[]>([]);
  const move = (direction: "right" | "left") => { if (direction === "right") { setRight((items) => [...items, ...leftSelected]); setLeft((items) => items.filter((item) => !leftSelected.includes(item))); setLeftSelected([]); } else { setLeft((items) => [...items, ...rightSelected]); setRight((items) => items.filter((item) => !rightSelected.includes(item))); setRightSelected([]); } };
  const panel = (title: string, items: string[], selected: string[], setSelected: (value: string[]) => void) => <section className="overflow-hidden rounded-2xl border bg-white"><div className="border-b bg-[#F8FAFC] p-4"><p className="font-bold">{title}</p><p className="mt-1 text-xs text-slate-400">{items.length}件・選択 {selected.length}件</p></div><div className="p-3"><div className="mb-3 flex gap-2"><button onClick={() => setSelected(items)} className="rounded-lg border px-3 py-1.5 text-xs font-bold">全選択</button><button onClick={() => setSelected([])} className="rounded-lg border px-3 py-1.5 text-xs font-bold">解除</button><button onClick={() => setSelected([...items].reverse())} className="rounded-lg border px-3 py-1.5 text-xs font-bold">逆順</button></div><div className="min-h-80 space-y-2">{items.map((item, index) => <button key={item} onClick={() => setSelected(selected.includes(item) ? selected.filter((name) => name !== item) : [...selected, item])} className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left ${selected.includes(item) ? "border-[#2563EB] bg-blue-50" : "border-[#E5E7EB]"}`}><span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-bold">{index + 1}</span><span className="flex-1 text-sm font-bold">{item}</span><span className="text-xs text-slate-400">有明牛乳 × 2</span></button>)}</div></div></section>;
  return <ScreenFrame screen={screen} action={<button className="rounded-xl bg-[#2563EB] px-5 py-2.5 text-sm font-bold text-white">変更を確定</button>}><div className="mb-5 grid gap-3 rounded-2xl border bg-white p-4 md:grid-cols-3"><SelectField label="コース区分" options={["配送コース", "集金コース"]} /><SelectField label="変更元" options={["有明 Aコース", "有明 Bコース", "豊洲コース"]} /><SelectField label="変更先" options={["有明 Bコース", "有明 Aコース", "豊洲コース"]} /></div><div className="grid gap-3 lg:grid-cols-[1fr_90px_1fr]">{panel("変更元：有明 Aコース", left, leftSelected, setLeftSelected)}<div className="flex items-center justify-center gap-2 lg:flex-col"><button disabled={!leftSelected.length} onClick={() => move("right")} className="rounded-xl bg-[#2563EB] px-5 py-3 font-bold text-white disabled:opacity-30">→</button><button disabled={!rightSelected.length} onClick={() => move("left")} className="rounded-xl border border-[#2563EB] px-5 py-3 font-bold text-[#2563EB] disabled:opacity-30">←</button></div>{panel("変更先：有明 Bコース", right, rightSelected, setRightSelected)}</div></ScreenFrame>;
}

function ProcessScreen({ screen }: { screen: DemoScreen }) {
  const [step, setStep] = useState(1);
  const steps = screen.slug === "bank-transfer" ? ["対象請求を確認", "振替データ作成", "結果データ取込", "入金へ反映"] : ["営業所データ確認", "締め処理確認", "エラー確認", "処理完了"];
  return <ScreenFrame screen={screen}><div className="grid gap-5 lg:grid-cols-[1fr_320px]"><section className="rounded-2xl border border-[#E5E7EB] bg-white p-6">{steps.map((label, index) => <div key={label} className="mb-3 flex items-center gap-4 rounded-xl border p-4"><span className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${index < step ? "bg-emerald-100 text-emerald-700" : index === step ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-400"}`}>{index < step ? "✓" : index + 1}</span><div><p className="text-sm font-bold">{label}</p><p className="mt-1 text-xs text-slate-400">{index < step ? "完了" : index === step ? "実行可能" : "待機中"}</p></div></div>)}</section><aside className="rounded-2xl border border-[#E5E7EB] bg-white p-6"><h2 className="font-bold">処理を進める</h2><p className="mt-3 text-sm leading-6 text-slate-500">各工程を順番に実行し、結果を画面上で確認できます。</p><button disabled={step >= steps.length} onClick={() => setStep((current) => current + 1)} className="mt-6 w-full rounded-xl bg-[#2563EB] py-3 text-sm font-bold text-white disabled:bg-emerald-500">{step >= steps.length ? "✓ 処理完了" : `${steps[step]}を実行`}</button></aside></div></ScreenFrame>;
}

function SettingsScreen({ screen }: { screen: DemoScreen }) {
  const fields: Record<string, Array<[string, string]>> = { "temporary-sales": [["対象顧客", "山田 花子"], ["商品", "有明牛乳 900ml"], ["数量", "2"], ["売上日", "2026-08-12"]], "settings-print": [["用紙サイズ", "A4"], ["印刷方向", "縦"], ["上余白（mm）", "15"], ["文字サイズ", "10"]], "settings-invoice": [["発行元名称", "有明乳業株式会社"], ["締め日", "月末"], ["支払期限", "翌月25日"], ["消費税表示", "内税"]], "settings-holidays": [["休日名", "夏季休業"], ["開始日", "2026-08-13"], ["終了日", "2026-08-15"], ["配送振替", "前営業日"]] };
  const items = fields[screen.slug] ?? [["名称", screen.label], ["設定値", "標準"]];
  const [saved, setSaved] = useState(false);
  return <ScreenFrame screen={screen}><form onSubmit={(e) => { e.preventDefault(); setSaved(true); }} className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm"><h2 className="font-bold">{screen.label}の設定</h2><div className="mt-5 grid gap-5 sm:grid-cols-2">{items.map(([label, value]) => <Field key={label} label={label} value={value} />)}<label className="text-sm font-bold sm:col-span-2">備考<textarea className="mt-2 h-24 w-full rounded-xl border border-[#E5E7EB] p-3 font-normal" /></label></div><div className="mt-6 flex justify-end"><button className="rounded-xl bg-[#2563EB] px-6 py-3 text-sm font-bold text-white">{screen.slug === "temporary-sales" ? "売上を登録" : "設定を保存"}</button></div>{saved && <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-700">✓ 保存しました（デモ）</p>}</form></ScreenFrame>;
}

function EditModal({ title, children, onClose, onSave }: { title: string; children: React.ReactNode; onClose: () => void; onSave: () => void }) { return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onMouseDown={onClose}><div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl" onMouseDown={(e) => e.stopPropagation()}><div className="flex items-center justify-between border-b px-6 py-5"><h2 className="text-xl font-bold">{title}</h2><button onClick={onClose} className="rounded-full bg-slate-100 px-3 py-1.5">×</button></div><div className="p-6">{children}</div><div className="flex justify-end gap-3 border-t bg-[#F8FAFC] px-6 py-4"><button onClick={onClose} className="rounded-xl border bg-white px-5 py-2.5 text-sm font-bold">キャンセル</button><button onClick={onSave} className="rounded-xl bg-[#2563EB] px-6 py-2.5 text-sm font-bold text-white">保存する</button></div></div></div>; }
function Field({ label, value, type = "text", onChange }: { label: string; value: string; type?: string; onChange?: (value: string) => void }) { return <label className="text-sm font-bold">{label}<input type={type} value={value} onChange={(e) => onChange?.(e.target.value)} readOnly={!onChange} className="mt-2 h-11 w-full rounded-xl border border-[#E5E7EB] px-3 font-normal outline-none focus:border-[#2563EB]" /></label>; }
function SelectField({ label, options, value, onChange }: { label: string; options: string[]; value?: string; onChange?: (value: string) => void }) { return <label className="text-sm font-bold">{label}<select value={value} onChange={(e) => onChange?.(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 font-normal">{options.map((option) => <option key={option}>{option}</option>)}</select></label>; }
