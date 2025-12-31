import { z } from "zod";

export const offerValidation = z
  .object({
    title: z.string().min(2, "Title must be at least 2 characters long"),

    description: z
      .string()
      .min(2, "Description must be at least 2 characters long")
      .max(500, "Description must be at most 500 characters long")
      .optional(),

    offerType: z.enum(
      ["PERCENT", "FLAT", "FREE_DELIVERY", "BOGO"],
      "Offer type must be one of the following: PERCENT, FLAT, FREE_DELIVERY, BOGO"
    ),

    discountValue: z
      .number()
      .min(0, "Discount value must be at least 0")
      .max(100, "Discount value must be at most 100")
      .optional(),

    maxDiscountAmount: z
      .number("Max discount amount must be a number")
      .min(0, "Max discount amount must be at least 0")
      .max(100, "Max discount amount must be at most 100")
      .optional(),

    buyQty: z.number("Buy quantity must be a number").optional(),

    getQty: z.number("Get quantity must be a number").optional(),

    itemId: z.string().optional(),

    startDate: z.date("Start date must be a valid date"),
    endDate: z.date("End date must be a valid date"),

    minOrderAmount: z
      .number()
      .min(0, "Minimum order amount must be at least 0")
      .optional(),

    code: z.string().optional(),
    isAutoApply: z.boolean("Auto apply must be a boolean").optional(),
  })
  .refine(
    (data) => {
      if (data.offerType === "BOGO" && !data.itemId) {
        return false;
      }
      return true;
    },
    {
      message: "Item id is required",
      path: ["itemId"],
    }
  );
