export type DemoRole = "headquarters" | "office" | "sales" | "delivery";

export type DemoUser = {
  name: string;
  email: string;
  role: DemoRole;
  roleLabel: string;
  office: string;
};

export const demoRoles: Array<{
  value: DemoRole;
  label: string;
  description: string;
  destination: string;
}> = [
  {
    value: "headquarters",
    label: "本部",
    description: "全営業所の状況を確認",
    destination: "/dashboard",
  },
  {
    value: "office",
    label: "営業所事務",
    description: "顧客・配送・注文を管理",
    destination: "/dashboard",
  },
  {
    value: "sales",
    label: "営業スタッフ",
    description: "営業活動と担当顧客を確認",
    destination: "/sales",
  },
  {
    value: "delivery",
    label: "配達スタッフ",
    description: "今日の担当配送を確認",
    destination: "/mobile/deliveries",
  },
];

export const demoCustomers = [
  {
    id: "C-10482",
    name: "山田 花子",
    kana: "ヤマダ ハナコ",
    office: "本社営業所",
    area: "江東区有明",
    product: "有明牛乳 900ml",
    status: "契約中",
    delivery: "月・木",
    sales: "佐藤 美咲",
    phone: "090-1234-5678",
  },
  {
    id: "C-10479",
    name: "鈴木 一郎",
    kana: "スズキ イチロウ",
    office: "吉野ヶ里営業所",
    area: "江東区東雲",
    product: "のむヨーグルト",
    status: "契約中",
    delivery: "火・金",
    sales: "田中 悠斗",
    phone: "080-2345-6789",
  },
  {
    id: "C-10461",
    name: "高橋 悦子",
    kana: "タカハシ エツコ",
    office: "本社営業所",
    area: "江東区豊洲",
    product: "低脂肪乳 900ml",
    status: "一時休止",
    delivery: "水・土",
    sales: "佐藤 美咲",
    phone: "03-4567-8901",
  },
  {
    id: "C-10435",
    name: "伊藤 健二",
    kana: "イトウ ケンジ",
    office: "吉野ヶ里営業所",
    area: "中央区晴海",
    product: "有明牛乳 900ml",
    status: "契約中",
    delivery: "月・木",
    sales: "田中 悠斗",
    phone: "090-3456-7890",
  },
  {
    id: "C-10422",
    name: "渡辺 直子",
    kana: "ワタナベ ナオコ",
    office: "本社営業所",
    area: "中央区勝どき",
    product: "宅配専用コーヒー",
    status: "確認待ち",
    delivery: "火・金",
    sales: "佐藤 美咲",
    phone: "080-4567-8901",
  },
];

export const demoDeliveries = [
  { id: "D-301", order: 1, customer: "山田 花子", address: "江東区有明2-1-8", items: "有明牛乳 × 2", status: "completed" },
  { id: "D-302", order: 2, customer: "佐々木 正人", address: "江東区有明1-4-2", items: "低脂肪乳 × 1", status: "completed" },
  { id: "D-303", order: 3, customer: "木村 洋子", address: "江東区東雲1-9-15", items: "のむヨーグルト × 4", status: "delivering" },
  { id: "D-304", order: 4, customer: "鈴木 一郎", address: "江東区東雲2-3-12", items: "有明牛乳 × 1", status: "pending" },
  { id: "D-305", order: 5, customer: "伊藤 健二", address: "中央区晴海3-10-1", items: "有明牛乳 × 2", status: "pending" },
];

export const demoOrders = [
  { id: "O-240805-18", customer: "山田 花子", channel: "LINE", item: "のむヨーグルト 6本セット", amount: 1680, status: "確認待ち", date: "今日 10:32" },
  { id: "O-240805-17", customer: "渡辺 直子", channel: "電話", item: "有明牛乳 900ml × 2", amount: 920, status: "確定", date: "今日 09:18" },
  { id: "O-240805-16", customer: "鈴木 一郎", channel: "管理画面", item: "宅配専用コーヒー × 3", amount: 780, status: "準備中", date: "昨日 16:45" },
  { id: "O-240805-15", customer: "高橋 悦子", channel: "LINE", item: "低脂肪乳 900ml × 1", amount: 430, status: "配送中", date: "昨日 14:10" },
];

export function getDemoDestination(role: DemoRole) {
  return demoRoles.find((item) => item.value === role)?.destination ?? "/dashboard";
}

export function createDemoUser(email: string, role: DemoRole): DemoUser {
  const roleData = demoRoles.find((item) => item.value === role) ?? demoRoles[0];
  return {
    name: role === "delivery" ? "中村 大輔" : role === "sales" ? "佐藤 美咲" : "山本 由美",
    email,
    role,
    roleLabel: roleData.label,
    office: role === "headquarters" ? "本部" : "有明営業所",
  };
}
