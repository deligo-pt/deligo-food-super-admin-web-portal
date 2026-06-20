import z from "zod";

export const ingredientSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters long")
    .max(50, "Name must be at most 50 characters long")
    .nonempty("Name is required"),

  category: z
    .string()
    .min(2, "Category must be at least 2 characters long")
    .max(50, "Category must be at most 50 characters long")
    .nonempty("Category is required"),

  description: z.string().optional(),

  price: z
    .number({ error: "Price must be a number" })
    .min(0, "Price must be a positive number"),

  tax: z.string().nonempty("Tax is required"),

  unit: z.enum(["kg", "g", "litre", "ml", "piece", "packet", "box"], {
    error: "Please select a valid unit",
  }),

  stock: z
    .number({ error: "Stock must be a number" })
    .min(0, "Stock must be a positive number"),

  lowStockAlert: z.number().min(0, "Alert must be positive").optional().default(5),

  minOrder: z
    .number({ error: "Minimum order quantity must be a number" })
    .min(1, "Minimum order quantity must be at least 1")
    .optional()
    .default(1),

  image: z
    .url("Image must be a valid hosted URL string")
    .nonempty("Image is required"),

  shelfLifeDays: z
    .preprocess(
      (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
      z.number().min(0).optional()
    ),

  bulkDiscount: z
    .array(
      z.object({
        minQty: z.number().min(1),
        discountPrice: z.number().min(0),
      })
    )
    .optional(),
});