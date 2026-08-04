export type LegacyFeature = {
  id: string;
  category: string;
  name: string;
  scope: "office" | "headquarters";
  description: string;
};

const categories: Array<{
  category: string;
  scope?: "office" | "headquarters";
  description: string;
  names: string[];
}> = [
  { category: "契約・売上", description: "顧客ごとの契約、配送実績、入金を扱う日常業務", names: ["契約・実績", "新規契約", "再契約・解約", "臨時売上", "臨時売上連続", "宅配入金", "バーコード入金", "入金明細問い合わせ", "入金集計表", "順路変更", "担当者変更", "配達担当者チェック", "各種日報"] },
  { category: "現場資料", description: "配送準備や配達現場で使う帳票・出力", names: ["予定台帳", "変更リスト", "ピッキングリスト", "クレートピッキングリスト", "配送リスト", "クレート配送リスト", "順路表", "本数集計表", "配達納品書"] },
  { category: "請求・締日", description: "請求、集金、未入金、口座振替に関する処理", names: ["請求一覧表", "請求書", "キャンペーン請求書", "集金予定一覧表", "入金予定一覧表", "入金履歴リスト", "入金状況表", "未入金管理表", "本数・売上集計表", "消費税集計表", "口座振替一覧表", "振替データ作成", "振替データ確認", "振替結果データ一覧", "振替自動入金", "後払い.comデータ作成", "後払い.com自動入金"] },
  { category: "管理資料", description: "売上・商品・担当者を確認する管理帳票", names: ["売上明細検索", "売掛残高一覧表", "商品分類集計表", "商品単価別集計表", "商品取引先リスト", "商品売上月報", "商品日報・月報", "担当者別件数集計表", "担当者別配達商品実績表", "新規・解約管理", "保冷箱・保冷剤回収表", "付箋チェックリスト"] },
  { category: "分析資料", description: "営業・顧客・商品実績を比較する分析帳票", names: ["営業分析", "新規継続分析表", "得意先・商品順位表", "得意先別売上本数推移表", "日均本数集計表", "顧客シェア集計表", "休配リスト"] },
  { category: "他処理", description: "データ一括変更、履歴確認、年末処理など", names: ["商品入替処理", "商品単価変更", "契約・実績単価チェック", "代替商品一覧", "DM発行", "臨時休業", "履歴参照", "データ変更ログ参照", "年末処理", "年末処理マスタ"] },
  { category: "マスタ保守", description: "日常業務で利用する商品・顧客・コースのマスタ", names: ["得意先", "得意先情報", "商品参照", "配達コース", "集金コース", "締日", "DM区分", "委託銀行"] },
  { category: "設定", description: "帳票とシステム表示に関する営業所設定", names: ["自社名設定", "伝票設定", "請求書設定", "印刷設定", "ビュー再作成"] },
  { category: "保存・更新", description: "現行システムの保守・締め処理", names: ["データ保存", "データ復元", "月次更新", "締日更新"] },
  { category: "オプション", description: "住所・座標・誕生日などの補助業務", names: ["住所出力", "ナビ座標修正", "座標取り込み", "ナビ転送（配送）", "ナビ転送（集金）", "ナビ転送（解約）", "誕生日一覧", "誕生日台帳"] },
  { category: "本部処理", scope: "headquarters", description: "複数営業所を横断する本部専用処理", names: ["得意先検索", "得意先移管処理", "支店データ使用状況", "処理状況", "商品単価変更（全社）", "商品入替処理（全社）", "振替データ統合", "振替データ統合設定", "結果データ分割"] },
  { category: "本部資料", scope: "headquarters", description: "全営業所を集計した本部向け資料", names: ["保有件数表", "売上実績表", "商品売上月報（全社）", "商品単価別集計表（全社）", "営業分析（全社）", "新規・解約管理（全社）", "日均本数集計表（全社）"] },
  { category: "本部マスタ", scope: "headquarters", description: "会社全体で共通利用するマスタ", names: ["本支店", "担当者", "商品", "商品分類1", "商品分類2", "メーカー", "仕入れ先", "代替商品", "銀行", "解約区分", "地域別世帯数", "全体メッセージ", "休日設定", "消費税設定", "元号設定", "システム設定"] },
];

export const legacyFeatures: LegacyFeature[] = categories.flatMap((group, groupIndex) =>
  group.names.map((name, itemIndex) => ({
    id: `legacy-${groupIndex + 1}-${itemIndex + 1}`,
    category: group.category,
    name,
    scope: group.scope ?? "office",
    description: group.description,
  })),
);

export const legacyCategories = categories.map((item) => item.category);
