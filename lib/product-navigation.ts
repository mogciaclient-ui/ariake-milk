export type DemoScreenKind = "list" | "form" | "report" | "analysis" | "status";

export type DemoScreen = {
  slug: string;
  label: string;
  description: string;
  kind: DemoScreenKind;
};

export type DemoNavGroup = {
  label: string;
  items: DemoScreen[];
};

export type DemoProduct = {
  id: "milmo" | "selmo" | "commo";
  name: string;
  dotColor: string;
  description: string;
  groups: DemoNavGroup[];
};

export const demoProducts: DemoProduct[] = [
  {
    id: "milmo",
    name: "milmo",
    dotColor: "text-[#EF4444]",
    description: "配送・契約・売上管理",
    groups: [
      {
        label: "契約・売上",
        items: [
          { slug: "contract-performance", label: "契約実績", description: "顧客ごとの契約内容と日別配送実績を確認・更新します。", kind: "list" },
          { slug: "customers", label: "顧客管理", description: "顧客登録、契約、誕生日、メモ、フォロー状況を一か所で管理します。", kind: "list" },
          { slug: "temporary-sales-management", label: "臨時売上", description: "臨時売上の個別登録と連続登録をまとめて行います。", kind: "form" },
          { slug: "barcode-payment", label: "入金登録", description: "月別の入金表から対象顧客をチェックし、入金日時を記録します。", kind: "form" },
          { slug: "route-staff", label: "順路・担当者変更", description: "配送順と配送・集金担当者をまとめて変更します。", kind: "list" },
          { slug: "daily-reports", label: "各種日報", description: "売上・入金・契約変更の日報を作成します。", kind: "report" },
        ],
      },
      {
        label: "現場資料",
        items: [
          { slug: "field-materials", label: "現場資料", description: "順路表、本数集計表、変更・ピッキング・配送関連帳票をまとめて作成します。", kind: "report" },
        ],
      },
      {
        label: "請求・締日",
        items: [
          { slug: "invoice-management", label: "請求管理", description: "請求一覧、請求書、キャンペーン請求書をまとめて管理します。", kind: "report" },
          { slug: "bank-transfer", label: "口座振替", description: "振替データ作成、結果取込、自動入金を管理します。", kind: "status" },
          { slug: "unpaid", label: "未入金管理表", description: "支払期限を過ぎた請求と対応状況を管理します。", kind: "list" },
        ],
      },
      {
        label: "管理資料",
        items: [
          { slug: "acquisition-cancellation", label: "新規・解約管理", description: "新規契約と解約の件数・理由・推移を確認します。", kind: "analysis" },
          { slug: "product-management-reports", label: "商品管理資料", description: "商品単価別集計、日報・月報、取引先リストをまとめて作成します。", kind: "report" },
          { slug: "sales-details", label: "売上明細検索", description: "顧客・商品・期間を指定して売上明細を検索します。", kind: "list" },
        ],
      },
      {
        label: "分析資料",
        items: [
          { slug: "customer-product-ranking", label: "得意先・商品順位表", description: "顧客・商品の売上順位を期間別に出力します。", kind: "analysis" },
        ],
      },
      {
        label: "他処理",
        items: [
          { slug: "bulk-operations", label: "一括処理", description: "臨時休業と商品単価変更をまとめて管理します。", kind: "form" },
          { slug: "audit-history", label: "履歴・変更ログ", description: "業務履歴とデータ変更ログをまとめて検索します。", kind: "list" },
        ],
      },
      { label: "マスタ保守", items: [
        { slug: "course-master", label: "コース", description: "配達コースと集金コースをまとめて管理します。", kind: "list" },
        { slug: "master-closing-date", label: "締日", description: "請求締日と支払条件を管理します。", kind: "list" },
        { slug: "master-products", label: "商品管理", description: "商品、税込・税抜価格、税区分、分類、仕入先を管理します。", kind: "list" },
        { slug: "master-contracted-bank", label: "委託銀行", description: "口座振替の委託銀行情報を管理します。", kind: "list" },
      ] },
      { label: "設定", items: [
        { slug: "document-settings", label: "帳票・権限設定", description: "請求書の印字名と過去データの編集権限を管理します。", kind: "form" },
      ] },
    ],
  },
  {
    id: "selmo",
    name: "selmo",
    dotColor: "text-yellow-400",
    description: "営業分析",
    groups: [
      {
        label: "商談・テレアポ分析",
        items: [
          { slug: "dashboard", label: "ダッシュボード", description: "商談品質、利用状況、改善傾向を確認します。", kind: "analysis" },
          { slug: "meetings", label: "営業一覧", description: "登録された営業活動・テレアポと処理状況を確認します。", kind: "list" },
          { slug: "meeting-upload", label: "アップロード", description: "文字起こしと商談情報を入力して、AI分析へ登録します。", kind: "form" },
          { slug: "speaker-separation", label: "話者分離", description: "商談ログの話者を確認・修正してAI分析を開始します。", kind: "form" },
          { slug: "meeting-analysis", label: "AI分析結果", description: "要約、顧客温度感、営業評価、改善点を確認します。", kind: "analysis" },
        ],
      },
      {
        label: "AIロープレ",
        items: [
          { slug: "roleplay", label: "ロープレ", description: "シナリオを選び、AI顧客との練習を開始します。", kind: "form" },
          { slug: "roleplay-session", label: "ロープレ中", description: "AI顧客と会話しながら苦手テーマを練習します。", kind: "form" },
          { slug: "scenarios", label: "シナリオ", description: "商談・テレアポの練習シナリオを管理します。", kind: "list" },
          { slug: "roleplay-results", label: "採点結果", description: "ロープレのスコア、強み、改善フレーズを確認します。", kind: "analysis" },
        ],
      },
    ],
  },
  {
    id: "commo",
    name: "commo",
    dotColor: "text-violet-500",
    description: "公式LINE管理",
    groups: [
      {
        label: "",
        items: [
          { slug: "home", label: "ホーム", description: "LINE運用の状況と重要な指標を確認します。", kind: "analysis" },
        ],
      },
      { label: "顧客", items: [
        { slug: "customers", label: "顧客一覧", description: "LINE連携済みの顧客情報を一覧で確認します。", kind: "list" },
        { slug: "customer-analysis", label: "顧客分析", description: "顧客構成や行動傾向を分析します。", kind: "analysis" },
      ] },
      { label: "アンケート", items: [
        { slug: "survey-responses", label: "回答", description: "アンケートの回答内容を確認します。", kind: "list" },
        { slug: "survey-analysis", label: "分析", description: "アンケート結果を集計・分析します。", kind: "analysis" },
      ] },
      { label: "セグメント", items: [
        { slug: "segments", label: "セグメント一覧", description: "配信対象の顧客セグメントを管理します。", kind: "list" },
        { slug: "segment-create", label: "新規作成", description: "条件を指定して新しいセグメントを作成します。", kind: "form" },
      ] },
      { label: "配信", items: [
        { slug: "broadcast-create", label: "新規配信", description: "対象と内容を指定してLINE配信を作成します。", kind: "form" },
        { slug: "broadcast-scheduled", label: "配信予定", description: "予約中のLINE配信を確認・編集します。", kind: "list" },
        { slug: "broadcast-history", label: "配信履歴", description: "過去の配信内容と結果を確認します。", kind: "list" },
      ] },
      { label: "分析", items: [
        { slug: "analysis-line", label: "LINE", description: "友だち数やメッセージ反応を分析します。", kind: "analysis" },
        { slug: "analysis-customers", label: "顧客", description: "顧客属性と行動傾向を分析します。", kind: "analysis" },
        { slug: "analysis-broadcasts", label: "配信", description: "配信ごとの開封・反応状況を分析します。", kind: "analysis" },
        { slug: "analysis-conversions", label: "コンバージョン", description: "配信から注文・契約への成果を分析します。", kind: "analysis" },
      ] },
      { label: "AI", items: [
        { slug: "ai-recommendations", label: "おすすめ施策", description: "顧客データから次に実施する施策を提案します。", kind: "analysis" },
        { slug: "ai-message-create", label: "配信文章作成", description: "目的に合わせてLINE配信文をAIで作成します。", kind: "form" },
      ] },
      { label: "設定", items: [
        { slug: "settings-line", label: "LINE連携", description: "LINE公式アカウントとの連携状態を管理します。", kind: "status" },
        { slug: "settings-tags", label: "タグ", description: "顧客・配信に使用するタグを管理します。", kind: "list" },
        { slug: "settings-auto-classification", label: "自動分類", description: "顧客を自動分類する条件を設定します。", kind: "form" },
        { slug: "settings-account", label: "アカウント", description: "commo.のアカウント情報を確認・設定します。", kind: "form" },
      ] },
    ],
  },
];

export function getDemoProduct(productId: string) {
  return demoProducts.find((product) => product.id === productId);
}

export function getDemoScreen(productId: string, slug: string) {
  const product = getDemoProduct(productId);
  const screen = product?.groups.flatMap((group) => group.items).find((item) => item.slug === slug);
  return product && screen ? { product, screen } : null;
}
