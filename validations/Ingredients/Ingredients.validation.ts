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

  description: z
    .string()
    .min(5, "Description must be at least 5 characters long")
    .max(500, "Description must be at most 500 characters long")
    .optional(),

  price: z
    .number("Price must be a number")
    .min(0, "Price must be a positive number"),

  stock: z
    .number("Stock must be a number")
    .min(0, "Stock must be a positive number"),

  minOrder: z
    .number("Minimum order quantity must be a number")
    .min(1, "Minimum order quantity must be at least 1")
    .optional(),

  image: z.object({
    url: z.url("Image URL must be a valid URL"),
    file: z.file("Image file is required").nullable(),
  }),
});
