export const yamadaSeptemberInvoiceLines = [
  { product: "有明牛乳 900ml", quantity: 20, unitPrice: 280 },
  { product: "のむヨーグルト", quantity: 7, unitPrice: 160 },
  { product: "宅配専用コーヒー", quantity: 6, unitPrice: 190 },
];

export const yamadaSeptemberTotal = yamadaSeptemberInvoiceLines.reduce(
  (sum, line) => sum + line.quantity * line.unitPrice,
  0,
);

export const yamadaAugustInvoiceLines = [
  { product: "有明牛乳 900ml", quantity: 22, unitPrice: 280 },
  { product: "のむヨーグルト", quantity: 8, unitPrice: 160 },
  { product: "宅配専用コーヒー", quantity: 6, unitPrice: 190 },
];

export const yamadaAugustTotal = yamadaAugustInvoiceLines.reduce(
  (sum, line) => sum + line.quantity * line.unitPrice,
  0,
);
