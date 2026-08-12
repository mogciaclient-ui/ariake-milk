export type LegacyMode = "report" | "batch" | "master" | "workflow" | "utility";

export type LegacyConfig = {
  slug: string;
  label: string;
  description: string;
  kind: "list" | "form" | "report" | "analysis" | "status";
  mode: LegacyMode;
  category: string;
};

const make = (category: string, mode: LegacyMode, entries: Array<[string, string, string]>): LegacyConfig[] => entries.map(([slug, label, description]) => ({ slug, label, description, mode, category, kind: mode === "report" ? "report" : mode === "master" ? "list" : mode === "workflow" ? "status" : "form" }));

export const legacyScreenGroups = [
  { label: "契約・売上（詳細）", items: make("契約・売上", "batch", [
    ["barcode-payment", "バーコード入金", "バーコードを読み取り、顧客の入金を連続登録します。"],
    ["payment-inquiry", "入金明細問い合わせ", "顧客・期間・入金方法から入金明細を検索します。"],
    ["payment-summary", "入金集計表", "期間・担当者・入金区分別に入金を集計します。"],
    ["daily-reports", "各種日報", "売上・入金・契約変更の日報を作成します。"],
    ["temporary-sales-continuous", "臨時売上連続", "複数顧客の臨時売上を表形式で連続登録します。"],
    ["delivery-staff-check", "配達担当者チェック", "契約と配送担当者の未設定・不整合を確認します。"],
  ]) },
  { label: "現場資料（詳細）", items: make("現場資料", "report", [
    ["crate-picking", "クレートピッキングリスト", "クレート単位の商品準備数を出力します。"],
    ["crate-delivery", "クレート配送リスト", "配送コースごとのクレート積載内容を出力します。"],
    ["change-list", "変更リスト", "契約・商品・配送曜日の変更内容を出力します。"],
    ["delivery-invoice", "配達納品書", "配送先ごとの商品・数量・金額を納品書形式で出力します。"],
    ["suspension-list", "休配リスト", "休配期間中の顧客と振替状況を出力します。"],
  ]) },
  { label: "請求・締日（詳細）", items: make("請求・締日", "report", [
    ["invoice-print", "請求書", "対象締日の顧客別請求書を作成します。"],
    ["campaign-invoice", "キャンペーン請求書", "キャンペーン対象顧客の請求書を作成します。"],
    ["payment-schedule", "入金予定一覧表", "顧客・集金担当者別の入金予定を出力します。"],
    ["payment-status", "入金状況表", "請求額・入金額・残額を一覧表示します。"],
    ["payment-history", "入金履歴リスト", "期間内の入金履歴を顧客別に出力します。"],
    ["receivables-balance", "売掛残高一覧表", "顧客別の前月残・売上・入金・残高を出力します。"],
    ["quantity-sales-summary", "本数・売上集計表", "商品本数と売上金額を締日別に集計します。"],
    ["consumption-tax-summary", "消費税集計表", "税率・課税区分別の売上と消費税を集計します。"],
    ["sales-list", "売上一覧表", "締日・顧客・商品別の売上を出力します。"],
  ]) },
  { label: "口座振替（詳細）", items: make("口座振替", "workflow", [
    ["bank-account-list", "口座振替一覧表", "顧客別の口座振替契約と請求状況を確認します。"],
    ["transfer-data-create", "振替データ作成", "委託銀行別の口座振替データを作成します。"],
    ["transfer-data-check", "振替データ確認一覧", "作成した振替データの件数・金額・エラーを確認します。"],
    ["transfer-result-list", "振替結果データ一覧", "銀行から返却された振替結果を確認します。"],
    ["transfer-auto-payment", "振替自動入金", "振替成功結果を顧客入金へ一括反映します。"],
    ["postpay-data-create", "後払い.comデータ作成", "後払いサービス用の請求データを作成します。"],
    ["postpay-auto-payment", "後払い.com自動入金", "後払い結果を顧客入金へ反映します。"],
  ]) },
  { label: "管理資料（詳細）", items: make("管理資料", "report", [
    ["sticky-note-check", "付箋チェックリスト", "重要メモ・付箋のある顧客を一覧出力します。"],
    ["cooler-recovery", "保冷箱・保冷剤回収表", "貸出中の保冷箱・保冷剤を顧客別に確認します。"],
    ["category-summary", "商品分類集計表", "商品分類別の本数・売上・構成比を集計します。"],
    ["price-summary", "商品単価別集計表", "販売単価帯別の顧客数・本数・売上を集計します。"],
    ["supplier-product-list", "商品取引先リスト", "メーカー・仕入先別の商品情報を出力します。"],
    ["product-sales-monthly", "商品売上月報", "商品別の月間本数・売上・前年対比を出力します。"],
    ["product-daily-monthly", "商品日報・月報", "商品実績を日別・月別に切り替えて出力します。"],
    ["staff-count-summary", "担当者別件数集計表", "担当者別の契約・休止・解約件数を集計します。"],
    ["staff-delivery-result", "担当者別配達商品実績表", "配達員ごとの商品別配送実績を出力します。"],
  ]) },
  { label: "分析資料（詳細）", items: make("分析資料", "report", [
    ["customer-product-ranking", "得意先・商品順位表", "顧客・商品の売上順位を期間別に出力します。"],
    ["customer-sales-trend", "得意先別売上本数推移表", "顧客別の売上・本数推移を出力します。"],
    ["new-continuation-analysis", "新規継続分析表", "新規契約の継続月数と解約状況を分析します。"],
    ["daily-average-summary", "日均本数集計表", "営業日当たりの商品本数を営業所・コース別に集計します。"],
    ["customer-share-summary", "顧客シェア集計表", "地域世帯数に対する契約顧客シェアを集計します。"],
  ]) },
  { label: "他処理", items: make("他処理", "batch", [
    ["dm-issue", "DM発行", "条件に一致する顧客を抽出し、宛名・住所データを作成します。"],
    ["product-replacement", "商品入替処理", "旧商品契約を新商品へ一括置換します。"],
    ["product-price-change", "商品単価変更", "商品単価を指定日から一括変更します。"],
    ["contract-price-check", "契約・実績単価チェック", "商品マスタと異なる契約・実績単価を抽出します。"],
    ["substitute-product-list", "代替商品一覧", "商品ごとの代替商品設定を確認・出力します。"],
    ["history-reference", "履歴参照", "顧客・契約・売上・入金の変更履歴を検索します。"],
    ["data-change-log", "データ変更ログ参照", "操作者・日時・画面・変更内容から操作ログを検索します。"],
    ["temporary-closure", "臨時休業", "営業所休業日と配送振替を一括設定します。"],
    ["year-end-process", "年末処理", "年末年始の配送日・まとめ配送を一括設定します。"],
    ["year-end-master", "年末処理マスタ", "年末処理で使用する振替ルールを管理します。"],
  ]) },
  { label: "マスタ保守（詳細）", items: make("マスタ保守", "master", [
    ["master-dm-category", "DM区分", "DM抽出に使用する顧客区分を管理します。"],
    ["master-closing-date", "締日", "請求締日と支払条件を管理します。"],
    ["master-collection-route", "集金コース", "集金担当者・訪問順を管理します。"],
    ["master-contracted-bank", "委託銀行", "口座振替の委託銀行情報を管理します。"],
    ["master-bank", "銀行", "銀行・支店・金融機関コードを管理します。"],
    ["master-maker", "メーカー", "商品メーカー情報を管理します。"],
    ["master-supplier", "仕入れ先", "商品仕入れ先と取引条件を管理します。"],
    ["master-substitute-product", "代替商品", "休売・欠品時の代替商品を管理します。"],
    ["master-product-category-1", "商品分類1", "商品大分類を管理します。"],
    ["master-product-category-2", "商品分類2", "商品小分類を管理します。"],
    ["master-households", "地域別世帯数", "顧客シェア分析に使用する地域世帯数を管理します。"],
    ["master-cancellation-category", "解約区分", "解約理由と集計区分を管理します。"],
    ["master-company-message", "全体メッセージ", "全営業所に表示する業務連絡を管理します。"],
    ["master-branch", "本支店", "本社・支店・営業所の基本情報を管理します。"],
  ]) },
  { label: "設定（詳細）", items: make("設定", "utility", [
    ["settings-slip", "伝票設定", "納品書・請求書の項目とレイアウトを設定します。"],
    ["settings-company", "自社名設定", "帳票へ印字する会社情報を設定します。"],
    ["settings-standard-print", "標準印刷設定", "帳票ごとのプリンター・用紙・余白を設定します。"],
    ["settings-system", "システム設定", "営業日・処理日・基本動作を設定します。"],
    ["settings-system-detail", "システム詳細設定", "各業務機能の詳細な動作条件を設定します。"],
    ["settings-tax", "消費税設定", "税率・適用開始日・端数処理を設定します。"],
    ["settings-era", "元号設定", "帳票で使用する元号と適用期間を設定します。"],
    ["settings-rebuild-view", "ビュー再作成", "参照用データを再構築します。"],
  ]) },
  { label: "保存・更新", items: make("保存・更新", "workflow", [
    ["data-backup", "データ保存", "営業所データの保存対象と実行結果を確認します。"],
    ["data-restore", "データ復元", "保存履歴から復元対象を選択し、内容を確認します。"],
    ["monthly-update", "月次更新", "請求・売上・実績の対象月を更新します。"],
    ["closing-date-update", "締日更新", "締日別の請求確定と翌月繰越を実行します。"],
  ]) },
  { label: "オプション", items: make("オプション", "utility", [
    ["navigation-coordinate", "ナビ座標修正", "顧客住所の地図座標を検索・修正します。"],
    ["coordinate-import", "座標取り込み", "住所座標データを一括取り込みします。"],
    ["navigation-export-delivery", "ナビ転送（配送）", "配送順と座標をナビ用データとして出力します。"],
    ["navigation-export-collection", "ナビ転送（集金）", "集金順と座標をナビ用データとして出力します。"],
    ["navigation-export-cancellation", "ナビ転送（解約）", "解約回収先をナビ用データとして出力します。"],
    ["address-export", "住所出力", "条件に一致する顧客住所をCSV出力します。"],
    ["birthday-list", "誕生日一覧", "対象月の誕生日顧客を一覧表示します。"],
    ["birthday-ledger", "誕生日台帳", "誕生日顧客の訪問・プレゼント確認台帳を出力します。"],
    ["birthday-management", "誕生日管理", "誕生日顧客の対応状況とプレゼントを管理します。"],
  ]) },
  { label: "本部処理（詳細）", items: make("本部処理", "workflow", [
    ["hq-product-replacement", "全社商品入替", "全支店の商品契約を新商品へ一括置換します。"],
    ["hq-price-change", "全社商品単価変更", "全支店へ商品単価変更を配信します。"],
    ["hq-transfer-merge", "振替データ統合", "支店ごとの振替データを本部で統合します。"],
    ["hq-transfer-merge-settings", "振替データ統合設定", "銀行・支店別の統合ルールを設定します。"],
    ["hq-transfer-result-split", "結果データ分割", "銀行結果を支店別データへ分割します。"],
    ["hq-held-count", "保有件数表", "支店別の商品保有顧客数を集計します。"],
    ["hq-sales-results", "売上実績表", "支店・商品・期間別の売上実績を集計します。"],
  ]) },
];

export const legacyScreens = legacyScreenGroups.flatMap((group) => group.items);
export function getLegacyScreenConfig(slug: string) { return legacyScreens.find((screen) => screen.slug === slug); }
