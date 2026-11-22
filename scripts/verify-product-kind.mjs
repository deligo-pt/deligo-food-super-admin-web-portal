/**
 * Sheet row 75 (plan.md §10.5 (super admin copy)): Food | Drinks sets VAT (13 / 23%) and SDR.
 *
 *   pnpm verify:product-kind
 */
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const { KIND_SETTINGS, taxIdForRate, kindOfRate, kindFromProducts } = await import(join(root, "utils/productKind.ts"));

let passed = 0, failed = 0;
const check = (name, ok, detail) => {
  if (ok) { passed++; console.log(`  PASS  ${name}`); }
  else { failed++; console.log(`  FAIL  ${name}${detail === undefined ? "" : `  → ${detail}`}`); }
};
const taxes = [
  { _id: "t23", taxRate: 23, isActive: true },
  { _id: "t13old", taxRate: 13, isActive: false },
  { _id: "t13", taxRate: 13, isActive: true },
  { _id: "t6", taxRate: 6, isActive: true },
  { _id: "t0", taxRate: 0, isActive: true },
];
const p = (rate, sdr = false) => ({ pricing: { taxRate: rate }, sdr: { applicable: sdr } });

console.log("\nSettings");
check("Food = 13%, no SDR", KIND_SETTINGS.FOOD.rate === 13 && KIND_SETTINGS.FOOD.sdr === false);
check("Drinks = 23%, SDR on", KIND_SETTINGS.DRINK.rate === 23 && KIND_SETTINGS.DRINK.sdr === true);

console.log("\nVAT entry for a rate");
check("23% found", taxIdForRate(taxes, 23) === "t23");
check("active 13% preferred over an inactive one", taxIdForRate(taxes, 13) === "t13");
check("missing rate → null", taxIdForRate([{ _id: "x", taxRate: 6 }], 23) === null);
check("deleted entries ignored", taxIdForRate([{ _id: "d", taxRate: 23, isDeleted: true }], 23) === null);
check("no list → null", taxIdForRate(undefined, 13) === null);
check("string rates from the API still match", taxIdForRate([{ _id: "s", taxRate: "23" }], 23) === "s");

console.log("\nKind of a rate");
check("13 → FOOD, 23 → DRINK", kindOfRate(13) === "FOOD" && kindOfRate(23) === "DRINK");
check("6, 0 and none → neither", kindOfRate(6) === null && kindOfRate(0) === null && kindOfRate(null) === null);

console.log("\nKind from a category's products");
check("mostly 23% → DRINK", kindFromProducts([p(23, true), p(23), p(13)]) === "DRINK");
check("mostly 13% → FOOD", kindFromProducts([p(13), p(13), p(23)]) === "FOOD");
check("tie → null (vendor picks)", kindFromProducts([p(13), p(23)]) === null);
check("empty category → null", kindFromProducts([]) === null && kindFromProducts(undefined) === null);
check("only 6% / 0% products → null", kindFromProducts([p(6), p(0)]) === null);
check("products without pricing are skipped", kindFromProducts([{}, { pricing: null }, p(23)]) === "DRINK");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
