/**
 * "2×1" on a product (sheet row 77, plan.md §10.2): a buy-one-get-one-free
 * offer for that one product. There is no product field for it; the switch
 * is ON when such an offer exists. The offer is the ordinary BUY_AND_REWARD
 * offer the Offers page makes, so it shows (and can be ended) there too.
 *
 * Super admin copy of the vendor panel's `src/utils/twoForOne.ts`. One
 * difference: here a 2×1 made by an admin counts as the product's own (the
 * admin can end it); in the vendor panel it is locked.
 *
 * No React, no network: `pnpm verify:two-for-one` runs this under bare Node.
 */

import type { TOffer } from "@/types/offer.type";

type TText = { en: string; pt: string };

/**
 * Per-customer uses. The API refuses 0 / null ("unlimited") and defaults to
 * 1 — which would make the 2×1 a one-time deal per customer. Checked live
 * 22 Nov 2026: 1,000,000 is accepted; 9999 means "every order".
 */
export const TWO_FOR_ONE_USER_LIMIT = 9999;

/** How long a new 2×1 runs. The vendor can end it any time (switch off). */
export const TWO_FOR_ONE_DAYS = 365;

/**
 * - `off`: no 2×1 for this product — the switch can turn it on.
 * - `on`: this product's own 2×1 offer (made by the store or an admin) — the switch can turn it off.
 * - `locked`: a buy-and-reward offer already covers this product but the
 *   switch must not touch it (shared with other products / different
 *   quantities). `title` names it.
 */
export type TTwoForOneState =
  | { state: "off" }
  | { state: "on"; offerId: string; isActive: true }
  | { state: "locked"; reason: "SHARED"; title: string };

const ids = (value: unknown): string[] =>
  Array.isArray(value) ? value.map((v) => (typeof v === "string" ? v : String((v as { _id?: string })?._id ?? ""))) : [];

const isRunning = (offer: TOffer, now: Date) =>
  offer.isActive !== false &&
  offer.isDeleted !== true &&
  (!offer.expiresAt || new Date(offer.expiresAt).getTime() > now.getTime());

/**
 * The 2×1 state of one product (`productMongoId` = its `_id`, which is what
 * offers point at) among the store's offers.
 */
export function twoForOneState(offers: TOffer[], productMongoId: string, now = new Date()): TTwoForOneState {
  const covering = offers.filter((offer) => {
    if (offer.offerType !== "BUY_AND_REWARD" && offer.offerType !== "BOGO") return false;
    if (!isRunning(offer, now)) return false;
    return ids(offer.buyAndReward?.buy?.productIds).includes(productMongoId);
  });
  if (!covering.length) return { state: "off" };

  const own = covering.find((offer) => {
    const buy = offer.buyAndReward?.buy;
    const reward = offer.buyAndReward?.reward;
    const buyIds = ids(buy?.productIds);
    return (
      buy?.scope === "SPECIFIC_PRODUCTS" &&
      buyIds.length === 1 &&
      buy.quantity === 1 &&
      reward?.type === "SAME_PRODUCT" &&
      reward.quantity === 1
    );
  });
  if (own) return { state: "on", offerId: own._id, isActive: true };

  const first = covering[0];
  return { state: "locked", reason: "SHARED", title: first.title?.en || first.title?.pt || "" };
}

const ymd = (date: Date) => date.toISOString().slice(0, 10);

/**
 * The offer the switch creates for the vendor (`vendorMongoId` = the vendor's
 * `_id`): buy 1, get the same product free, auto-applied.
 */
export function twoForOneOfferPayload(productMongoId: string, vendorMongoId: string, name: TText, now = new Date()) {
  const ends = new Date(now.getTime() + TWO_FOR_ONE_DAYS * 24 * 60 * 60 * 1000);
  return {
    title: { en: `2×1 — ${name.en}`.slice(0, 120), pt: `2×1 — ${name.pt || name.en}`.slice(0, 120) },
    description: { en: "Buy one, get one free", pt: "Compre um, leve outro grátis" },
    offerType: "BUY_AND_REWARD" as const,
    targetVendorId: vendorMongoId,
    validFrom: ymd(now),
    expiresAt: ymd(ends),
    isActive: true,
    isAutoApply: true,
    userUsageLimit: TWO_FOR_ONE_USER_LIMIT,
    buyAndReward: {
      buy: { scope: "SPECIFIC_PRODUCTS" as const, productIds: [productMongoId], quantity: 1 },
      reward: { type: "SAME_PRODUCT" as const, quantity: 1 },
    },
  };
}
