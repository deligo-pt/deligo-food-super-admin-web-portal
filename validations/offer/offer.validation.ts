import { z } from "zod";

export const offerValidation = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters long"),

    description: z
      .string()
      .min(2, "Description must be at least 2 characters long")
      .max(500, "Description must be at most 500 characters long")
      .optional(),

    offerType: z.enum(
      ["PERCENT", "FLAT", "FREE_DELIVERY"],
      "Offer type must be one of the following: PERCENT, FLAT, FREE_DELIVERY",
    ),

    discountValue: z
      .number()
      .min(1, "Discount value must be at least 1")
      .optional(),

    maxDiscountAmount: z
      .number("Max discount amount must be a number")
      .min(0, "Max discount amount must be at least 0")
      .max(100, "Max discount amount must be at most 100")
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
  })
  .refine(
    (data) => {
      if (
        data.offerType === "PERCENT" &&
        data.discountValue &&
        data.discountValue > 100
      ) {
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
