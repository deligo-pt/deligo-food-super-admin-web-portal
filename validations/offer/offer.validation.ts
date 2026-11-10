import { validateLocalizedField } from "@/consts/validation.const";
import { z } from "zod";

const localizedTextSchema = z.object({
  en: z.string().max(50, "Cannot exceed 50 characters").optional(),
  pt: z.string().max(50, "Cannot exceed 50 characters").optional()
});

export const offerValidation = z
  .object({
    title: localizedTextSchema,

    description: z.object({
      en: z.string().max(500, "Cannot exceed 500 characters").optional(),
      pt: z.string().max(500, "Cannot exceed 500 characters").optional()
    }),

    offerType: z.enum(
      ["PERCENT", "FLAT"],
      "Offer type must be one of the following: PERCENT, FLAT",
    ),

    discountValue: z
      .number()
      // .min(1, "Discount value must be at least 1")
      .optional(),

    maxDiscountAmount: z
      .number("Max discount amount must be a number")
      .min(0, "Max discount amount must be at least 0")
      .max(1000, "Max discount amount must be at most 1000")
      .optional(),

    validFrom: z.date("Start date must be a valid date"),
    expiresAt: z.date("End date must be a valid date"),

    minOrderAmount: z
      .number()
      .min(0, "Minimum order amount must be at least 0")
      .optional(),

    code: z.string().optional(),
    isAutoApply: z.boolean("Auto apply must be a boolean"),

    maxUsageCount: z.string().optional(),

    userUsageLimit: z.string().optional(),

    // applicableProducts: z.array(z.string("Product is required")).optional(),
    scopeType: z.enum(["ALL_PRODUCTS", "SPECIFIC_PRODUCTS"]).optional(),
    scopeProducts: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),

    isFirstOrder: z.boolean().optional(),
    firstOrderRequireVerifiedPhone: z.boolean().optional(),
    firstOrderMaxRestores: z.number().int().min(0).max(5).optional(),

    currentLang: z.enum(["en", "pt"]).optional(),
  })
  .superRefine((data, ctx) => {
    validateLocalizedField(
      data.title,
      data.currentLang as "en" | "pt",
      ctx,
      ["title"],
      "Title is required"
    );
    validateLocalizedField(
      data.description,
      data.currentLang as "en" | "pt",
      ctx,
      ["description"],
      "Description is required"
    );
  })
  .refine(
    (data) =>
      data.scopeType !== "SPECIFIC_PRODUCTS" ||
      (!!data.scopeProducts && data.scopeProducts.length > 0),
    { message: "Select at least one product", path: ["scopeProducts"] },
  )
  .refine(
    (data) => {
      if (data.offerType === "PERCENT" && data.discountValue && data.discountValue > 100) {
        return false;
      }
      return true;
    },
    {
      message: "Discount value must be at most 100 for PERCENT offer type",
      path: ["discountValue"],
    },
  )
  .refine(
    (data) => {
      if (data.validFrom >= data.expiresAt) {
        return false;
      }
      return true;
    },
    { message: "End date must be after start date", path: ["expiresAt"] },
  )
  .refine(
    (data) => {
      if (!data.isAutoApply && (!data.code || data.code === "")) {
        return false;
      }
      return true;
    },
    { message: "Code is required", path: ["code"] },
  )
  .refine(
    (data) => {
      if (data.isAutoApply && data.code && data.code?.length > 0) {
        return false;
      }
      return true;
    },
    {
      message: "Auto-apply offers should not have a promo code",
      path: ["code"],
    },
  )
  .refine(
    (data) => {
      if (data.maxUsageCount) {
        if (isNaN(Number(data.maxUsageCount))) {
          return false;
        }
      }
      return true;
    },
    {
      message: "Max usage count must be a number",
      path: ["maxUsageCount"],
    },
  )
  .refine(
    (data) => {
      if (
        data.maxUsageCount &&
        data.maxUsageCount.length > 0 &&
        Number(data.maxUsageCount) < 1
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Max usage count must be at least 1",
      path: ["maxUsageCount"],
    },
  )
  .refine(
    (data) => {
      if (data.userUsageLimit) {
        if (isNaN(Number(data.userUsageLimit))) {
          return false;
        }
      }
      return true;
    },
    {
      message: "User usage limit must be a number",
      path: ["userUsageLimit"],
    },
  )
  .refine(
    (data) => {
      if (
        data.userUsageLimit &&
        data.userUsageLimit.length > 0 &&
        Number(data.userUsageLimit) < 1
      ) {
        return false;
      }
      return true;
    },
    {
      message: "User usage limit must be at least 1",
      path: ["userUsageLimit"],
    },
  );

// ─────────────────────────────────────────────────────────────────────────────
// In "@/validations/offer/offer.validation.ts":
// replace everything from `const rewardOptionSchema` down to and including
// `export type TOfferForm = ...;` with the code below.
// Keep `productHasVariations` and `getProductSkuOptions` (they stay unchanged).
//
// New translation keys to add:
//   offer_err_percent_max          "Percentage discount can't exceed 100"
//   offer_err_max_discount_required "Max discount amount is required and must be greater than 0"
//   offer_err_flat_min_order       "Minimum order must be at least 2x the discount"
// ─────────────────────────────────────────────────────────────────────────────

const rewardOptionSchema = z.object({
  productId: z.string().min(1, "offer_err_product_required"),
  variationSku: z.string().optional(),
});

const buyAndRewardBuySchema = z.object({
  scope: z.enum(["SPECIFIC_PRODUCTS"]).default("SPECIFIC_PRODUCTS"),
  productIds: z.array(z.string()).optional(),
  categoryIds: z.array(z.string()).optional(),
  quantity: z.number().min(1, "offer_err_buy_qty_min"),
});

const buyAndRewardRewardSchema = z.object({
  type: z.enum(["SAME_PRODUCT", "FIXED_PRODUCT", "CUSTOMER_CHOICE"]),
  quantity: z.number().min(1, "offer_err_reward_qty_min"),
  productId: z.string().optional(),
  variationSku: z.string().optional(),
  options: z.array(rewardOptionSchema).optional(),
});

// Was localizedTextSchema (50 chars) by mistake. The old offerValidation allowed 500.
const offerDescriptionSchema = z.object({
  en: z.string().max(500, "Cannot exceed 500 characters").optional(),
  pt: z.string().max(500, "Cannot exceed 500 characters").optional(),
});

export const vendorOfferValidation = z
  .object({
    title: localizedTextSchema,
    description: offerDescriptionSchema,

    offerType: z.enum(["PERCENT", "FLAT", "BUY_AND_REWARD"], {
      error: "offer_err_type_required",
    }),

    // The 100 cap applies to PERCENT only (checked in superRefine). FLAT can be any amount.
    discountValue: z.number().min(0).optional(),
    maxDiscountAmount: z.number().min(0).max(1000).optional(),

    scopeType: z.enum(["ALL_PRODUCTS", "SPECIFIC_PRODUCTS"]).optional(),
    scopeCategories: z.array(z.string()).optional(),
    scopeProducts: z.array(z.string()).optional(),
    allowDiscountedProducts: z.boolean().optional(),
    isFirstOrder: z.boolean().optional(),
    firstOrderRequireVerifiedPhone: z.boolean().optional(),
    firstOrderMaxRestores: z.number().int().min(0).max(5).optional(),

    buyAndReward: z
      .object({
        buy: buyAndRewardBuySchema,
        reward: buyAndRewardRewardSchema,
      })
      .optional(),

    validFrom: z.date({ error: "offer_err_start_date_required" }),
    expiresAt: z.date({ error: "offer_err_end_date_required" }),
    minOrderAmount: z.number().min(0).optional(),
    code: z.string().optional(),
    isAutoApply: z.boolean().optional(),
    userUsageLimit: z.string().optional(),
    isActive: z.boolean().default(true),

    currentLang: z.enum(["en", "pt"]),
  })
  .superRefine((data, ctx) => {
    const add = (message: string, path: (string | number)[]) =>
      ctx.addIssue({ code: "custom", message, path });

    validateLocalizedField(
      data.title,
      data.currentLang,
      ctx,
      ["title"],
      "offer_err_title_required",
    );
    validateLocalizedField(
      data.description,
      data.currentLang,
      ctx,
      ["description"],
      "offer_err_description_required",
    );

    if (data.validFrom >= data.expiresAt) {
      add("offer_err_end_after_start", ["expiresAt"]);
    }

    if (data.userUsageLimit && data.userUsageLimit.trim() !== "") {
      const num = Number(data.userUsageLimit);
      if (isNaN(num) || num < 1) add("offer_err_usage_limit", ["userUsageLimit"]);
    }

    // ── PERCENT / FLAT ───────────────────────────────────────────────────────
    if (data.offerType === "PERCENT" || data.offerType === "FLAT") {
      if (data.discountValue == null) {
        add("offer_err_discount_required", ["discountValue"]);
      }

      if (
        data.scopeType === "SPECIFIC_PRODUCTS" &&
        !data.scopeProducts?.length
      ) {
        add("offer_err_one_product", ["scopeProducts"]);
      }

      if (!data.isAutoApply && !data.code?.trim()) {
        add("offer_err_promo_code", ["code"]);
      }
    }

    // Guardrail: PERCENT needs a positive cap, and can't exceed 100%
    if (data.offerType === "PERCENT") {
      if ((data.discountValue ?? 0) > 100) {
        add("offer_err_percent_max", ["discountValue"]);
      }
      if (!data.maxDiscountAmount || data.maxDiscountAmount <= 0) {
        add("offer_err_max_discount_required", ["maxDiscountAmount"]);
      }
    }

    // Guardrail: FLAT needs minOrderAmount >= 2 x discountValue (exactly 2x is valid)
    if (data.offerType === "FLAT" && data.discountValue != null) {
      if ((data.minOrderAmount ?? 0) < 2 * data.discountValue) {
        add("offer_err_flat_min_order", ["minOrderAmount"]);
      }
    }

    // ── BUY_AND_REWARD ───────────────────────────────────────────────────────
    if (data.offerType === "BUY_AND_REWARD") {
      const br = data.buyAndReward;
      if (!br) {
        add("offer_err_buy_reward_required", ["buyAndReward"]);
        return;
      }
      if (!br.buy.productIds?.length) {
        add("offer_err_buy_product", ["buyAndReward", "buy", "productIds"]);
      }
      if (br.reward.type === "FIXED_PRODUCT" && !br.reward.productId) {
        add("offer_err_fixed_reward", ["buyAndReward", "reward", "productId"]);
      }
      if (br.reward.type === "CUSTOMER_CHOICE") {
        const opts = br.reward.options;
        if (!opts?.length || !opts.every((o) => !!o.productId)) {
          add("offer_err_reward_option", ["buyAndReward", "reward", "options"]);
        }
      }
    }
  });

export type TOfferForm = z.infer<typeof vendorOfferValidation>;

/** Helper – true if product has selectable variation SKUs */
export function productHasVariations(product: {
  stock?: { hasVariations?: boolean };
  variations?: { options?: { sku?: string }[] }[];
}): boolean {
  if (product.stock?.hasVariations) return true;
  return !!(
    product.variations?.length &&
    product.variations.some((v) => v.options?.some((o) => !!o.sku))
  );
}

/** Flatten all SKU options from a product for a Select */
export function getProductSkuOptions(
  product: {
    variations?: {
      name?: { en?: string; pt?: string } | string;
      options?: {
        label?: { en?: string; pt?: string } | string;
        sku?: string;
        price?: number;
      }[];
    }[];
  },
  lang: string = "en",
): { sku: string; label: string }[] {
  const result: { sku: string; label: string }[] = [];
  if (!product.variations?.length) return result;

  product.variations.forEach((v) => {
    v.options?.forEach((opt) => {
      if (!opt.sku) return;
      const labelObj = opt.label as Record<string, unknown>;
      const label =
        (typeof labelObj === "object"
          ? labelObj?.[lang] || labelObj?.en
          : labelObj) || opt.sku;
      result.push({ sku: opt.sku, label: `${label} (${opt.sku})` });
    });
  });
  return result;
}
