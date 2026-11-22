/**
 * Food | Drinks (sheet row 75, plan.md §10.3): one click sets a product's VAT
 * and SDR deposit. Food → 13% VAT, no SDR. Drinks → 23% VAT, SDR on.
 *
 * Nothing new is stored: categories have no field for it, so the choice is
 * read back from the product's own VAT rate, and Add Item guesses it from the
 * other products already in the chosen category.
 *
 * No React, no network: `pnpm verify:product-kind` runs this under bare Node.
 */

export type TProductKind = "FOOD" | "DRINK";

export const KIND_SETTINGS: Record<TProductKind, { rate: number; sdr: boolean }> = {
  FOOD: { rate: 13, sdr: false },
  DRINK: { rate: 23, sdr: true },
};

type TTaxLike = { _id: string; taxRate: number; isActive?: boolean; isDeleted?: boolean };
type TProductLike = { pricing?: { taxRate?: number | null } | null; sdr?: { applicable?: boolean } | null };

/** The VAT entry with this rate (active ones first); null when the list has none. */
export function taxIdForRate(taxes: TTaxLike[] | undefined, rate: number): string | null {
  const matching = (taxes ?? []).filter((tax) => Number(tax.taxRate) === rate && tax.isDeleted !== true);
  const active = matching.find((tax) => tax.isActive !== false);
  return (active ?? matching[0])?._id ?? null;
}

/** Which kind a VAT rate means; null for 0% and 6% (neither). */
export function kindOfRate(rate: number | null | undefined): TProductKind | null {
  if (rate === KIND_SETTINGS.FOOD.rate) return "FOOD";
  if (rate === KIND_SETTINGS.DRINK.rate) return "DRINK";
  return null;
}

/**
 * The kind most of a category's products have. 23% products count as
 * drinks, 13% as food; anything else is ignored. A tie or no such products
 * is null — the vendor picks.
 */
export function kindFromProducts(products: TProductLike[] | undefined): TProductKind | null {
  let food = 0;
  let drink = 0;
  for (const product of products ?? []) {
    const kind = kindOfRate(product?.pricing?.taxRate ?? null);
    if (kind === "FOOD") food++;
    else if (kind === "DRINK") drink++;
  }
  if (food === drink) return null;
  return drink > food ? "DRINK" : "FOOD";
}
