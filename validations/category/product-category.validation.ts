import z from "zod";

export const productCategoryValidation = z.object({
  name: z
    .string()
    .min(2, "Category name must be at least 2 characters long")
    .max(50, "Category name must be at most 50 characters long")
    .nonempty("Category name is required"),

  description: z.string().optional(),

  businessCategoryId: z.string().nonempty("Business category is required"),

  image: z
    .object({
      file: z.file().nullable(),
      url: z.string(),
    })
    .optional(),
});

export const updateProductCategoryValidation = z.object({
  name: z
    .string()
    .min(2, "Category name must be at least 2 characters long")
    .max(50, "Category name must be at most 50 characters long")
    .optional(),

  description: z.string().optional(),

  image: z
    .object({
      file: z.file().nullable(),
      url: z.string(),
    })
    .optional(),

  businessCategoryId: z.string().optional(),
});
