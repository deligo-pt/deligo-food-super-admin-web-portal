import z from "zod";

export const cuisineValidation = z.object({
    name: z
        .string()
        .min(2, "Cuisine name must be at least 2 characters long")
        .max(50, "Cuisine name must be at most 50 characters long")
        .nonempty("Cuisine name is required"),

    image: z
        .object({
            file: z.file().nullable(),
            url: z.string(),
        })
        .optional(),
});

export const updateCuisineValidation = z.object({
    name: z
        .string()
        .min(2, "Cuisine name must be at least 2 characters long")
        .max(50, "Cuisine name must be at most 50 characters long")
        .optional(),

    image: z
        .object({
            file: z.file().nullable(),
            url: z.string(),
        })
        .optional(),
});
