/**
 * Extras, super admin panel (plan.md §11.5; copy of the vendor panel's
 * check): group price, Food | Drinks, A→Z sort, duplicate titles, clone
 * payloads.
 *
 *   pnpm verify:addon-group
 */
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { register } from "node:module";
import { pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
// `utils/addonGroup.ts` imports "@/utils/productKind" (the admin has no
// ".ts" imports): map "@/x" to "<root>/x.ts" for this run.
const hooks = `
  export async function resolve(specifier, context, next) {
    if (specifier.startsWith("@/")) {
      return next(${JSON.stringify(pathToFileURL(root).href)} + "/" + specifier.slice(2) + ".ts", context);
    }
    return next(specifier, context);
  }
`;
register("data:text/javascript," + encodeURIComponent(hooks));
const g = await import(join(root, "utils/addonGroup.ts"));

let passed = 0, failed = 0;
const check = (name, ok, detail) => {
  if (ok) { passed++; console.log(`  PASS  ${name}`); }
  else { failed++; console.log(`  FAIL  ${name}${detail === undefined ? "" : `  → ${detail}`}`); }
};
const taxes = [
  { _id: "t23", taxRate: 23, isActive: true },
  { _id: "t13", taxRate: 13, isActive: true },
  { _id: "t6", taxRate: 6, isActive: true },
];
const opt = (en, price, tax, sdr = false, pt = en) => ({ name: { en, pt }, price, tax, sdr: { applicable: sdr, containerCount: 1 } });

console.log("\nCommon values");
check("same price → that price", g.commonPrice([opt("a", 0.5, "t13"), opt("b", 0.5, "t13")]) === 0.5);
check("0 is a real common price", g.commonPrice([opt("a", 0, "t13"), opt("b", 0, "t13")]) === 0);
check("different prices → undefined", g.commonPrice([opt("a", 0.5, "t13"), opt("b", 1, "t13")]) === undefined);
check("no options → undefined", g.commonPrice([]) === undefined);
check("common tax", g.commonTax([opt("a", 1, "t23"), opt("b", 1, "t23")]) === "t23");
check("mixed tax → ''", g.commonTax([opt("a", 1, "t23"), opt("b", 1, "t13")]) === "");
check("common SDR on", g.commonSdr([opt("a", 1, "t23", true), opt("b", 1, "t23", true)]) === true);
check("mixed SDR → undefined", g.commonSdr([opt("a", 1, "t23", true), opt("b", 1, "t23")]) === undefined);

console.log("\nFood | Drinks");
check("all 13% → FOOD", g.kindOfOptions([opt("a", 1, "t13"), opt("b", 1, "t13")], taxes) === "FOOD");
check("all 23% → DRINK", g.kindOfOptions([opt("a", 1, "t23")], taxes) === "DRINK");
check("mixed → null", g.kindOfOptions([opt("a", 1, "t23"), opt("b", 1, "t13")], taxes) === null);
check("6% → null", g.kindOfOptions([opt("a", 1, "t6")], taxes) === null);
check("no options → null", g.kindOfOptions([], taxes) === null);
const drinks = g.withKind([opt("a", 1, "t6"), opt("b", 2, "t13")], "DRINK", taxes);
check("Drinks → 23% on all", drinks.every((o) => o.tax === "t23"));
check("Drinks → SDR on all", drinks.every((o) => o.sdr.applicable === true && o.sdr.containerCount === 1));
check("Drinks keeps prices", drinks[0].price === 1 && drinks[1].price === 2);
const food = g.withKind(drinks, "FOOD", taxes);
check("Food → 13%, SDR off", food.every((o) => o.tax === "t13" && o.sdr.applicable === false));
const noRate = [opt("a", 1, "t6")];
check("missing rate → unchanged", g.withKind(noRate, "DRINK", [{ _id: "t6", taxRate: 6 }]) === noRate);

console.log("\nGroup price");
const priced = g.withPrice([opt("a", 1, "t13"), opt("b", 2, "t13")], 0);
check("price 0 → all free", priced.every((o) => o.price === 0));
check("price keeps the rest", priced[0].tax === "t13" && priced[0].name.en === "a");

console.log("\nSort A→Z");
const list = [opt("Zeta", 1, "t13"), opt("alpha", 1, "t13"), opt("Água", 1, "t13"), opt("Beta 10", 1, "t13"), opt("Beta 9", 1, "t13")];
const sorted = g.sortByName(list, "pt").map((o) => o.name.en);
check("case and accents ignored, numbers natural", sorted.join("|") === "Água|alpha|Beta 9|Beta 10|Zeta", sorted.join("|"));
check("input not changed", list[0].name.en === "Zeta");
check("empty name falls back to other language", g.sortByName([opt("", 1, "t13", false, "Zz"), opt("", 1, "t13", false, "Aa")], "en")[0].name.pt === "Aa");
check("isSortedByName false", g.isSortedByName(list, "pt") === false);
check("isSortedByName true", g.isSortedByName(g.sortByName(list, "pt"), "pt") === true);

console.log("\nDuplicate title");
const groups = [
  { _id: "1", title: { en: "Sauces", pt: "Molhos" } },
  { _id: "2", title: { en: "Old", pt: "Velho" }, isDeleted: true },
];
check("same title taken", g.titleTaken(groups, "Sauces") === true);
check("case and spaces ignored", g.titleTaken(groups, "  sauces ") === true);
check("other language taken too", g.titleTaken(groups, "molhos") === true);
check("own group not counted", g.titleTaken(groups, "Sauces", "1") === false);
check("deleted group not counted", g.titleTaken(groups, "Old") === false);
check("new title free", g.titleTaken(groups, "Sauces 2") === false);
check("empty title not taken", g.titleTaken(groups, "  ") === false);

console.log("\nClone group");
const source = {
  _id: "1",
  title: { en: "Sauces", pt: "Molhos" },
  minSelectable: 0,
  maxSelectable: 2,
  options: [
    { name: { en: "Mayo", pt: "Maionese" }, price: 0.5, tax: { _id: "t13", taxRate: 13 }, sku: "S1", sdr: { applicable: false, containerCount: 1 } },
    { name: { en: "Aioli", pt: "Aioli" }, price: 0.8, tax: "t13", sku: "S2" },
  ],
};
const kept = g.cloneGroupPayload(source, { title: "Sauces – pizza", sort: false, lang: "en" });
check("new title, PT cleared for translation", kept.title.en === "Sauces – pizza" && kept.title.pt === "");
check("no sku copied", kept.options.every((o) => !("sku" in o)));
check("empty price keeps prices", kept.options[0].price === 0.5 && kept.options[1].price === 0.8);
check("tax object → id", kept.options[0].tax === "t13" && kept.options[1].tax === "t13");
check("missing SDR → off", kept.options[1].sdr.applicable === false && kept.options[1].sdr.containerCount === 1);
check("min/max copied", kept.minSelectable === 0 && kept.maxSelectable === 2);
const repriced = g.cloneGroupPayload(source, { title: "Sauces", sort: true, lang: "en" });
check("unchanged title keeps PT", repriced.title.pt === "Molhos");
check("sort → A→Z", repriced.options.map((o) => o.name.en).join() === "Aioli,Mayo");
check("price set on all", g.cloneGroupPayload(source, { title: "X", price: 0, sort: false, lang: "en" }).options.every((o) => o.price === 0));
check("source untouched", source.options[0].sku === "S1" && source.options[0].name.en === "Mayo");

console.log("\nClone variations");
const payloads = g.cloneVariationsPayloads([
  { name: { en: "Size", pt: "Tamanho" }, options: [{ label: { en: "Small", pt: "Pequeno" }, price: 7.99, stockQuantity: 40, sku: "V1" }] },
  { name: { en: "Empty", pt: "Vazio" }, options: [] },
]);
check("one body per group with options", payloads.length === 1);
check("name and labels copied", payloads[0].name.pt === "Tamanho" && payloads[0].options[0].label.pt === "Pequeno");
check("price copied, stock 0, no sku", payloads[0].options[0].price === 7.99 && payloads[0].options[0].stockQuantity === 0 && !("sku" in payloads[0].options[0]));
check("no variations → nothing", g.cloneVariationsPayloads(undefined).length === 0);

console.log("\nRenamed text");
check("changed → other cleared", JSON.stringify(g.renamedText({ en: "A", pt: "B" }, "C", "en")) === JSON.stringify({ en: "C", pt: "" }));
check("same → other kept", g.renamedText({ en: "A", pt: "B" }, " A ", "en").pt === "B");

console.log("\nOrder of a product's Extra groups");
const ids = ["a", "b", "c"];
check("move down", g.moveItem(ids, 0, 1).join() === "b,a,c");
check("move up", g.moveItem(ids, 2, 1).join() === "a,c,b");
check("first to last", g.moveItem(ids, 0, 2).join() === "b,c,a");
check("input not changed", ids.join() === "a,b,c");
check("up from the top → unchanged", g.moveItem(ids, 0, -1) === ids);
check("down from the bottom → unchanged", g.moveItem(ids, 2, 3) === ids);

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
