/**
 * Sheet row 77, super admin (plan.md §10.5): the product's "2×1" switch reads
 * and writes a buy-one-get-one-free offer of the product's vendor.
 *
 *   pnpm verify:two-for-one
 */
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const { twoForOneState, twoForOneOfferPayload, TWO_FOR_ONE_USER_LIMIT } = await import(join(root, "utils/twoForOne.ts"));

let passed = 0, failed = 0;
const check = (name, ok, detail) => {
  if (ok) { passed++; console.log(`  PASS  ${name}`); }
  else { failed++; console.log(`  FAIL  ${name}${detail === undefined ? "" : `  → ${detail}`}`); }
};
const J = JSON.stringify;
const now = new Date("2026-11-22T12:00:00Z");
const offer = (over = {}) => ({
  _id: "o1", title: { en: "2×1 — Tea", pt: "2×1 — Chá" }, offerType: "BUY_AND_REWARD",
  isActive: true, isDeleted: false, expiresAt: "2027-11-22", createdByRole: "VENDOR",
  buyAndReward: { buy: { scope: "SPECIFIC_PRODUCTS", productIds: ["p1"], quantity: 1 }, reward: { type: "SAME_PRODUCT", quantity: 1 } },
  ...over,
});
const on = (o) => J(o) === J({ state: "on", offerId: "o1", isActive: true });

console.log("\nReading the state");
check("no offers → off", twoForOneState([], "p1", now).state === "off");
check("vendor's own 2×1 → on (the admin can end it)", on(twoForOneState([offer()], "p1", now)));
check("admin-made 2×1 → on too", on(twoForOneState([offer({ createdByRole: "ADMIN" })], "p1", now)));
check("super-admin-made 2×1 → on too", on(twoForOneState([offer({ createdByRole: "SUPER_ADMIN" })], "p1", now)));
check("other product's 2×1 → off", twoForOneState([offer()], "p2", now).state === "off");
check("populated product ids still match", on(twoForOneState([offer({ buyAndReward: { buy: { scope: "SPECIFIC_PRODUCTS", productIds: [{ _id: "p1" }], quantity: 1 }, reward: { type: "SAME_PRODUCT", quantity: 1 } } })], "p1", now)));
check("inactive / deleted / expired → off",
  ["isActive", "isDeleted", "expiresAt"].every((k) => twoForOneState([offer({ [k]: k === "isActive" ? false : k === "isDeleted" ? true : "2026-01-01" })], "p1", now).state === "off"));
const shared = twoForOneState([offer({ title: { en: "Combo" }, buyAndReward: { buy: { scope: "SPECIFIC_PRODUCTS", productIds: ["p1", "p2"], quantity: 1 }, reward: { type: "SAME_PRODUCT", quantity: 1 } } })], "p1", now);
check("shared with another product → locked, named", J(shared) === J({ state: "locked", reason: "SHARED", title: "Combo" }));
check("buy 2 get 1 → locked", twoForOneState([offer({ buyAndReward: { buy: { scope: "SPECIFIC_PRODUCTS", productIds: ["p1"], quantity: 2 }, reward: { type: "SAME_PRODUCT", quantity: 1 } } })], "p1", now).state === "locked");
check("own 2×1 wins over a shared one", on(twoForOneState([offer({ _id: "o2", buyAndReward: { buy: { scope: "SPECIFIC_PRODUCTS", productIds: ["p1", "p2"], quantity: 1 }, reward: { type: "SAME_PRODUCT", quantity: 1 } } }), offer()], "p1", now)));

console.log("\nThe offer it creates");
const body = twoForOneOfferPayload("p1", "v1", { en: "Tea", pt: "" }, now);
check("for the product's vendor (targetVendorId)", body.targetVendorId === "v1");
check("buy that product ×1, same product ×1 free", J(body.buyAndReward) === J({ buy: { scope: "SPECIFIC_PRODUCTS", productIds: ["p1"], quantity: 1 }, reward: { type: "SAME_PRODUCT", quantity: 1 } }));
check("BUY_AND_REWARD, active, auto-applied", body.offerType === "BUY_AND_REWARD" && body.isActive && body.isAutoApply);
check("every order (not once per customer)", body.userUsageLimit === TWO_FOR_ONE_USER_LIMIT && TWO_FOR_ONE_USER_LIMIT > 1);
check("runs a year from today", body.validFrom === "2026-11-22" && body.expiresAt === "2027-11-22");
check("titles in both languages (PT falls back to EN)", body.title.en === "2×1 — Tea" && body.title.pt === "2×1 — Tea");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
