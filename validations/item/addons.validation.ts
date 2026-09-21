import { validateLocalizedField } from "@/consts/validation.const";
import z from "zod";

const localizedTextSchema = z.object({
    en: z.string().max(50, "Cannot exceed 50 characters").optional(),
    pt: z.string().max(50, "Cannot exceed 50 characters").optional()
});

export const createAddonOptionValidationSchema = z.object({
    name: localizedTextSchema,
    price: z.number("Price must be a number").min(1, "Price cannot be zero"),
    tax: z.string().nonempty("Tax is required"),

    currentLang: z.enum(["en", "pt"]),
})
    .superRefine((data, ctx) => {
        validateLocalizedField(
            data.name,
            data.currentLang,
            ctx,
            ["name"],
            "Name is required"
        );
    });

export const createAddonGroupValidationSchema = z.object({

    title: localizedTextSchema,

    minSelectable: z
        .number("Minimum selection must be a number")
        .min(0, "Minimum selection cannot be negative"),

    maxSelectable: z
        .number("Maximum selection must be a number")
        .min(1, "Maximum selection must be at least 1"),

    options: z
        .array(
            z.object({
                name: localizedTextSchema,
                price: z
                    .number("Price must be a number")
                    .min(0, "Price cannot be negative"),
                tax: z.string().min(1, "Tax selection is required"),
            })
        )
        .min(1, "At least one option must be provided in the group"),
    optionName: z.string().optional(),
    optionPrice: z.number().min(0).optional(),
    optionTax: z.string().optional(),

    currentLang: z.enum(["en", "pt"]),
})
    .superRefine((data, ctx) => {
        validateLocalizedField(
            data.title,
            data.currentLang,
            ctx,
            ["title"],
            "Title is required"
        );

        data.options.forEach((option, index) => {
            validateLocalizedField(
                option.name,
                data.currentLang,
                ctx,
                ["options", index, "name"],
                "Option name is required"
            );
        });
    })
    .refine((data) => data.minSelectable <= data.maxSelectable, {
        message: "Minimum selection cannot be greater than maximum selection",
        path: ["minSelectable"],
    })
    .refine((data) => data.maxSelectable <= data.options.length, {
        message: "Max selection cannot exceed the number of available options",
        path: ["maxSelectable"],
    })
    .refine((data) => data.options.length >= 1, {
        message: "At least one option must be provided in the group",
        path: ["optionTax"],
    });

