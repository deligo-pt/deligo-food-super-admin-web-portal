/**
 * Extras (add-on groups) — plan.md §11. Group price, Food | Drinks, A→Z
 * sort, duplicate titles, and the payloads for cloning a group or a
 * product's variations.
 *
 * Copied from the vendor panel (same file name). No React, no network:
 * `pnpm verify:addon-group` runs this under bare Node.
 */

import { KIND_SETTINGS, kindOfRate, taxIdForRate, type TProductKind } from "@/utils/productKind";

type TText = { en?: string; pt?: string };
type TLang = "en" | "pt";
type TTaxLike = { _id: string; taxRate: number; isActive?: boolean; isDeleted?: boolean };

/** An option as the group form holds it: `tax` is the VAT entry's id. */
export type TFormOption = {
  name: TText;
  price: number;
  tax: string;
  sku?: string;
  sdr: { applicable: boolean; containerCount: number };
};

/** The price every option shares; `undefined` when they differ or there are none. */
export function commonPrice(options: { price: number }[]): number | undefined {
  if (!options.length) return undefined;
  const first = Number(options[0].price);
  return options.every((option) => Number(option.price) === first) ? first : undefined;
}

/** The VAT id every option shares; "" when they differ or there are none. */
export function commonTax(options: { tax: string }[]): string {
  if (!options.length) return "";
  const first = options[0].tax;
  return options.every((option) => option.tax === first) ? first : "";
}

/** Whether every option carries the SDR deposit; `undefined` when they differ. */
export function commonSdr(options: { sdr?: { applicable?: boolean } }[]): boolean | undefined {
  if (!options.length) return undefined;
  const first = !!options[0].sdr?.applicable;
  return options.every((option) => !!option.sdr?.applicable === first) ? first : undefined;
}

/** Food or Drinks when every option has that kind's VAT; null otherwise. */
export function kindOfOptions(options: { tax: string }[], taxes: TTaxLike[] | undefined): TProductKind | null {
  if (!options.length) return null;
  const kinds = options.map((option) => {
    const rate = (taxes ?? []).find((tax) => tax._id === option.tax)?.taxRate;
    return kindOfRate(rate === undefined ? null : Number(rate));
  });
  return kinds.every((kind) => kind && kind === kinds[0]) ? kinds[0] : null;
}

/** Every option at this price. */
export function withPrice<T extends { price: number }>(options: T[], price: number): T[] {
  return options.map((option) => ({ ...option, price }));
}

/**
 * Every option set to Food (13%, no SDR) or Drinks (23%, SDR). Unchanged —
 * same array — when the vendor's tax list has no such rate.
 */
export function withKind<T extends { tax: string; sdr: { applicable: boolean; containerCount: number } }>(
  options: T[],
  kind: TProductKind,
  taxes: TTaxLike[] | undefined,
): T[] {
  const taxId = taxIdForRate(taxes, KIND_SETTINGS[kind].rate);
  if (!taxId) return options;
  return options.map((option) => ({
    ...option,
    tax: taxId,
    sdr: { applicable: KIND_SETTINGS[kind].sdr, containerCount: 1 },
  }));
}

/** A→Z by the name in `lang` (falling back to the other), Portuguese collation. */
export function sortByName<T extends { name: TText }>(options: T[], lang: TLang): T[] {
  const other: TLang = lang === "en" ? "pt" : "en";
  const label = (option: T) => (option.name?.[lang] || option.name?.[other] || "").trim();
  const collator = new Intl.Collator(lang === "pt" ? "pt-PT" : "en", { sensitivity: "base", numeric: true });
  return [...options].sort((a, b) => collator.compare(label(a), label(b)));
}

/** True when the options are already in A→Z order. */
export function isSortedByName(options: { name: TText }[], lang: TLang): boolean {
  const sorted = sortByName(options, lang);
  return sorted.every((option, index) => option === options[index]);
}

const normalizeTitle = (value: string | undefined) =>
  (value ?? "").normalize("NFC").trim().replace(/\s+/g, " ").toLocaleLowerCase("pt-PT");

/**
 * Whether another group of the vendor already has this title (case and
 * extra spaces ignored), in either language. `exceptId` is the group being
 * edited. The backend refuses such a title too (checked 23 Nov 2026).
 */
export function titleTaken(
  groups: { _id: string; title?: TText; isDeleted?: boolean }[],
  title: string,
  exceptId?: string,
): boolean {
  const wanted = normalizeTitle(title);
  if (!wanted) return false;
  return groups.some(
    (group) =>
      group._id !== exceptId &&
      group.isDeleted !== true &&
      (normalizeTitle(group.title?.en) === wanted || normalizeTitle(group.title?.pt) === wanted),
  );
}

/**
 * A renamed text in one language: the other language is kept only when the
 * text didn't change, so the translator fills it again.
 */
export function renamedText(previous: TText | undefined, next: string, lang: TLang): { en: string; pt: string } {
  const other: TLang = lang === "en" ? "pt" : "en";
  const trimmed = next.trim();
  return {
    [lang]: trimmed,
    [other]: trimmed === (previous?.[lang] ?? "").trim() ? previous?.[other] ?? "" : "",
  } as { en: string; pt: string };
}

type TGroupLike = {
  title?: TText;
  minSelectable: number;
  maxSelectable: number;
  options: {
    name: TText;
    price: number;
    tax: string | { _id: string };
    sdr?: { applicable?: boolean };
    isActive?: boolean;
  }[];
};

/**
 * The `create-group` body for a copy of `group`: new title, every option
 * copied without its `sku` (the backend makes new ones). `price` undefined
 * keeps each option's price; a number sets it on all of them.
 */
export function cloneGroupPayload(
  group: TGroupLike,
  options: { title: string; price?: number; sort: boolean; lang: TLang },
) {
  let copied = group.options.map((option) => ({
    name: { en: option.name?.en ?? "", pt: option.name?.pt ?? "" },
    price: options.price ?? Number(option.price),
    tax: typeof option.tax === "string" ? option.tax : option.tax?._id ?? "",
    sdr: { applicable: !!option.sdr?.applicable, containerCount: 1 },
  }));
  if (options.sort) copied = sortByName(copied, options.lang);
  return {
    title: renamedText(group.title, options.title, options.lang),
    minSelectable: group.minSelectable,
    maxSelectable: Math.min(group.maxSelectable, Math.max(copied.length, 1)),
    options: copied,
  };
}

type TVariationLike = {
  name: TText;
  options: { label: TText; price: number; stockQuantity?: number }[];
};

/**
 * The `manage-product-variations` bodies that copy a product's variations
 * onto another product, one per variation group. SKUs are left for the
 * backend; stock is 0 (it belongs to each product, and restaurants don't use it).
 */
export function cloneVariationsPayloads(variations: TVariationLike[] | undefined) {
  return (variations ?? [])
    .filter((variation) => variation.options?.length)
    .map((variation) => ({
      name: { en: variation.name?.en ?? "", pt: variation.name?.pt ?? "" },
      options: variation.options.map((option) => ({
        label: { en: option.label?.en ?? "", pt: option.label?.pt ?? "" },
        price: Number(option.price),
        stockQuantity: 0,
      })),
    }));
}

/**
 * The list with the item at `from` moved to `to` (a product's Extra groups
 * — customers see them in this order, plan.md §11.6). Out of range → the
 * same list, unchanged.
 */
export function moveItem<T>(list: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}
