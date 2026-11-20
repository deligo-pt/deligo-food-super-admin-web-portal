/**
 * The in-browser product sheet (PRODUCT_BULK_AND_IMPORT_FRONTEND_GUIDE §5.2–5.3).
 *
 * Products are edited nested (product → variations → options) with every
 * cell kept as a string, so half-typed values survive. Only at submit are
 * they flattened into the import file's rows (one row per option, tied
 * together by a generated `group_key` the vendor never sees).
 *
 * `groupCsvRowsToNestedState` / `flattenNestedStateToCsvRows` follow the
 * server's parser: adjacent rows, same `group_key` (or same `name_en` plus a
 * variation), the first row's product fields win.
 *
 * No React here: the editor, a file reader and tests can all use it.
 */

import Papa from "papaparse";

export const CSV_COLUMNS = [
  "group_key", "name_en", "name_pt", "description_en", "description_pt",
  "category", "brand", "price", "discount", "discount_type", "tax_rate",
  "stock_quantity", "stock_unit", "image_url", "sdr_applicable",
  "sdr_container_count", "status", "variation_name_en", "variation_name_pt",
  "option_label_en", "option_label_pt", "option_price", "option_stock",
] as const;

export type TCsvColumn = (typeof CSV_COLUMNS)[number];
export type TCsvRow = Partial<Record<TCsvColumn, string>>;

export type TSheetOption = { labelEn: string; labelPt: string; price: string; stock: string };
export type TSheetVariation = { nameEn: string; namePt: string; options: TSheetOption[] };

/** One editable product. Every cell is a string. */
export type TSheetProduct = {
  clientId: string;
  nameEn: string;
  namePt: string;
  descriptionEn: string;
  descriptionPt: string;
  /** The category's NAME, as the file wants it. */
  category: string;
  brand: string;
  price: string;
  discount: string;
  /** "" | PERCENTAGE | FLAT */
  discountType: string;
  /** "23" */
  taxRate: string;
  stockQuantity: string;
  stockUnit: string;
  imageUrl: string;
  /** "" | true | false */
  sdrApplicable: string;
  sdrContainerCount: string;
  /** "" | ACTIVE | INACTIVE */
  status: string;
  variations: TSheetVariation[];
  /** Why the last import refused it (Fix in the editor); cleared on the first edit. */
  serverError?: string;
  /** Translation keys: what the editor leaves out by itself next time (see explainImportRow). */
  serverFixes?: string[];
};

/** The server rejects a file with more data rows than this. */
export const MAX_SHEET_ROWS = 5000;

const lower = (s?: string) => (s ?? "").trim().toLowerCase();
const isBlankRow = (row: TCsvRow) => CSV_COLUMNS.every((c) => !(row[c] ?? "").trim());

let idCounter = 0;
export const newClientId = () =>
  `p${Date.now().toString(36)}${(idCounter++).toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export const emptyProduct = (): TSheetProduct => ({
  clientId: newClientId(),
  nameEn: "",
  namePt: "",
  descriptionEn: "",
  descriptionPt: "",
  category: "",
  brand: "",
  price: "",
  discount: "",
  discountType: "",
  taxRate: "",
  stockQuantity: "",
  stockUnit: "",
  imageUrl: "",
  sdrApplicable: "",
  sdrContainerCount: "",
  status: "",
  variations: [],
});

export const emptyOption = (): TSheetOption => ({ labelEn: "", labelPt: "", price: "", stock: "" });
export const emptyVariation = (): TSheetVariation => ({ nameEn: "", namePt: "", options: [emptyOption()] });

/** A product is blank when nothing has been typed into it (blank rows are dropped at submit). */
export const isBlankProduct = (p: TSheetProduct) =>
  [
    p.nameEn, p.namePt, p.descriptionEn, p.descriptionPt, p.category, p.brand, p.price,
    p.discount, p.taxRate, p.stockQuantity, p.stockUnit, p.imageUrl, p.sdrContainerCount,
  ].every((v) => !v.trim()) && p.variations.length === 0;

export const optionCount = (p: TSheetProduct) =>
  p.variations.reduce((n, v) => n + v.options.length, 0);

/** File rows a product becomes: one per option, at least one. */
export const fileRowsOf = (p: TSheetProduct) => Math.max(1, optionCount(p));

/* ---------- file rows → nested ---------- */

/** Same rule as the server: same group_key, or same name_en + a variation, and ADJACENT. */
const groupKeyOf = (r: TCsvRow): string | null =>
  r.group_key?.trim()
    ? `g:${lower(r.group_key)}`
    : r.variation_name_en?.trim() && r.name_en?.trim()
      ? `n:${lower(r.name_en)}`
      : null;

const productFromRow = (r: TCsvRow): TSheetProduct => ({
  ...emptyProduct(),
  nameEn: r.name_en ?? "",
  namePt: r.name_pt ?? "",
  descriptionEn: r.description_en ?? "",
  descriptionPt: r.description_pt ?? "",
  category: r.category ?? "",
  brand: r.brand ?? "",
  price: r.price ?? "",
  discount: r.discount ?? "",
  discountType: (r.discount_type ?? "").toUpperCase(),
  taxRate: (r.tax_rate ?? "").replace("%", "").trim(),
  stockQuantity: r.stock_quantity ?? "",
  stockUnit: r.stock_unit ?? "",
  imageUrl: r.image_url ?? "",
  sdrApplicable: normaliseBoolean(r.sdr_applicable ?? ""),
  sdrContainerCount: r.sdr_container_count ?? "",
  status: (r.status ?? "").toUpperCase(),
});

const addOptionFromRow = (p: TSheetProduct, r: TCsvRow) => {
  const hasVariation = [
    r.variation_name_en, r.variation_name_pt, r.option_label_en,
    r.option_label_pt, r.option_price, r.option_stock,
  ].some((v) => v?.trim());
  if (!hasVariation) return;

  let variation = p.variations.find((v) => lower(v.nameEn) === lower(r.variation_name_en));
  if (!variation) {
    variation = { nameEn: r.variation_name_en ?? "", namePt: r.variation_name_pt ?? "", options: [] };
    p.variations.push(variation);
  }
  variation.options.push({
    labelEn: r.option_label_en ?? "",
    labelPt: r.option_label_pt ?? "",
    price: r.option_price ?? "",
    stock: r.option_stock ?? "",
  });
};

/** Flat file rows → one nested product per group (product fields from the group's FIRST row). */
export function groupCsvRowsToNestedState(rows: TCsvRow[]): TSheetProduct[] {
  const products: TSheetProduct[] = [];
  let current: TSheetProduct | null = null;
  let currentKey: string | null = null;

  for (const row of rows) {
    if (isBlankRow(row)) continue;
    const key = groupKeyOf(row);
    if (current && key !== null && key === currentKey) {
      addOptionFromRow(current, row);
      continue;
    }
    current = productFromRow(row);
    currentKey = key;
    addOptionFromRow(current, row);
    products.push(current);
  }
  return products;
}

/* ---------- nested → file rows ---------- */

/**
 * Nested products → flat rows. `group_key` is generated for every product
 * with options. `rowToClientId` maps the file row where each product starts
 * (header = row 1) to its grid product, since the server reports errors by
 * that row.
 */
export function flattenNestedStateToCsvRows(
  products: TSheetProduct[],
  { isRestaurant = false }: { isRestaurant?: boolean } = {},
): {
  rows: TCsvRow[];
  rowToClientId: Map<number, string>;
} {
  const rows: TCsvRow[] = [];
  const rowToClientId = new Map<number, string>();

  products.forEach((p, index) => {
    const options = p.variations.flatMap((v) => v.options.map((o) => ({ v, o })));
    const groupKey = options.length ? `P${index + 1}` : "";

    const base: TCsvRow = {
      group_key: groupKey,
      name_en: p.nameEn.trim(),
      name_pt: p.namePt.trim(),
      description_en: p.descriptionEn.trim(),
      description_pt: p.descriptionPt.trim(),
      category: p.category.trim(),
      brand: p.brand.trim(),
      // Ignored by the server once options exist; left empty then.
      price: options.length ? "" : p.price.trim(),
      discount: p.discount.trim(),
      discount_type: p.discountType,
      tax_rate: p.taxRate.trim(),
      // Restaurants don't track stock: never sent (the backend refuses > 0).
      stock_quantity: options.length || isRestaurant ? "" : p.stockQuantity.trim(),
      stock_unit: p.stockUnit.trim(),
      image_url: p.imageUrl.trim(),
      sdr_applicable: p.sdrApplicable,
      // Only with SDR on; a "0" from a spreadsheet would be refused (min 1).
      sdr_container_count: p.sdrApplicable === "true" ? p.sdrContainerCount.trim() : "",
      status: p.status,
    };

    rowToClientId.set(rows.length + 2, p.clientId);

    if (!options.length) {
      rows.push(base);
      return;
    }
    options.forEach(({ v, o }, i) => {
      const optionCells: TCsvRow = {
        variation_name_en: v.nameEn.trim(),
        variation_name_pt: v.namePt.trim(),
        option_label_en: o.labelEn.trim(),
        option_label_pt: o.labelPt.trim(),
        option_price: o.price.trim(),
        option_stock: isRestaurant ? "" : o.stock.trim(),
      };
      // First row: the whole product. Later rows: only group_key + the option.
      rows.push(i === 0 ? { ...base, ...optionCells } : { group_key: groupKey, ...optionCells });
    });
  });

  return { rows, rowToClientId };
}

/** The products as the CSV file the import endpoint takes. */
export function productsToCsv(products: TSheetProduct[], options: { isRestaurant?: boolean } = {}) {
  const { rows, rowToClientId } = flattenNestedStateToCsvRows(products, options);
  const csv = Papa.unparse({
    fields: [...CSV_COLUMNS],
    data: rows.map((r) => CSV_COLUMNS.map((c) => r[c] ?? "")),
  });
  return { csv, rowToClientId, rowCount: rows.length };
}

/* ---------- reading a file ---------- */

const normHeader = (h: string) => h.replace(/^﻿/, "").trim().toLowerCase().replace(/[\s-]+/g, "_");

/**
 * A CSV or XLSX file → rows keyed by column. XLSX: the first worksheet only,
 * like the server. SheetJS is loaded on demand, so the page doesn't carry it
 * until someone opens a spreadsheet.
 */
export async function readSheetFile(file: File): Promise<TCsvRow[]> {
  if (/\.xlsx$/i.test(file.name)) {
    const XLSX = await import("xlsx");
    const workbook = XLSX.read(await file.arrayBuffer());
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    if (!sheet) return [];
    const [head = [], ...body] = XLSX.utils.sheet_to_json<string[]>(sheet, {
      header: 1,
      raw: false,
      defval: "",
    });
    const keys = head.map((h) => normHeader(String(h ?? "")));
    return body.map((r) => Object.fromEntries(keys.map((k, i) => [k, String(r[i] ?? "").trim()])) as TCsvRow);
  }

  const { data } = Papa.parse<Record<string, string>>(await file.text(), {
    header: true,
    skipEmptyLines: true,
    delimiter: "", // , ; or tab, detected as the server does
    transformHeader: normHeader,
    transform: (v) => v.trim(),
  });
  return data as TCsvRow[];
}

/* ---------- numbers and booleans as the server reads them ---------- */

/** "12,50", "12.50", "1.234,50", "1,234.50", "€ 8" → a number; NaN when it isn't one. */
export function parseSheetNumber(raw: string): number {
  let s = raw.trim().replace(/[\s€%]/g, "");
  if (!s) return NaN;
  const lastComma = s.lastIndexOf(",");
  const lastDot = s.lastIndexOf(".");
  if (lastComma > -1 && lastDot > -1) {
    // The later separator is the decimal one.
    s = lastComma > lastDot ? s.replace(/\./g, "").replace(",", ".") : s.replace(/,/g, "");
  } else if (lastComma > -1) {
    s = s.replace(",", ".");
  }
  return /^-?\d+(\.\d+)?$/.test(s) ? Number(s) : NaN;
}

/** true/false, yes/no, y/n, 1/0, sim/não → "true" / "false"; anything else as typed. */
export function normaliseBoolean(raw: string): string {
  const v = lower(raw);
  if (["true", "yes", "y", "1", "sim", "s"].includes(v)) return "true";
  if (["false", "no", "n", "0", "não", "nao"].includes(v)) return "false";
  return raw.trim();
}

/** The cheapest option price, for the "from €x" hint; null when none parse. */
export function cheapestOption(p: TSheetProduct): number | null {
  const prices = p.variations.flatMap((v) => v.options.map((o) => parseSheetNumber(o.price))).filter((n) => !Number.isNaN(n));
  return prices.length ? Math.min(...prices) : null;
}

/* ---------- validation (mirrors the backend) ---------- */

export type TSheetContext = {
  /** Lower-cased English and Portuguese names of the vendor's active categories. */
  categoryNames: Set<string>;
  /** Active VAT percentages. */
  taxRates: Set<number>;
  isRestaurant: boolean;
};

/**
 * Field path → translation key of the problem. Paths: `nameEn`, `price`…,
 * `variations`, `v0.nameEn`, `v0.o1.price`.
 */
export type TSheetProductErrors = Record<string, string>;

const isWhole = (s: string) => /^\d+$/.test(s.trim());
const isUrl = (s: string) => {
  try {
    const url = new URL(s.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

/** Problems of one product; empty when it can be imported. */
export function validateSheetProduct(p: TSheetProduct, ctx: TSheetContext): TSheetProductErrors {
  const errors: TSheetProductErrors = {};
  const need2 = (path: string, value: string) => {
    if (!value.trim()) errors[path] = "sheet_err_required";
    else if (value.trim().length < 2) errors[path] = "sheet_err_min2";
  };

  need2("nameEn", p.nameEn);
  need2("namePt", p.namePt);

  if (!p.category.trim()) errors.category = "sheet_err_required";
  else if (!ctx.categoryNames.has(lower(p.category))) errors.category = "sheet_err_category_unknown";

  const rate = parseSheetNumber(p.taxRate);
  if (!p.taxRate.trim()) errors.taxRate = "sheet_err_required";
  else if (Number.isNaN(rate) || !ctx.taxRates.has(rate)) errors.taxRate = "sheet_err_tax_unknown";

  const options = optionCount(p);
  const price = parseSheetNumber(p.price);
  if (!options) {
    if (!p.price.trim()) errors.price = "sheet_err_price_required";
    else if (Number.isNaN(price)) errors.price = "sheet_err_number";
    else if (price <= 0) errors.price = "sheet_err_price_positive";
  }

  if (p.discount.trim()) {
    const discount = parseSheetNumber(p.discount);
    if (Number.isNaN(discount) || discount < 0) errors.discount = "sheet_err_number";
    else if (p.discountType !== "FLAT" && discount > 100) errors.discount = "sheet_err_discount_range";
  }

  // Restaurants: stock cells are hidden and never sent, so nothing to check.
  if (!ctx.isRestaurant && p.stockQuantity.trim() && !isWhole(p.stockQuantity)) {
    errors.stockQuantity = "sheet_err_whole";
  }

  if (p.imageUrl.trim() && !isUrl(p.imageUrl)) errors.imageUrl = "sheet_err_url";
  if (p.sdrApplicable === "true" && p.sdrContainerCount.trim() && (!isWhole(p.sdrContainerCount) || Number(p.sdrContainerCount) < 1)) {
    errors.sdrContainerCount = "sheet_err_whole_min1";
  }

  const variationNames = new Set<string>();
  p.variations.forEach((v, vi) => {
    need2(`v${vi}.nameEn`, v.nameEn);
    need2(`v${vi}.namePt`, v.namePt);
    if (v.nameEn.trim()) {
      // Options are grouped by the English name: two groups with one name become one.
      if (variationNames.has(lower(v.nameEn))) errors[`v${vi}.nameEn`] = "sheet_err_variation_duplicate";
      variationNames.add(lower(v.nameEn));
    }
    if (!v.options.length) errors[`v${vi}`] = "sheet_err_options_required";

    const labels = new Set<string>();
    v.options.forEach((o, oi) => {
      const at = `v${vi}.o${oi}`;
      need2(`${at}.labelEn`, o.labelEn);
      need2(`${at}.labelPt`, o.labelPt);
      if (o.labelEn.trim()) {
        if (labels.has(lower(o.labelEn))) errors[`${at}.labelEn`] = "sheet_err_option_duplicate";
        labels.add(lower(o.labelEn));
      }
      const optionPrice = parseSheetNumber(o.price);
      if (!o.price.trim()) errors[`${at}.price`] = "sheet_err_required";
      else if (Number.isNaN(optionPrice) || optionPrice < 0) errors[`${at}.price`] = "sheet_err_option_price";
      if (!ctx.isRestaurant && o.stock.trim() && !isWhole(o.stock)) errors[`${at}.stock`] = "sheet_err_whole";
    });
  });

  return errors;
}

/** Problems of every product, keyed by `clientId` (only products that have some). */
export function validateSheet(products: TSheetProduct[], ctx: TSheetContext): Map<string, TSheetProductErrors> {
  const result = new Map<string, TSheetProductErrors>();
  const names = new Map<string, number>();
  for (const p of products) {
    const key = lower(p.nameEn);
    if (key) names.set(key, (names.get(key) ?? 0) + 1);
  }
  for (const p of products) {
    const errors = validateSheetProduct(p, ctx);
    // The import treats a repeated name as a duplicate product.
    if (!errors.nameEn && (names.get(lower(p.nameEn)) ?? 0) > 1) errors.nameEn = "sheet_err_name_twice";
    if (Object.keys(errors).length) result.set(p.clientId, errors);
  }
  return result;
}

/* ---------- pasting from Excel ---------- */

/** The row's typed cells, left to right, as a paste fills them. */
type TPasteColumn =
  | "nameEn" | "namePt" | "category" | "taxRate" | "price" | "discount" | "stockQuantity" | "status";

export const pasteColumns = (isRestaurant: boolean): TPasteColumn[] => [
  "nameEn", "namePt", "category", "taxRate", "price", "discount",
  ...(isRestaurant ? [] : (["stockQuantity"] as const)),
  "status",
];

/** A block copied from Excel / Sheets: rows split on newlines, cells on tabs. */
export const splitPastedText = (text: string) =>
  text
    .replace(/\r\n?/g, "\n")
    .replace(/\n+$/, "")
    .split("\n")
    .map((line) => line.split("\t").map((cell) => cell.trim()));

const pasteValue = (column: TPasteColumn, raw: string) => {
  if (column === "taxRate") return raw.replace("%", "").trim();
  if (column === "status") {
    const v = raw.trim().toLowerCase();
    if (!v) return "";
    return ["inactive", "inativo", "inativa", "no", "não", "false", "0"].includes(v) ? "INACTIVE" : "ACTIVE";
  }
  return raw;
};

/**
 * Pastes a block into the grid. A block that starts with the template's
 * header row (`name_en`…) is read like a file and added as new products.
 * Otherwise it fills cells from the one pasted into, rightwards and
 * downwards, adding products when it runs past the last one.
 * Returns the new list, and how many products the paste touched.
 */
export function pasteIntoSheet(
  products: TSheetProduct[],
  at: { clientId: string; column: string },
  text: string,
  isRestaurant: boolean,
): { products: TSheetProduct[]; changed: string[] } {
  const lines = splitPastedText(text);
  if (!lines.length) return { products, changed: [] };

  const header = lines[0].map((h) => normHeader(h));
  if (header.includes("name_en") || header.includes("name_pt")) {
    const rows = lines.slice(1).map((cells) => Object.fromEntries(header.map((h, i) => [h, cells[i] ?? ""])) as TCsvRow);
    const added = groupCsvRowsToNestedState(rows);
    return {
      products: [...products.filter((p) => !isBlankProduct(p)), ...added],
      changed: added.map((p) => p.clientId),
    };
  }

  const columns = pasteColumns(isRestaurant);
  const startCol = Math.max(0, columns.indexOf(at.column as TPasteColumn));
  const startRow = Math.max(0, products.findIndex((p) => p.clientId === at.clientId));
  const next = [...products];
  const changed: string[] = [];

  lines.forEach((cells, li) => {
    const index = startRow + li;
    if (index >= next.length) next.push(emptyProduct());
    const product = { ...next[index] };
    cells.forEach((cell, ci) => {
      const column = columns[startCol + ci];
      if (column) product[column] = pasteValue(column, cell);
    });
    next[index] = product;
    changed.push(product.clientId);
  });
  return { products: next, changed };
}

/* ---------- fixing failed rows ---------- */

/**
 * Rebuilds the product an import refused, from its stored rows
 * (`raw` = first row, `extraRows` = the rest of its options).
 */
export function productFromImportError(error: { raw: Record<string, string>; extraRows?: Record<string, string>[] }) {
  const rows = [error.raw, ...(error.extraRows ?? [])].map(
    (row) => Object.fromEntries(Object.entries(row ?? {}).map(([k, v]) => [normHeader(k), v == null ? "" : String(v)])) as TCsvRow,
  );
  return groupCsvRowsToNestedState(rows)[0] ?? null;
}

/**
 * Cells of a refused product that the editor drops by itself when it sends
 * the list again (they have no box on screen). Returned as translation keys,
 * so the vendor reads the real cause instead of "some fields are invalid".
 */
export function explainImportRow(
  error: { raw: Record<string, string>; extraRows?: Record<string, string>[] },
  isRestaurant: boolean,
): string[] {
  const rows = [error.raw, ...(error.extraRows ?? [])].map((row) =>
    Object.fromEntries(Object.entries(row ?? {}).map(([k, v]) => [normHeader(k), v == null ? "" : String(v).trim()])),
  );
  const first = rows[0] ?? {};
  const fixes: string[] = [];
  if (normaliseBoolean(first.sdr_applicable ?? "") !== "true" && (first.sdr_container_count ?? "") !== "") {
    fixes.push("sheet_fix_sdr_count_removed");
  }
  if (isRestaurant && rows.some((r) => parseSheetNumber(r.stock_quantity ?? "") > 0 || parseSheetNumber(r.option_stock ?? "") > 0)) {
    fixes.push("sheet_fix_stock_removed");
  }
  return fixes;
}

/* ---------- cleaning an uploaded file ---------- */

export type TFileCleanup = { sdrCounts: number; stocks: number };

/**
 * Drops, from a vendor's own file, the cells the backend refuses but that
 * carry no meaning: an SDR container count while SDR is off, and stock for
 * a restaurant (the same cells the editor leaves out). Every row stays where
 * it was, so the server's row numbers still match the vendor's file. Returns
 * null when there is nothing to drop — the file is then sent untouched.
 */
export async function cleanImportFile(
  file: File,
  isRestaurant: boolean,
): Promise<{ file: File; cleanup: TFileCleanup } | null> {
  const rows = await readSheetFile(file);
  const cleanup: TFileCleanup = { sdrCounts: 0, stocks: 0 };
  let groupSdr = "";
  let currentKey: string | null = null;

  const cleaned = rows.map((row) => {
    const r: Record<string, string> = { ...(row as Record<string, string>) };
    // Option rows inherit the product's SDR setting from its first row.
    const key = groupKeyOf(row);
    if (!(key !== null && key === currentKey)) groupSdr = normaliseBoolean(r.sdr_applicable ?? "");
    currentKey = key;

    if (groupSdr !== "true" && (r.sdr_container_count ?? "").trim() !== "") {
      r.sdr_container_count = "";
      cleanup.sdrCounts += 1;
    }
    if (isRestaurant) {
      for (const col of ["stock_quantity", "option_stock"] as const) {
        if ((r[col] ?? "").trim() !== "") {
          r[col] = "";
          cleanup.stocks += 1;
        }
      }
    }
    return r;
  });

  if (!cleanup.sdrCounts && !cleanup.stocks) return null;

  const fields = Array.from(new Set(cleaned.flatMap((r) => Object.keys(r)))).filter(Boolean);
  const csv = Papa.unparse({ fields, data: cleaned.map((r) => fields.map((f) => r[f] ?? "")) });
  const name = file.name.replace(/\.(xlsx|csv)$/i, "") + ".csv";
  return { file: new File([csv], name, { type: "text/csv" }), cleanup };
}
