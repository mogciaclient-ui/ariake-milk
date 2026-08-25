"use client";

import { useState } from "react";
import { StatusBadge } from "@/components/page-heading";

type Spec = { groups: Array<{ title: string; fields: string[] }>; actions?: string[]; columns?: string[]; notice?: string };

export const originalScreenSpecs: Record<string, Spec> = {
  "バーコード入金": { groups: [{ title: "入金条件", fields: ["日付", "入金区分", "集金担当", "実績表示", "入金額初期値"] }], actions: ["リスト", "登録", "中止", "印刷設定"], columns: ["行", "コース", "順路No", "コード", "得意先名", "前回請求額", "今回取引", "入金区分", "入金額", "次回分"] },
  "各種日報": { groups: [{ title: "作表種類", fields: ["売上日報", "入金日報", "入金日報月報", "入金月報コース別", "集金担当者別入金日報", "口座振替委託銀行別"] }, { title: "抽出条件", fields: ["範囲合計", "請求区分", "対象日付", "配達コース", "委託銀行", "入金区分"] }], actions: ["表示", "印刷", "印刷設定", "CSV"] },
  "順路・担当者変更": { groups: [{ title: "変更種類", fields: ["順路変更", "担当者変更", "コース区分", "担当者区分", "表示順"] }, { title: "振り分け条件", fields: ["変更元コース・担当者", "変更先コース・担当者", "拾い出し方式"] }], actions: ["左右を総入替", "実行", "中止"], columns: ["選択", "順路", "得意先コード", "得意先名", "現在", "変更後"] },
  "口座振替": { groups: [{ title: "処理種類", fields: ["口座振替一覧表", "振替データ作成", "振替データ確認一覧", "振替結果データ一覧", "振替自動入金"] }, { title: "処理条件", fields: ["対象締日", "委託銀行", "集金区分", "対象ファイル"] }], actions: ["表示", "データ作成", "結果取込"], columns: ["得意先コード", "得意先名", "委託銀行", "請求金額", "振替結果"] },
  "未入金管理表": { groups: [{ title: "作表種類", fields: ["リスト（1列）", "一覧表（2列）", "一覧表（2列・枠付）", "年間管理表", "前3ヶ月分売上印字"] }, { title: "抽出条件", fields: ["改ページ", "親子の出力順", "対象締日", "配達コース＆順路", "集金区分", "委託銀行"] }], actions: ["表示", "印刷", "印刷設定", "CSV"] },
  "新規・解約管理": { groups: [{ title: "作表種類", fields: ["実配件数表", "解約者名簿", "新規拡販名簿", "解約者集金区分別件数", "契約件数表", "契約本数別集計表", "解約本数別集計表"] }, { title: "集計条件", fields: ["対象日付（契約期間）", "配達コース", "契約担当", "作表順"] }], actions: ["表示", "印刷", "印刷設定", "CSV"] },
  "売上明細検索": { groups: [{ title: "検索条件", fields: ["得意先", "商品範囲", "品名指定", "対象日付"] }], actions: ["明細表示", "表示", "印刷", "印刷設定", "CSV"], columns: ["日付", "得意先", "商品", "数量", "単価", "金額"] },
  "付箋チェックリスト": { groups: [{ title: "表示条件", fields: ["付箋1", "付箋2", "付箋3", "チェック済み条件", "作表順"] }, { title: "抽出条件", fields: ["契約日", "解約日", "配達コース＆順路", "契約担当", "集金区分", "委託銀行"] }], actions: ["表示", "印刷", "印刷設定", "CSV"] },
  "得意先・商品順位表": { groups: [{ title: "作表種類", fields: ["得意先順位表", "商品順位表", "コース内順位", "全体順位", "売上金額", "粗利金額", "売上本数"] }, { title: "集計条件", fields: ["対象日付", "順位", "配達コース＆順路", "商品", "商品分類1", "商品分類2"] }], actions: ["表示", "印刷", "印刷設定", "CSV"] },
  "締日": { groups: [{ title: "締日情報", fields: ["締日コード", "締日名称", "締日", "支払日", "請求対象月", "使用区分"] }], actions: ["検索", "登録", "削除"], columns: ["コード", "締日名称", "締日", "支払日", "状態"] },
  "商品参照": { groups: [{ title: "検索条件", fields: ["商品コード", "商品名", "ヨミカナ", "メーカー", "仕入先", "商品分類1", "商品分類2", "販売状態"] }], actions: ["検索", "CSV"], columns: ["商品コード", "商品名", "メーカー", "単価", "税区分", "状態"] },
  "委託銀行": { groups: [{ title: "委託銀行情報", fields: ["委託銀行コード", "委託銀行名", "銀行コード", "支店コード", "委託者コード", "振替日", "使用区分"] }], actions: ["検索", "登録", "削除"], columns: ["コード", "委託銀行名", "銀行・支店", "振替日", "状態"] },
  "誕生日管理": { groups: [{ title: "抽出条件", fields: ["対象月", "配達コース＆順路", "年齢範囲", "対応状況", "プレゼント区分"] }], actions: ["表示", "登録", "誕生日台帳印刷"], columns: ["得意先", "誕生日", "年齢", "コース", "対応状況", "プレゼント"] },
  "ナビ": { groups: [{ title: "ナビ処理", fields: ["ナビ座標修正", "座標取り込み", "ナビ転送（配送）", "ナビ転送（集金）", "ナビ転送（解約）"] }, { title: "対象条件", fields: ["対象日付", "配達・集金コース", "座標未設定のみ", "出力先"] }], actions: ["検索", "座標取得", "取り込み", "ナビ転送"], columns: ["順路", "得意先", "住所", "緯度", "経度", "状態"] },
  "臨時売上": { groups: [{ title: "得意先検索", fields: ["コード", "コース", "順路", "得意先名", "住所", "ヨミカナ", "TEL", "集金区分", "休日配達", "税区分", "契約担当", "配達担当", "集金担当"] }, { title: "売上内容", fields: ["配達日付", "伝票発行", "プレビュー表示"] }], actions: ["検索", "登録", "中止"], columns: ["行", "コード", "商品名", "税区分", "数量", "単価", "金額"] },
  "臨時売上連続": { groups: [{ title: "登録条件", fields: ["入荷予定日"] }], notice: "配達日付は、入荷日の翌日から2週間以内を検索し、配達実績のある日がセットされます。", actions: ["登録", "中止", "印刷", "印刷設定"], columns: ["行", "コース", "順路", "得意先", "商品名", "配達日付", "数量", "単価", "金額"] },
  "請求一覧表": { groups: [{ title: "作表内容", fields: ["コース計のみ", "得意先毎一覧", "親子の出力順", "税率別印字", "粗利印字"] }, { title: "抽出条件", fields: ["対象締日", "配達コース＆順路", "集金区分", "委託銀行"] }], actions: ["表示", "印刷", "印刷設定", "CSV"] },
  "請求書": { groups: [{ title: "作表種類", fields: ["宅配請求書", "今回分", "再発行", "前回分", "次回分", "罫線のみ"] }, { title: "出力条件", fields: ["親子の出力順", "請求額がゼロでも出力する", "前回残高印字", "対象締日", "配達コース＆順路", "集金区分", "委託銀行", "レイアウト", "メッセージ", "開始ページ"] }], actions: ["表示", "印刷", "印刷設定"] },
  "キャンペーン請求書": { groups: [{ title: "請求条件", fields: ["対象締日", "配達コース＆順路", "キャンペーン商品", "請求額ゼロの出力", "メッセージ", "開始ページ"] }], actions: ["表示", "印刷", "印刷設定"] },
  "商品単価別集計表": { groups: [{ title: "集計条件", fields: ["対象日付", "配達コース＆順路", "商品", "メーカー", "商品分類1", "商品分類2", "単価範囲", "範囲合計"] }], actions: ["表示", "印刷", "印刷設定", "CSV"] },
  "商品日報・月報": { groups: [{ title: "作表種類", fields: ["商品日報", "商品月報", "商品コード順", "商品ヨミカナ順"] }, { title: "集計条件", fields: ["対象日付", "配達コース＆順路", "商品", "メーカー", "商品分類1", "発注商品集計", "合計印字"] }], actions: ["表示", "印刷", "印刷設定", "CSV"] },
  "商品取引先リスト": { groups: [{ title: "作表種類", fields: ["メーカー別", "仕入先別"] }, { title: "抽出条件", fields: ["商品", "メーカー", "仕入先", "商品分類1", "商品分類2", "取引停止商品"] }], actions: ["表示", "印刷", "印刷設定", "CSV"] },
  "臨時休業": { groups: [{ title: "作業方法", fields: ["無配達", "指定日倍配", "前回配達日倍配"] }, { title: "処理条件", fields: ["休業期間", "指定倍配期間", "配達指定日", "配達コース＆順路", "商品"] }], notice: "処理前に保存・更新メニューからデータ保存を実行してください。", actions: ["処理実行"] },
  "商品単価変更": { groups: [{ title: "変更条件", fields: ["適用日", "商品", "変更前単価", "変更後単価", "配達コース＆順路", "契約単価", "実績単価"] }], actions: ["対象検索", "変更実行"], columns: ["得意先コード", "得意先名", "商品", "変更前単価", "変更後単価", "適用日"] },
  "履歴参照": { groups: [{ title: "検索条件", fields: ["得意先", "処理日付", "処理区分", "端末名", "担当者"] }], actions: ["検索", "CSV"], columns: ["処理日時", "得意先", "処理区分", "変更内容", "担当者"] },
  "データ変更ログ参照": { groups: [{ title: "検索条件", fields: ["対象日付", "操作者", "端末名", "画面名", "テーブル名", "得意先コード"] }], actions: ["検索", "CSV"], columns: ["日時", "操作者", "画面", "対象", "変更前", "変更後"] },
  "配達コース": { groups: [{ title: "コース情報", fields: ["コースコード", "コース名", "配達担当者", "配達曜日", "開始時刻", "使用区分"] }], actions: ["検索", "登録", "削除"], columns: ["コード", "コース名", "配達担当者", "曜日", "状態"] },
  "集金コース": { groups: [{ title: "コース情報", fields: ["コースコード", "コース名", "集金担当者", "集金日", "使用区分"] }], actions: ["検索", "登録", "削除"], columns: ["コード", "コース名", "集金担当者", "集金日", "状態"] },
  "得意先": { groups: [{ title: "基本情報", fields: ["得意先コード", "得意先名", "ヨミカナ", "郵便番号", "住所1", "住所2", "電話番号", "配達コース", "集金コース", "契約担当", "集金区分"] }], actions: ["検索", "登録", "削除"], columns: ["コード", "得意先名", "住所", "配達コース", "状態"] },
  "得意先情報": { groups: [{ title: "参照条件", fields: ["得意先コード", "得意先名", "配達コース＆順路"] }, { title: "表示情報", fields: ["基本情報", "契約情報", "配達情報", "請求・入金情報", "付箋"] }], actions: ["検索", "表示"], columns: ["コード", "得意先名", "コース", "集金区分", "契約状態"] },
  "自社名設定": { groups: [{ title: "帳票印字情報", fields: ["会社名", "郵便番号", "住所1", "住所2", "電話番号", "FAX番号", "代表者名", "登録番号"] }], actions: ["登録"] },
  "伝票設定": { groups: [{ title: "伝票設定", fields: ["伝票種類", "用紙", "印字位置", "会社名印字", "商品コード印字", "備考印字"] }], actions: ["登録", "プレビュー"] },
  "請求書設定": { groups: [{ title: "請求書設定", fields: ["請求書種類", "用紙", "レイアウト", "締日文言", "振込先", "メッセージ", "登録番号印字"] }], actions: ["登録", "プレビュー"] },
  "印刷設定": { groups: [{ title: "プリンター設定", fields: ["帳票種類", "プリンター", "用紙サイズ", "給紙方法", "印刷方向", "余白"] }], actions: ["登録", "テスト印刷"] },
  "ビュー再作成": { groups: [{ title: "再作成対象", fields: ["契約・実績", "請求・入金", "商品集計", "得意先情報"] }], notice: "他の端末で処理中でないことを確認してから実行してください。", actions: ["再作成実行"] },
  "データ保存": { groups: [{ title: "保存対象", fields: ["店舗通常データ", "店舗履歴データ", "並び順"] }], actions: ["ディスク保存", "メディア保存", "削除"], columns: ["保存日時", "営業所", "処理名称", "保存先", "状態"] },
  "データ復元": { groups: [{ title: "復元対象", fields: ["店舗通常データ", "店舗履歴データ", "並び順"] }], notice: "復元する保存データを一覧から選択してください。", actions: ["ディスク復元", "削除"], columns: ["保存日時", "営業所", "処理名称", "保存先", "状態"] },
  "締日更新": { groups: [{ title: "更新条件", fields: ["対象締日", "更新年月", "請求確定", "翌月繰越"] }], notice: "更新前にデータ保存を実行し、未処理の入金・請求がないことを確認してください。", actions: ["事前確認", "締日更新実行"], columns: ["確認項目", "対象件数", "金額", "結果"] },
  "月次更新": { groups: [{ title: "更新条件", fields: ["現在処理月", "更新後処理月", "実績更新", "請求更新"] }], notice: "月次更新後は処理対象月が翌月へ移ります。", actions: ["事前確認", "月次更新実行"], columns: ["確認項目", "対象件数", "金額", "結果"] },
};

export function MilmoOriginalPanel({ name }: { name: string }) {
  const spec = originalScreenSpecs[name];
  const [shown, setShown] = useState(false);
  if (!spec) return null;
  const columns = spec.columns;
  return <div className="space-y-5">
    {spec.notice && <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">{spec.notice}</div>}
    <section className="rounded-2xl border border-[#DCE3ED] bg-white shadow-sm">
      <div className="grid gap-5 p-5 lg:grid-cols-2">{spec.groups.map((group) => <fieldset key={group.title} className="rounded-xl border border-[#DCE3ED] p-4"><legend className="px-2 text-sm font-bold text-slate-600">{group.title}</legend><div className="grid gap-4 sm:grid-cols-2">{group.fields.map((field, index) => field.includes("する") || field.includes("印字") || field.includes("順") || field.includes("分") || field.includes("種類") || field.includes("区分") || field.includes("表示情報") ? <label key={field} className="text-sm font-bold">{field}<select className="mt-2 h-10 w-full rounded-lg border border-[#CBD5E1] bg-white px-3 font-normal"><option>{index % 2 ? "しない" : "する"}</option><option>{index % 2 ? "する" : "しない"}</option></select></label> : <label key={field} className="text-sm font-bold">{field}<input type={field.includes("日") || field.includes("期間") ? "date" : "text"} className="mt-2 h-10 w-full rounded-lg border border-[#CBD5E1] bg-white px-3 font-normal" /></label>)}</div></fieldset>)}</div>
      <div className="flex flex-wrap justify-end gap-2 border-t border-[#DCE3ED] bg-[#F8FAFC] p-4">{(spec.actions ?? ["表示"]).map((action) => <button key={action} type="button" onClick={() => setShown(true)} className="rounded-lg border border-[#2563EB] bg-white px-5 py-2.5 text-sm font-bold text-[#2563EB] transition hover:bg-[#2563EB] hover:text-white">{action}</button>)}</div>
    </section>
    {columns && shown && <section className="overflow-hidden rounded-2xl border border-[#DCE3ED] bg-white"><div className="flex items-center justify-between border-b p-4"><h3 className="font-bold">{name} 一覧</h3><StatusBadge tone="blue">検索結果</StatusBadge></div><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-[#E8F7F6] text-xs text-slate-600"><tr>{columns.map((column) => <th key={column} className="border-r px-4 py-3">{column}</th>)}</tr></thead><tbody>{[1,2,3,4,5].map((row) => <tr key={row} className="border-t"><td className="px-4 py-3">{row}</td>{columns.slice(1).map((column) => <td key={column} className="px-4 py-3 text-slate-500">—</td>)}</tr>)}</tbody></table></div></section>}
  </div>;
}
