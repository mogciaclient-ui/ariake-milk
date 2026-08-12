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
          { slug: "temporary-sales", label: "臨時売上", description: "通常契約外の商品販売や追加配送を登録します。", kind: "form" },
          { slug: "payments", label: "入金", description: "顧客の入金状況を検索し、入金処理を登録します。", kind: "list" },
          { slug: "route-staff", label: "順路・担当者変更", description: "配送順、配送担当者、集金担当者を一括変更します。", kind: "list" },
        ],
      },
      {
        label: "現場資料",
        items: [
          { slug: "field-materials", label: "現場資料", description: "配送現場で使用する各種帳票をタブで切り替えて作成します。", kind: "report" },
        ],
      },
      {
        label: "請求・締日",
        items: [
          { slug: "invoices", label: "請求一覧", description: "締日ごとの請求額と入金状況を一覧で確認します。", kind: "list" },
          { slug: "unpaid", label: "未入金管理", description: "支払期限を過ぎた請求と対応状況を管理します。", kind: "list" },
          { slug: "collections", label: "集金予定", description: "担当者別の集金予定と回収結果を確認します。", kind: "report" },
          { slug: "bank-transfer", label: "口座振替", description: "振替データ作成、結果取込、自動入金を管理します。", kind: "status" },
        ],
      },
      {
        label: "管理・分析",
        items: [
          { slug: "sales-details", label: "売上明細", description: "顧客・商品・期間を指定して売上明細を検索します。", kind: "list" },
          { slug: "product-summary", label: "商品集計", description: "商品分類・単価・取引先別の売上を集計します。", kind: "analysis" },
          { slug: "acquisition-cancellation", label: "新規・解約", description: "新規契約と解約の件数・理由・推移を確認します。", kind: "analysis" },
          { slug: "customer-analysis", label: "顧客分析", description: "顧客構成、継続状況、購入傾向を確認します。", kind: "analysis" },
        ],
      },
      {
        label: "マスタ・設定",
        items: [
          { slug: "master-customers", label: "顧客マスタ", description: "顧客の基本情報、住所、連絡先を管理します。", kind: "list" },
          { slug: "master-products", label: "商品マスタ", description: "商品、単価、分類、取引先を管理します。", kind: "list" },
          { slug: "master-routes", label: "コースマスタ", description: "配送・集金コースと順路を管理します。", kind: "list" },
          { slug: "master-staff", label: "担当者マスタ", description: "営業・配送・集金担当者を管理します。", kind: "list" },
          { slug: "master-offices", label: "営業所マスタ", description: "営業所情報と利用状態を管理します。", kind: "list" },
          { slug: "settings-print", label: "印刷設定", description: "帳票ごとの用紙、向き、表示項目を設定します。", kind: "form" },
          { slug: "settings-invoice", label: "請求書設定", description: "請求書の発行元、文言、レイアウトを設定します。", kind: "form" },
          { slug: "settings-holidays", label: "休日設定", description: "営業所の休日と配送振替ルールを設定します。", kind: "form" },
        ],
      },
      {
        label: "本部専用",
        items: [
          { slug: "hq-summary", label: "全営業所集計", description: "全営業所の契約・売上・配送状況を横断集計します。", kind: "analysis" },
          { slug: "customer-transfer", label: "得意先検索・移管", description: "全社から顧客を検索し、営業所間の移管を行います。", kind: "list" },
          { slug: "hq-products", label: "全社商品管理", description: "全社共通の商品、単価、代替商品を管理します。", kind: "list" },
          { slug: "branch-status", label: "支店処理状況", description: "各営業所の締め処理・データ利用状況を確認します。", kind: "status" },
        ],
      },
      ...legacyScreenGroups.filter((group) => group.label !== "現場資料（詳細）"),
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
        label: "LINE管理",
        items: [
          { slug: "dashboard", label: "LINEダッシュボード", description: "友だち数、対応状況、LINE注文を確認します。", kind: "analysis" },
          { slug: "users", label: "LINEユーザー", description: "LINEユーザーと顧客の紐付け状況を管理します。", kind: "list" },
          { slug: "messages", label: "メッセージ", description: "受信・送信メッセージと対応状況を管理します。", kind: "list" },
          { slug: "orders", label: "LINE注文", description: "LINEから受け付けた注文を確認・処理します。", kind: "list" },
          { slug: "broadcasts", label: "一斉配信", description: "セグメントを選択してメッセージを配信します。", kind: "form" },
          { slug: "segments", label: "セグメント", description: "契約・商品・地域などの配信対象条件を管理します。", kind: "list" },
          { slug: "settings", label: "LINE設定", description: "通知テンプレートと連携状態を確認します。", kind: "status" },
        ],
      },
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
import { legacyScreenGroups } from "@/lib/milmo-legacy-screens";
