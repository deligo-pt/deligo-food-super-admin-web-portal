import z from "zod";

export const cuisineValidation = z.object({
    name: z.object({
        en: z.string().trim().max(50, "Max 50 characters allowed").optional(),
        pt: z.string().trim().max(50, "Max 50 characters allowed").optional(),
    }),

    image: z
        .object({
            file: z.file().nullable(),
            url: z.string(),
        })
        .optional(),

    currentLang: z.enum(["en", "pt"]),

})
    .superRefine((data, ctx) => {
        const value = data.name[data.currentLang];

        if (!value?.trim()) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["name", data.currentLang],
                message: "Cuisine name is required",
            });
        }
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

    isActive: z.boolean().optional()
});
