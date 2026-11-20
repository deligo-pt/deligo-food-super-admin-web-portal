/**
 * Where an `admin/bulk-create` problem belongs on the admin Add product form
 * (copied from the vendor panel; this form has one `image` string).
 *
 * The backend reports paths inside one item (`pricing.price`, `name.pt`,
 * `variations.0.options.1.label.en`…), or `items.0.<path>` when the whole
 * request failed validation. Some codes come without a path but clearly
 * belong to one field (`PRICE_REQUIRED_WHEN_NO_VARIATIONS` → price).
 *
 * Pure: no React, safe anywhere.
 */

/** Form fields of `productValidation` a server error can sit on. */
export type TProductFormField =
  | "name.en"
  | "name.pt"
  | "description.en"
  | "description.pt"
  | "category"
  | "additionalCategories"
  | "image"
  | "price"
  | "discount"
  | "discountType"
  | "taxId"
  | "quantity"
  | "unit"
  | "availabilityStatus"
  | "addonGroups"
  | "variations"
  | "sdrApplicable"
  | "sdrContainerCount"
  | "isFeatured"
  | "isAvailableForPreOrder";

const PATH_TO_FIELD: [prefix: string, field: TProductFormField][] = [
  ["name.en", "name.en"],
  ["name.pt", "name.pt"],
  ["description.en", "description.en"],
  ["description.pt", "description.pt"],
  ["additionalCategories", "additionalCategories"],
  ["category", "category"],
  ["image", "image"],
  ["pricing.price", "price"],
  ["pricing.discountType", "discountType"],
  ["pricing.discount", "discount"],
  ["pricing.taxId", "taxId"],
  ["stock.quantity", "quantity"],
  ["stock.unit", "unit"],
  ["stock.availabilityStatus", "availabilityStatus"],
  ["addonGroups", "addonGroups"],
  // Sizes and options are edited in a dialog, not as form fields: every
  // variation problem sits on the list as a whole.
  ["variations", "variations"],
  ["sdr.containerCount", "sdrContainerCount"],
  ["sdr", "sdrApplicable"],
  ["meta.isFeatured", "isFeatured"],
  ["meta.isAvailableForPreOrder", "isAvailableForPreOrder"],
];

/** Codes the backend sends without a path that still belong to one field. */
const CODE_TO_FIELD: Record<string, TProductFormField> = {
  PRICE_REQUIRED_WHEN_NO_VARIATIONS: "price",
  CATEGORY_NOT_OWNED_BY_VENDOR: "category",
  CATEGORY_INACTIVE: "category",
  // NOT_FOUND_MESSAGE is left out: on the admin route it can be the
  // category, the tax or the vendor (checked live), so it goes in the toast.
  INVALID_ADDON_GROUPS: "addonGroups",
  VARIATION_STOCK_NOT_ALLOWED_FOR_RESTAURANTS: "variations",
};

/** Form field for a backend path, or `null` when it has none. */
export function productFieldForPath(path: string): TProductFormField | null {
  const inner = path.replace(/^items\.\d+\./, "");
  if (!inner) return null;
  for (const [prefix, field] of PATH_TO_FIELD) {
    if (inner === prefix || inner.startsWith(`${prefix}.`)) return field;
  }
  return null;
}

/** Form field for a pathless failure code, or `null`. */
export const productFieldForCode = (code: string | null | undefined) =>
  (code && CODE_TO_FIELD[code]) || null;

/** Which Add Item step holds a field (translation key of the tab name). */
export function productTabKeyForField(field: TProductFormField): string {
  switch (field) {
    case "name.en":
    case "name.pt":
    case "category":
    case "additionalCategories":
      return "basic_info";
    case "description.en":
    case "description.pt":
    case "image":
      return "images";
    case "addonGroups":
    case "variations":
      return "add_ons_and_variants";
    case "price":
    case "discount":
    case "discountType":
    case "taxId":
      return "pricing";
    case "quantity":
    case "unit":
    case "availabilityStatus":
      return "stock";
    default:
      return "deligo_metadata";
  }
}
