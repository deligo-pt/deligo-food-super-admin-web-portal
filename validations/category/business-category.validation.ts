import z from "zod";

export const businessCategoryValidation = z.object({
  name: z
    .string()
    .min(2, "Category name must be at least 2 characters long")
    .max(50, "Category name must be at most 50 characters long")
    .nonempty("Category name is required"),

  description: z.string().optional(),

  icon: z.string().optional(),

  image: z.string().optional(),
});

export const updateBusinessCategoryValidation = z.object({
  name: z
    .string()
    .min(2, "Category name must be at least 2 characters long")
    .max(50, "Category name must be at most 50 characters long")
    .optional(),

  description: z.string().optional(),

  icon: z.string().optional(),

  image: z.string().optional(),
});
