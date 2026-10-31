import { validateLocalizedField } from "@/consts/validation.const";
import z from "zod";

const localizedTextSchema = z.object({
    en: z.string().max(50, "Cannot exceed 50 characters").optional(),
    pt: z.string().max(50, "Cannot exceed 50 characters").optional(),
});

export const createAddonOptionValidationSchema = z
    .object({
        name: localizedTextSchema,
        price: z.number("Price must be a number").min(0, "Price cannot be negative"),
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

/** One option inside a group. Existing options also carry _id / sku. */
const addonGroupOptionSchema = z.object({
    _id: z.string().optional(),
    sku: z.string().optional(),
    isActive: z.boolean().optional(),
    name: localizedTextSchema,
    price: z.number("Price must be a number").min(0, "Price cannot be negative"),
    tax: z.string().min(1, "Tax selection is required"),
    // only present when SDR is ON for this option
    sdr: z
        .object({
            applicable: z.boolean(),
            containerCount: z
                .number("Container count must be a number")
                .min(1, "Container count must be at least 1"),
        })
        .optional(),
});

export const createAddonGroupValidationSchema = z
    .object({
        title: localizedTextSchema,

        minSelectable: z
            .number("Minimum selection must be a number")
            .int("Minimum selection must be a whole number")
            .min(0, "Minimum selection cannot be negative"),

        maxSelectable: z
            .number("Maximum selection must be a number")
            .int("Maximum selection must be a whole number")
            .min(1, "Maximum selection must be at least 1"),

        options: z
            .array(addonGroupOptionSchema)
            .min(1, "At least one option must be provided in the group"),

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
    // skip when there are no options: that case already has its own error
    .refine(
        (data) => data.options.length === 0 || data.maxSelectable <= data.options.length,
        {
            message: "Max selection cannot exceed the number of available options",
            path: ["maxSelectable"],
        }
    );