export type ImportedCustomer = {
  id: string;
  name: string;
  kana: string;
  delivery: string;
  payment: string;
  started: string;
  birthday: string;
  products: string;
  address: string;
  phone: string;
};

export type CustomerCsvResult = {
  customers: ImportedCustomer[];
  sourceRows: number;
  errors: string[];
};

const requiredHeaders = ["顧客コード", "顧客名", "顧客住所", "コース名", "商品名称"];
const weekdays = ["月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日", "日曜日"];

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === '"') {
      if (quoted && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      row.push(field);
      field = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[index + 1] === "\n") index += 1;
      row.push(field);
      if (row.some((value) => value !== "")) rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  row.push(field);
  if (row.some((value) => value !== "")) rows.push(row);
  return rows;
}

function decodeCsv(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  const utf8 = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  const replacementCount = (utf8.match(/�/g) ?? []).length;
  if (replacementCount === 0) return utf8.replace(/^\uFEFF/, "");
  return new TextDecoder("shift_jis").decode(bytes).replace(/^\uFEFF/, "");
}

function quantitySummary(record: Record<string, string>) {
  const quantities = weekdays
    .map((day) => ({ day: day.slice(0, 1), quantity: Number(record[day] || 0) }))
    .filter(({ quantity }) => Number.isFinite(quantity) && quantity > 0)
    .map(({ day, quantity }) => `${day}${quantity}`);
  return quantities.length ? quantities.join("・") : "数量未設定";
}

export function importCustomerCsv(buffer: ArrayBuffer): CustomerCsvResult {
  const rows = parseCsv(decodeCsv(buffer));
  if (rows.length < 2) return { customers: [], sourceRows: 0, errors: ["データ行がありません。"] };

  const headers = rows[0].map((header) => header.trim());
  const missing = requiredHeaders.filter((header) => !headers.includes(header));
  if (missing.length) {
    return { customers: [], sourceRows: rows.length - 1, errors: [`必須列がありません: ${missing.join("、")}`] };
  }

  const grouped = new Map<string, ImportedCustomer & { productList: string[] }>();
  const errors: string[] = [];

  rows.slice(1).forEach((values, rowIndex) => {
    const record = Object.fromEntries(headers.map((header, index) => [header, (values[index] ?? "").trim()]));
    const id = record["顧客コード"];
    const name = record["顧客名"];
    if (!id || !name) {
      errors.push(`${rowIndex + 2}行目: 顧客コードまたは顧客名が空です。`);
      return;
    }

    const product = `${record["商品名称"] || "商品名未設定"}（${quantitySummary(record)}）`;
    const existing = grouped.get(id);
    if (existing) {
      if (!existing.productList.includes(product)) existing.productList.push(product);
      return;
    }

    grouped.set(id, {
      id,
      name,
      kana: "",
      delivery: [record["コース名"], record["設定配達順"] ? `${record["設定配達順"]}番` : ""].filter(Boolean).join(" "),
      payment: record["回収種別"] || "未設定",
      started: record["指定基準日"] || "—",
      birthday: "—",
      products: "",
      address: record["顧客住所"],
      phone: record["顧客電話番号"],
      productList: [product],
    });
  });

  const customers = Array.from(grouped.values()).map(({ productList, ...customer }) => ({
    ...customer,
    products: productList.join(" / "),
  }));
  return { customers, sourceRows: rows.length - 1, errors };
}
