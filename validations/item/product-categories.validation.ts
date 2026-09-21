import z from "zod";

export const productCategoryValidation = z.object({
    name: z.object({
        en: z.string().trim().max(50, "Max 50 characters allowed").optional(),
        pt: z.string().trim().max(50, "Max 50 characters allowed").optional(),
    }),

    isActive: z.boolean().optional(),

    currentLang: z.enum(["en", "pt"]),
})
    .superRefine((data, ctx) => {
        const currentLanguage = data.currentLang;
        const targetNameValue = data.name[currentLanguage];

        if (!targetNameValue || targetNameValue.length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Category name is required",
                path: ["name", currentLanguage],
            });
        }
    });