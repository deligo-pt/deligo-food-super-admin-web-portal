/**
 * Import v2 (plan §9): a one-language file becomes products with defaults
 * and both languages, before anything is sent to the server.
 *
 *   pnpm verify:sheet-import   (super admin copy, plan.md §9.5)
 *
 * No token, no network: `/api/translate` is a stub.
 */

import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");

const sheet = await import(join(root, "utils/productSheet.ts"));
const { translateSheet, batchTexts, TRANSLATE_MAX_TEXTS } = await import(join(root, "utils/sheetTranslate.ts"));
const { translationErrorCode } = await import(join(root, "utils/translation/requestTranslations.ts"));

let passed = 0;
let failed = 0;
function check(name, condition, detail) {
  if (condition) {
    passed++;
    console.log(`  PASS  ${name}`);
  } else {
    failed++;
    console.log(`  FAIL  ${name}${detail === undefined ? "" : `  → ${detail}`}`);
  }
}
const section = (title) => console.log(`\n${title}`);
const J = JSON.stringify;
const csvFile = (text, name = "products.csv") => new File([text], name, { type: "text/csv" });

// A translator stub: "X" → "X [pt]" (or "[en]"), recording every request.
function stub(answer) {
  const calls = [];
  const send = async (request) => {
    calls.push(request);
    if (answer) return answer(request, calls.length);
    return { ok: true, translations: request.texts.map((t) => `${t} [${request.targetLang.toLowerCase()}]`) };
  };
  return { send, calls };
}

const EN_FILE = [
  "group_key,name,description,category,tax_rate,price,variation_name,option_label,option_price",
  ",Coca-Cola 330ml,,Drinks,23,1.50,,,",
  "PIZZA-01,Margherita,Tomato and mozzarella,Pizzas,13,,Size,Medium,9.50",
  "PIZZA-01,,,,,,Size,Large,12.00",
  ",Pepperoni,,Pizzas,13,,Size,Large,13.00",
  ",Pepperoni,,Pizzas,13,,Size,Medium,10.00",
].join("\n");

section("1. Reading a one-language file");
{
  const read = await sheet.readSimpleSheet(csvFile(EN_FILE), "en", { isRestaurant: true });
  const [cola, margherita, pepperoni] = read.products;
  check("three products (group_key and same-name rows merge)", read.products.length === 3, read.products.length);
  check("rows counted", read.rowCount === 5, read.rowCount);
  check("name went to English", cola.nameEn === "Coca-Cola 330ml" && cola.namePt === "", J([cola.nameEn, cola.namePt]));
  check("description went to English", margherita.descriptionEn === "Tomato and mozzarella");
  check("variation + options in English", margherita.variations[0].nameEn === "Size" && margherita.variations[0].options.map((o) => o.labelEn).join() === "Medium,Large");
  check("no group_key: adjacent same name + variation merge", pepperoni.variations[0].options.length === 2);
  check("status defaults to ACTIVE", read.products.every((p) => p.status === "ACTIVE"));
  check("SDR defaults to off", read.products.every((p) => p.sdrApplicable === "false" && p.sdrContainerCount === ""));
}
{
  const PT_FILE = [
    "name,category,tax_rate,price,variation_name,option_label,option_price",
    "Bitoque,Pratos,13,,Tamanho,Pequeno,8",
    "Bitoque,Pratos,13,,Tamanho,Grande,11",
  ].join("\n");
  const read = await sheet.readSimpleSheet(csvFile(PT_FILE), "pt");
  const [p] = read.products;
  check("PT file: one product (grouped by the Portuguese name)", read.products.length === 1, read.products.length);
  check("PT file: text in Portuguese, English empty", p.namePt === "Bitoque" && p.nameEn === "" && p.variations[0].namePt === "Tamanho");
  check("PT file: options grouped by the Portuguese variation name", p.variations.length === 1 && p.variations[0].options.length === 2);
}
{
  const OLD = [
    "name_en,name_pt,category,tax_rate,price,status,sdr_applicable,sdr_container_count",
    "Water,Água,Drinks,23,1,INACTIVE,true,2",
    "Juice,,Drinks,23,2,,false,3",
  ].join("\n");
  const read = await sheet.readSimpleSheet(csvFile(OLD), "pt");
  const [water, juice] = read.products;
  check("old full file: both languages kept", water.nameEn === "Water" && water.namePt === "Água");
  check("old full file: INACTIVE and SDR from the file kept", water.status === "INACTIVE" && water.sdrApplicable === "true" && water.sdrContainerCount === "2");
  check("old full file: SDR count dropped when SDR is off", juice.sdrContainerCount === "" && juice.status === "ACTIVE");
}
{
  const both = sheet.localiseSimpleRows([{ name: "Plain", name_pt: "Já escrito" }], "pt")[0];
  check("a filled language column wins over the plain one", both.name_pt === "Já escrito" && !("name" in both), J(both));
  const missing = await sheet.readSimpleSheet(csvFile("name,price\nTea,1"), "en");
  check("missing category / tax_rate reported", J(missing.missingColumns) === J(["category", "tax_rate"]) && missing.products.length === 0, J(missing.missingColumns));
  const empty = await sheet.readSimpleSheet(csvFile("name,category,tax_rate\n"), "en");
  check("header-only file: no products, no missing columns", empty.products.length === 0 && empty.missingColumns.length === 0);
}
{
  const shop = await sheet.readSimpleSheet(
    csvFile("name,category,tax_rate,price,stock_quantity,variation_name,option_label,option_price,option_stock\nShirt,Clothes,23,,,Size,M,10,5"),
    "en",
    { isRestaurant: true },
  );
  check("restaurant: stock dropped", shop.products[0].variations[0].options[0].stock === "");
  const store = await sheet.readSimpleSheet(
    csvFile("name,category,tax_rate,price,stock_quantity\nSoap,Home,23,2,40"),
    "en",
  );
  check("shop: stock kept", store.products[0].stockQuantity === "40");
  check("template: restaurant has no stock columns", !sheet.simpleTemplateColumns(true).some((c) => c.includes("stock")));
  check("template: no _pt/_en, status or sdr", !sheet.simpleTemplateColumns(false).some((c) => /_(en|pt)$|status|sdr/.test(c)));
}

section("2. Translating");
{
  const read = await sheet.readSimpleSheet(csvFile(EN_FILE), "en", { isRestaurant: true });
  const { send, calls } = stub();
  const progress = [];
  const out = await translateSheet(read.products, "en", send, { onProgress: (d, t) => progress.push(`${d}/${t}`) });
  const [cola, margherita, pepperoni] = out.products;
  check("one request for a small file", calls.length === 1, calls.length);
  check("EN → PT", calls[0].sourceLang === "EN" && calls[0].targetLang === "PT");
  check("repeated texts sent once (Size, Medium, Large, Pepperoni)", calls[0].texts.length === new Set(calls[0].texts).size && out.sent === 7, J(calls[0].texts));
  check("names filled", cola.namePt === "Coca-Cola 330ml [pt]" && pepperoni.namePt === "Pepperoni [pt]");
  check("description filled", margherita.descriptionPt === "Tomato and mozzarella [pt]");
  check("variations + options filled", margherita.variations[0].namePt === "Size [pt]" && margherita.variations[0].options[1].labelPt === "Large [pt]");
  check("empty description stays empty", cola.descriptionPt === "" && cola.descriptionEn === "");
  check("nothing missing, no error", out.missing.length === 0 && out.error === null);
  check("input not changed", read.products[0].namePt === "");
  check("progress reported", J(progress) === J(["0/1", "1/1"]), J(progress));

  const { rows } = sheet.flattenNestedStateToCsvRows(out.products, { isRestaurant: true });
  check("final file rows have both names, ACTIVE, SDR false", rows[0].name_en && rows[0].name_pt && rows[0].status === "ACTIVE" && rows[0].sdr_applicable === "false", J(rows[0]));
}
{
  const products = [
    { ...sheet.emptyProduct(), nameEn: "Both", namePt: "Ambos" },
    { ...sheet.emptyProduct(), nameEn: "", namePt: "Só português" },
  ];
  const { send, calls } = stub();
  const out = await translateSheet(products, "en", send);
  check("texts in both languages are not sent", !calls.some((c) => c.texts.includes("Both")));
  check("a text only in the other language is translated PT → EN", calls[0].sourceLang === "PT" && out.products[1].nameEn === "Só português [en]");
  const none = stub();
  await translateSheet([{ ...sheet.emptyProduct(), nameEn: "A", namePt: "B" }], "en", none.send);
  check("nothing to translate: no request", none.calls.length === 0);
}
{
  const many = Array.from({ length: 120 }, (_, i) => ({ ...sheet.emptyProduct(), nameEn: `Item ${i}` }));
  const { send, calls } = stub();
  const out = await translateSheet(many, "en", send);
  check(`batches of ≤ ${TRANSLATE_MAX_TEXTS}`, calls.length === 3 && calls.every((c) => c.texts.length <= TRANSLATE_MAX_TEXTS), J(calls.map((c) => c.texts.length)));
  check("all 120 translated", out.translated === 120 && out.products[119].namePt === "Item 119 [pt]");
  const long = batchTexts(Array.from({ length: 6 }, () => "x".repeat(4500)));
  check("≤ 20,000 characters per request", long.every((b) => b.join("").length <= 20000) && long.length === 2, J(long.map((b) => b.length)));
}
{
  const many = Array.from({ length: 120 }, (_, i) => ({ ...sheet.emptyProduct(), nameEn: `Item ${i}` }));
  const { send, calls } = stub((request, n) =>
    n === 2 ? { ok: false, code: "QUOTA_EXCEEDED" } : { ok: true, translations: request.texts.map((t) => `${t}!`) },
  );
  const out = await translateSheet(many, "en", send);
  check("quota: stops after the failing batch", calls.length === 2, calls.length);
  check("quota: first batch kept", out.products[0].namePt === "Item 0!");
  check("quota: the rest listed as missing", out.missing.length === 70 && out.missing[0].field === "namePt", out.missing.length);
  check("quota: error code surfaced", out.error === "QUOTA_EXCEEDED");
}
{
  const waits = [];
  const { send, calls } = stub((request, n) =>
    n === 1 ? { ok: false, code: "RATE_LIMITED" } : { ok: true, translations: request.texts.map((t) => `${t}!`) },
  );
  const out = await translateSheet([{ ...sheet.emptyProduct(), nameEn: "Tea" }], "en", send, {
    wait: async (ms) => { waits.push(ms); },
  });
  check("429: waits a minute and retries", waits.length === 1 && waits[0] > 60000 && calls.length === 2 && out.products[0].namePt === "Tea!");
}
{
  const { send } = stub(() => { throw new Error("network"); });
  const p = { ...sheet.emptyProduct(), nameEn: "Tea", variations: [{ nameEn: "Size", namePt: "", options: [{ labelEn: "Big", labelPt: "", price: "1", stock: "" }] }] };
  const out = await translateSheet([p], "en", send);
  check("network error: never throws", out.error === "UNAVAILABLE");
  check("missing uses editor paths", J(out.missing.map((m) => m.field)) === J(["namePt", "v0.namePt", "v0.o0.labelPt"]), J(out.missing.map((m) => m.field)));
  check("missing cells stay empty (not copied)", out.products[0].namePt === "");
}
{
  const controller = new AbortController();
  const many = Array.from({ length: 120 }, (_, i) => ({ ...sheet.emptyProduct(), nameEn: `Item ${i}` }));
  const { send, calls } = stub((request) => {
    controller.abort();
    return { ok: true, translations: request.texts };
  });
  let aborted = false;
  try {
    await translateSheet(many, "en", send, { signal: controller.signal });
  } catch (e) {
    aborted = e?.name === "AbortError";
  }
  check("cancel: stops between batches", aborted && calls.length === 1, J({ aborted, calls: calls.length }));
}

section("3. The simple template");
{
  const pt = sheet.simpleTemplateCsv({ lang: "pt", isRestaurant: true, category: "Bebidas", taxRate: 13 });
  const file = csvFile(pt);
  const read = await sheet.readSimpleSheet(file, "pt", { isRestaurant: true });
  check("template starts with a BOM (Excel reads accents)", pt.charCodeAt(0) === 0xfeff);
  check("PT template reads back as 2 products in Portuguese", read.products.length === 2 && read.products[1].variations[0].namePt === "Tamanho", J(read.products.map((p) => p.namePt)));
  check("template uses the vendor's category and VAT", read.products.every((p) => p.category === "Bebidas" && p.taxRate === "13"));
  const en = sheet.simpleTemplateCsv({ lang: "en", isRestaurant: false });
  check("EN shop template has stock columns and an English example", /stock_quantity/.test(en) && /Orange juice/.test(en));
}

section("4. Review helpers");
{
  const p = {
    ...sheet.emptyProduct(),
    nameEn: "Tea",
    descriptionPt: "Chá verde",
    variations: [{ nameEn: "Size", namePt: "", options: [{ labelEn: "Big", labelPt: "", price: "1", stock: "" }] }],
  };
  check("sheetText reads product, variation and option cells",
    sheet.sheetText(p, "nameEn") === "Tea" && sheet.sheetText(p, "descriptionPt") === "Chá verde" &&
    sheet.sheetText(p, "v0.nameEn") === "Size" && sheet.sheetText(p, "v0.o0.labelEn") === "Big");
  check("sheetText: unknown paths are undefined", sheet.sheetText(p, "v3.namePt") === undefined && sheet.sheetText(p, "price") === undefined && sheet.sheetText(p, "labelEn") === undefined);
  check("otherLanguagePath", sheet.otherLanguagePath("v0.o1.labelPt") === "v0.o1.labelEn" && sheet.otherLanguagePath("nameEn") === "namePt");
  const q = sheet.withSheetText(sheet.withSheetText(p, "v0.o0.labelPt", "Grande"), "namePt", "Chá");
  check("withSheetText writes and copies", q.variations[0].options[0].labelPt === "Grande" && q.namePt === "Chá" && p.namePt === "" && p.variations[0].options[0].labelPt === "");
  check("withSheetText: unknown path leaves the product", sheet.withSheetText(p, "v9.namePt", "x") === p);

  const list = [{ ...p, status: "ACTIVE", sdrApplicable: "false" }, sheet.emptyProduct()];
  const on = sheet.applyToAllProducts(list, { status: "INACTIVE", sdr: { on: true, containers: " 2 " } });
  check("set for all: status + SDR on with count", on[0].status === "INACTIVE" && on[0].sdrApplicable === "true" && on[0].sdrContainerCount === "2");
  check("set for all: blank rows untouched", on[1] === list[1]);
  const off = sheet.applyToAllProducts(on, { sdr: { on: false } });
  check("set for all: SDR off clears the count, status kept", off[0].sdrApplicable === "false" && off[0].sdrContainerCount === "" && off[0].status === "INACTIVE");
}

console.log("\nAdmin route errors → reason (plan.md §9.5)");
check("DeepL 456 in the message → QUOTA_EXCEEDED", translationErrorCode(500, { success: false, message: "DeepL Translation Failed (456): Quota exceeded" }) === "QUOTA_EXCEEDED");
check("DeepL 429 in the message → RATE_LIMITED", translationErrorCode(500, { message: "DeepL Translation Failed (429): Too many requests" }) === "RATE_LIMITED");
check("a route that sends a code keeps it", translationErrorCode(503, { code: "UNAUTHORIZED" }) === "UNAUTHORIZED");
check("anything else → UNAVAILABLE", translationErrorCode(500, { message: "fetch failed" }) === "UNAVAILABLE" && translationErrorCode(502, null) === "UNAVAILABLE");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
