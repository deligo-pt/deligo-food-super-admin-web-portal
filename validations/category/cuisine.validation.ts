// src/validations/category/cuisine.validation.ts
import { validateSquareImage } from "@/utils/imageDimensions";
import z from "zod";

const imageSchema = z
    .object({
        file: z.file().nullable(),
        url: z.string(),
    })
    // Only a newly picked file is checked; an existing url (edit) has file: null
    .superRefine(async (img, ctx) => {
        if (!img.file) return;

        const error = await validateSquareImage(img.file);
        if (error) {
            ctx.addIssue({ code: "custom", message: error });
        }
    })
    .optional();

export const cuisineValidation = z.object({
    name: z.object({
        en: z.string().trim().max(50, "Max 50 characters allowed").optional(),
        pt: z.string().trim().max(50, "Max 50 characters allowed").optional(),
    }),

    image: imageSchema,

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
    name: z.object({
        en: z.string().trim().max(50, "Max 50 characters allowed").optional(),
        pt: z.string().trim().max(50, "Max 50 characters allowed").optional(),
    }),

    image: imageSchema,

    isActive: z.boolean().optional()
});