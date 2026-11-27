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
  /**
   * The language its texts are written in, when known (a file read with a
   * picked language, or after the converter ran). The grid shows each text
   * in this language. Missing: English first.
   */
  lang?: TSheetLang;
  /**
   * Texts typed or pasted in the grid, language unknown: Import detects it
   * and fills the other one (`/api/translate/detect`, plan §12).
   */
  detect?: boolean;
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

/**
 * Same rule as the server: same group_key, or same name + a variation, and
 * ADJACENT. The server only looks at `name_en`; a one-language Portuguese
 * file (Import v2) has only `name_pt`, so that is used when English is empty.
 * The editor always sends its own group_key, so the server never sees the
 * difference.
 */
const groupKeyOf = (r: TCsvRow): string | null => {
  if (r.group_key?.trim()) return `g:${lower(r.group_key)}`;
  const name = r.name_en?.trim() || r.name_pt?.trim();
  const variation = r.variation_name_en?.trim() || r.variation_name_pt?.trim();
  return name && variation ? `n:${lower(name)}` : null;
};

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

  // Options are put into groups by the variation's name: English when the
  // row has it (as the server does), else Portuguese.
  const byEnglish = !!r.variation_name_en?.trim() || !r.variation_name_pt?.trim();
  let variation = p.variations.find((v) =>
    byEnglish ? lower(v.nameEn) === lower(r.variation_name_en) : lower(v.namePt) === lower(r.variation_name_pt),
  );
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

/**
 * The key a two-language text is matched by (duplicates, grouping): the
 * English text, or the Portuguese one when English is empty.
 */
const textKey = (en: string, pt: string) => lower(en.trim() || pt.trim());

/** The editor path of the language that is filled (`nameEn`, else `namePt`). */
const filledPath = (base: string, en: string) => `${base}${en.trim() ? "En" : "Pt"}`;

/** Problems of one product; empty when it can be imported. */
export function validateSheetProduct(p: TSheetProduct, ctx: TSheetContext): TSheetProductErrors {
  const errors: TSheetProductErrors = {};
  /**
   * Names and labels, like the import file: one language is enough (the
   * other is translated when the vendor imports). Both empty → both cells
   * marked; a filled one needs 2+ characters.
   */
  const needOne = (base: string, en: string, pt: string) => {
    if (!en.trim() && !pt.trim()) {
      errors[`${base}En`] = "sheet_err_name_one";
      errors[`${base}Pt`] = "sheet_err_name_one";
      return;
    }
    if (en.trim() && en.trim().length < 2) errors[`${base}En`] = "sheet_err_min2";
    if (pt.trim() && pt.trim().length < 2) errors[`${base}Pt`] = "sheet_err_min2";
  };

  needOne("name", p.nameEn, p.namePt);

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
    needOne(`v${vi}.name`, v.nameEn, v.namePt);
    const variationKey = textKey(v.nameEn, v.namePt);
    if (variationKey) {
      // Options are grouped by the name: two groups with one name become one.
      if (variationNames.has(variationKey)) errors[filledPath(`v${vi}.name`, v.nameEn)] = "sheet_err_variation_duplicate";
      variationNames.add(variationKey);
    }
    if (!v.options.length) errors[`v${vi}`] = "sheet_err_options_required";

    const labels = new Set<string>();
    v.options.forEach((o, oi) => {
      const at = `v${vi}.o${oi}`;
      needOne(`${at}.label`, o.labelEn, o.labelPt);
      const labelKey = textKey(o.labelEn, o.labelPt);
      if (labelKey) {
        if (labels.has(labelKey)) errors[filledPath(`${at}.label`, o.labelEn)] = "sheet_err_option_duplicate";
        labels.add(labelKey);
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
    const key = textKey(p.nameEn, p.namePt);
    if (key) names.set(key, (names.get(key) ?? 0) + 1);
  }
  for (const p of products) {
    const errors = validateSheetProduct(p, ctx);
    // The import treats a repeated name as a duplicate product.
    const path = filledPath("name", p.nameEn);
    if (!errors[path] && (names.get(textKey(p.nameEn, p.namePt)) ?? 0) > 1) errors[path] = "sheet_err_name_twice";
    if (Object.keys(errors).length) result.set(p.clientId, errors);
  }
  return result;
}

/* ---------- one text box per text (the grid) ---------- */

/**
 * The grid has ONE box per text (name, description, group name, option
 * label), like the import file. It shows the text in the product's language
 * (`lang`), else whichever side is written.
 */
export const shownText = (en: string, pt: string, lang?: TSheetLang) => (lang === "pt" ? pt || en : en || pt);

/** The side a text typed into the grid is kept in, until Import converts it. */
export const typedSide = (lang?: TSheetLang): "En" | "Pt" => (lang === "pt" ? "Pt" : "En");

/**
 * A text typed into the grid at `base` (`name`, `description`): kept in the
 * product's language side, the old translation cleared (it no longer
 * matches), and the product marked for detection on Import.
 */
export function writeText(p: TSheetProduct, base: "name" | "description", value: string): TSheetProduct {
  const side = typedSide(p.lang);
  const other = side === "En" ? "Pt" : "En";
  return { ...p, [`${base}${side}`]: value, [`${base}${other}`]: "", detect: true };
}

/* ---------- pasting from Excel ---------- */

/** The row's typed cells, left to right, as a paste fills them. */
type TPasteColumn = "name" | "category" | "taxRate" | "price" | "discount" | "stockQuantity";

export const pasteColumns = (isRestaurant: boolean): TPasteColumn[] => [
  "name", "category", "taxRate", "price", "discount",
  ...(isRestaurant ? [] : (["stockQuantity"] as const)),
];

/** A block copied from Excel / Sheets: rows split on newlines, cells on tabs. */
export const splitPastedText = (text: string) =>
  text
    .replace(/\r\n?/g, "\n")
    .replace(/\n+$/, "")
    .split("\n")
    .map((line) => line.split("\t").map((cell) => cell.trim()));

const pasteValue = (column: TPasteColumn, raw: string) => (column === "taxRate" ? raw.replace("%", "").trim() : raw);

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
    let typed = product;
    cells.forEach((cell, ci) => {
      const column = columns[startCol + ci];
      if (column === "name") typed = { ...writeText(typed, "name", cell) };
      else if (column) typed[column] = pasteValue(column, cell);
    });
    next[index] = typed;
    changed.push(typed.clientId);
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

/* ---------- text cells by editor path ---------- */

const TEXT_PATH = /^(?:v(\d+)\.(?:o(\d+)\.)?)?(name|description|label)(En|Pt)$/;

/**
 * Reads a two-language text cell by its editor path (`nameEn`,
 * `descriptionPt`, `v0.namePt`, `v0.o1.labelEn`); `undefined` when the path
 * does not point at an existing cell.
 */
export function sheetText(p: TSheetProduct, path: string): string | undefined {
  const m = TEXT_PATH.exec(path);
  if (!m) return undefined;
  const [, vi, oi, kind, side] = m;
  if (vi === undefined) {
    if (kind === "label") return undefined;
    return p[`${kind as "name" | "description"}${side as "En" | "Pt"}`];
  }
  const v = p.variations[Number(vi)];
  if (!v) return undefined;
  if (oi === undefined) return kind === "name" ? v[`name${side as "En" | "Pt"}`] : undefined;
  const o = v.options[Number(oi)];
  return o && kind === "label" ? o[`label${side as "En" | "Pt"}`] : undefined;
}

/** The same path in the other language: `namePt` ↔ `nameEn`. */
export const otherLanguagePath = (path: string) =>
  path.endsWith("Pt") ? `${path.slice(0, -2)}En` : `${path.slice(0, -2)}Pt`;

/** A copy of `p` with one text cell (by editor path) set; `p` itself when the path is unknown. */
export function withSheetText(p: TSheetProduct, path: string, value: string): TSheetProduct {
  const m = TEXT_PATH.exec(path);
  if (!m || sheetText(p, path) === undefined) return p;
  const [, vi, oi, kind, side] = m;
  if (vi === undefined) return { ...p, [`${kind}${side}`]: value };
  return {
    ...p,
    variations: p.variations.map((v, i) => {
      if (i !== Number(vi)) return v;
      if (oi === undefined) return { ...v, [`name${side}`]: value };
      return { ...v, options: v.options.map((o, j) => (j === Number(oi) ? { ...o, [`label${side}`]: value } : o)) };
    }),
  };
}

/* ---------- one-language texts (translated on Import) ---------- */

/** Editor paths of every two-language text of a product (`name`, `v0.name`, `v0.o1.label`), without the language. */
export function textBases(p: TSheetProduct): string[] {
  const bases = ["name", "description"];
  p.variations.forEach((v, vi) => {
    bases.push(`v${vi}.name`);
    v.options.forEach((_, oi) => bases.push(`v${vi}.o${oi}.label`));
  });
  return bases;
}

/**
 * Texts written in only one language — what Import translates first. Each is
 * the editor path of the EMPTY side (`namePt`, `v0.o1.labelEn`).
 */
export function oneLanguageTexts(products: TSheetProduct[]): { clientId: string; field: string }[] {
  const out: { clientId: string; field: string }[] = [];
  for (const p of products) {
    for (const base of textBases(p)) {
      const en = (sheetText(p, `${base}En`) ?? "").trim();
      const pt = (sheetText(p, `${base}Pt`) ?? "").trim();
      if (!!en !== !!pt) out.push({ clientId: p.clientId, field: `${base}${en ? "Pt" : "En"}` });
    }
  }
  return out;
}

/**
 * Fills every one-language text with the same text in the other language —
 * the fallback when automatic translation is not available. Returns copies.
 */
export function fillOtherLanguage(products: TSheetProduct[]): { products: TSheetProduct[]; filled: number } {
  let filled = 0;
  const next = products.map((p) =>
    textBases(p).reduce((product, base) => {
      const en = (sheetText(product, `${base}En`) ?? "").trim();
      const pt = (sheetText(product, `${base}Pt`) ?? "").trim();
      if (!!en === !!pt) return product;
      filled++;
      return en ? withSheetText(product, `${base}Pt`, en) : withSheetText(product, `${base}En`, pt);
    }, p),
  );
  return { products: next, filled };
}

/**
 * Settings the review applies to every product at once ("Set for all").
 * `undefined` leaves that setting as it is.
 */
export function applyToAllProducts(
  products: TSheetProduct[],
  change: { status?: "ACTIVE" | "INACTIVE"; sdr?: { on: false } | { on: true; containers: string } },
): TSheetProduct[] {
  return products.map((p) => {
    if (isBlankProduct(p)) return p;
    let next = p;
    if (change.status) next = { ...next, status: change.status };
    if (change.sdr) {
      next = change.sdr.on
        ? { ...next, sdrApplicable: "true", sdrContainerCount: change.sdr.containers.trim() }
        : { ...next, sdrApplicable: "false", sdrContainerCount: "" };
    }
    return next;
  });
}

/* ---------- Import v2: one-language files ---------- */

export type TSheetLang = "en" | "pt";

/** Text columns of the simple file, without a language: the vendor picks it. */
const PLAIN_TEXT_COLUMNS = {
  name: ["name_en", "name_pt"],
  description: ["description_en", "description_pt"],
  variation_name: ["variation_name_en", "variation_name_pt"],
  option_label: ["option_label_en", "option_label_pt"],
} as const satisfies Record<string, readonly [TCsvColumn, TCsvColumn]>;

/**
 * Columns of the simple template (plan §9.3). No `_pt` / `_en`, no status,
 * no SDR: the language comes from the picker, the rest from the review.
 */
export const simpleTemplateColumns = (isRestaurant: boolean): string[] => [
  "group_key", "name", "description", "category", "tax_rate", "price",
  "discount", "discount_type", "brand", "image_url",
  ...(isRestaurant ? [] : ["stock_quantity", "stock_unit"]),
  "variation_name", "option_label", "option_price",
  ...(isRestaurant ? [] : ["option_stock"]),
];

/**
 * Puts each plain column (`name`, `description`…) into the chosen language's
 * column. A filled `name_en` / `name_pt` (an old full-template file) wins
 * over the plain one, so nothing the vendor wrote is overwritten.
 */
export function localiseSimpleRows(rows: Record<string, string>[], lang: TSheetLang): TCsvRow[] {
  return rows.map((row) => {
    const out: Record<string, string> = { ...row };
    for (const [plain, [en, pt]] of Object.entries(PLAIN_TEXT_COLUMNS)) {
      const value = (out[plain] ?? "").trim();
      delete out[plain];
      const target = lang === "en" ? en : pt;
      if (value && !(out[target] ?? "").trim()) out[target] = value;
    }
    return out as TCsvRow;
  });
}

/** Columns a file must have to be read: a name (any language), category, tax rate. */
export function missingSimpleColumns(columns: string[]): string[] {
  const has = new Set(columns.map((c) => normHeader(c)));
  const missing: string[] = [];
  if (!has.has("name") && !has.has("name_en") && !has.has("name_pt")) missing.push("name");
  if (!has.has("category")) missing.push("category");
  if (!has.has("tax_rate")) missing.push("tax_rate");
  return missing;
}

/**
 * The values a product gets when the file leaves them out: ACTIVE, SDR off
 * (no container count), and no stock for a restaurant. A status or SDR the
 * file does carry is kept. The vendor changes any of it in the review.
 */
export function applyImportDefaults(
  products: TSheetProduct[],
  { isRestaurant = false }: { isRestaurant?: boolean } = {},
): TSheetProduct[] {
  return products.map((p) => {
    const sdrOn = p.sdrApplicable === "true";
    return {
      ...p,
      status: p.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
      sdrApplicable: sdrOn ? "true" : "false",
      sdrContainerCount: sdrOn ? p.sdrContainerCount : "",
      stockQuantity: isRestaurant ? "" : p.stockQuantity,
      stockUnit: isRestaurant ? "" : p.stockUnit,
      variations: isRestaurant
        ? p.variations.map((v) => ({ ...v, options: v.options.map((o) => ({ ...o, stock: "" })) }))
        : p.variations,
    };
  });
}

export type TSimpleSheet = {
  products: TSheetProduct[];
  /** Data rows in the file (blank rows not counted). */
  rowCount: number;
  /** Required columns the file lacks; when any, `products` is empty. */
  missingColumns: string[];
};

/**
 * Initial import, step 1: a vendor's file → products with defaults, the text
 * in `lang`. Nothing is translated or sent here.
 */
export async function readSimpleSheet(
  file: File,
  lang: TSheetLang,
  { isRestaurant = false }: { isRestaurant?: boolean } = {},
): Promise<TSimpleSheet> {
  const raw = (await readSheetFile(file)) as Record<string, string>[];
  if (!raw.length) return { products: [], rowCount: 0, missingColumns: [] };
  const missingColumns = missingSimpleColumns(Object.keys(raw[0]));
  if (missingColumns.length) return { products: [], rowCount: raw.length, missingColumns };

  const rows = localiseSimpleRows(raw, lang).filter((r) => !isBlankRow(r));
  return {
    products: applyImportDefaults(groupCsvRowsToNestedState(rows), { isRestaurant }).map((p) => ({ ...p, lang })),
    rowCount: rows.length,
    missingColumns: [],
  };
}

const TEMPLATE_EXAMPLES = {
  en: {
    drink: "Orange juice", drinkDescription: "Freshly squeezed",
    pizza: "Pizza Margherita", pizzaDescription: "Tomato and mozzarella",
    size: "Size", medium: "Medium", large: "Large", category: "Drinks",
  },
  pt: {
    drink: "Sumo de laranja", drinkDescription: "Espremido na hora",
    pizza: "Pizza Margherita", pizzaDescription: "Tomate e mozzarella",
    size: "Tamanho", medium: "Média", large: "Grande", category: "Bebidas",
  },
} as const;

/**
 * The simple template (plan §9.3) in the vendor's language: a plain product
 * and one with sizes, using one of the vendor's own categories and VAT rates
 * so the example imports as it is. Starts with a BOM so Excel reads
 * accents correctly.
 */
export function simpleTemplateCsv({
  lang,
  isRestaurant,
  category,
  taxRate,
}: {
  lang: TSheetLang;
  isRestaurant: boolean;
  category?: string;
  taxRate?: number;
}): string {
  const x = TEMPLATE_EXAMPLES[lang];
  const cat = category?.trim() || x.category;
  const tax = String(taxRate ?? 23);
  const rows: Record<string, string>[] = [
    { name: x.drink, description: x.drinkDescription, category: cat, tax_rate: tax, price: "3.50", stock_quantity: "20" },
    { group_key: "PIZZA-1", name: x.pizza, description: x.pizzaDescription, category: cat, tax_rate: tax, variation_name: x.size, option_label: x.medium, option_price: "9.50", option_stock: "10" },
    { group_key: "PIZZA-1", variation_name: x.size, option_label: x.large, option_price: "12.00", option_stock: "10" },
  ];
  const fields = simpleTemplateColumns(isRestaurant);
  return "\uFEFF" + Papa.unparse({ fields, data: rows.map((r) => fields.map((f) => r[f] ?? "")) });
}
