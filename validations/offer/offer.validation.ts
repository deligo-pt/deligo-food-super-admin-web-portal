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

    applicableProducts: z.array(z.string("Product is required")).optional(),

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

export const vendorOfferValidation = z.object({
  title: localizedTextSchema,
  description: localizedTextSchema,

  offerType: z.enum(["PERCENT", "FLAT", "BUY_AND_REWARD"], {
    error: "offer_err_type_required",
  }),

  discountValue: z.number().min(0).max(100).optional(),
  maxDiscountAmount: z.number().min(0).max(1000).optional(),

  scopeType: z.enum(["ALL_PRODUCTS", "SPECIFIC_PRODUCTS"]).optional(),
  scopeCategories: z.array(z.string()).optional(),
  scopeProducts: z.array(z.string()).optional(),

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
  })
  .refine((data) => data.validFrom < data.expiresAt, {
    message: "offer_err_end_after_start",
    path: ["expiresAt"],
  })
  .refine(
    (data) => {
      if (data.offerType === "PERCENT" || data.offerType === "FLAT") {
        return data.discountValue !== undefined && data.discountValue !== null;
      }
      return true;
    },
    { message: "offer_err_discount_required", path: ["discountValue"] },
  )
  .refine(
    (data) => {
      if (
        (data.offerType === "PERCENT" || data.offerType === "FLAT") &&
        data.scopeType === "SPECIFIC_PRODUCTS"
      ) {
        return !!data.scopeProducts && data.scopeProducts.length > 0;
      }
      return true;
    },
    { message: "offer_err_one_product", path: ["scopeProducts"] },
  )
  .refine(
    (data) => {
      if (data.offerType === "PERCENT" || data.offerType === "FLAT") {
        if (!data.isAutoApply) {
          return !!data.code && data.code.trim() !== "";
        }
      }
      return true;
    },
    {
      message: "offer_err_promo_code",
      path: ["code"],
    },
  )
  .refine(
    (data) => {
      if (data.offerType === "BUY_AND_REWARD") {
        return !!data.buyAndReward;
      }
      return true;
    },
    {
      message: "offer_err_buy_reward_required",
      path: ["buyAndReward"],
    },
  )
  .refine(
    (data) => {
      if (data.offerType === "BUY_AND_REWARD" && data.buyAndReward) {
        return (
          !!data.buyAndReward.buy.quantity &&
          data.buyAndReward.buy.quantity >= 1
        );
      }
      return true;
    },
    {
      message: "offer_err_buy_qty_min",
      path: ["buyAndReward", "buy", "quantity"],
    },
  )
  .refine(
    (data) => {
      if (data.offerType === "BUY_AND_REWARD" && data.buyAndReward) {
        return (
          !!data.buyAndReward.buy.productIds &&
          data.buyAndReward.buy.productIds.length > 0
        );
      }
      return true;
    },
    {
      message: "offer_err_buy_product",
      path: ["buyAndReward", "buy", "productIds"],
    },
  )
  .refine(
    (data) => {
      if (data.offerType === "BUY_AND_REWARD" && data.buyAndReward) {
        return (
          !!data.buyAndReward.reward.quantity &&
          data.buyAndReward.reward.quantity >= 1
        );
      }
      return true;
    },
    {
      message: "offer_err_reward_qty_min",
      path: ["buyAndReward", "reward", "quantity"],
    },
  )
  .refine(
    (data) => {
      if (
        data.offerType === "BUY_AND_REWARD" &&
        data.buyAndReward?.reward.type === "FIXED_PRODUCT"
      ) {
        return !!data.buyAndReward.reward.productId;
      }
      return true;
    },
    {
      message: "offer_err_fixed_reward",
      path: ["buyAndReward", "reward", "productId"],
    },
  )
  .refine(
    (data) => {
      if (
        data.offerType === "BUY_AND_REWARD" &&
        data.buyAndReward?.reward.type === "CUSTOMER_CHOICE"
      ) {
        const opts = data.buyAndReward.reward.options;
        return (
          !!opts && opts.length > 0 && opts.every((o) => !!o.productId)
        );
      }
      return true;
    },
    {
      message: "offer_err_reward_option",
      path: ["buyAndReward", "reward", "options"],
    },
  )
  .refine(
    (data) => {
      if (data.userUsageLimit && data.userUsageLimit.trim() !== "") {
        const num = Number(data.userUsageLimit);
        return !isNaN(num) && num >= 1;
      }
      return true;
    },
    {
      message: "offer_err_usage_limit",
      path: ["userUsageLimit"],
    },
  );

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
