import { validateLocalizedField } from "@/consts/validation.const";
import { z } from "zod";

const localizedTextSchema = z.object({
    en: z.string().optional(),
    pt: z.string().optional(),
});

export const productValidation = z.object({
    name: localizedTextSchema,

    description: localizedTextSchema,

    category: z
        .string()
        .min(2, "Category must be at least 2 characters")
        .max(50, "Category must be at most 50 characters")
        .nonempty("Category is required"),

    additionalCategories: z.array(z.string().optional()).optional(),

    images: z
        .array(
            z
                .url("Each image must be a valid URL")
                .nonempty("Image URL is required"),
        )
        .min(1, "At least one image is required")
        .max(5, "No more than 5 images are allowed"),

    price: z.number().optional(),

    discountType: z.enum(["PERCENTAGE", "FLAT"]),

    taxId: z.string().nonempty("Tax is required"),

    discount: z.number().min(0).max(100),

    quantity: z.number().optional(),

    unit: z.string().optional(),

    availabilityStatus: z.string().optional(),

    addonGroups: z.array(z.string()),

    variations: z.array(
        z.object({
            name: localizedTextSchema,
            options: z.array(
                z.object({
                    label: localizedTextSchema,
                    price: z.number().min(0),
                    stockQuantity: z.number().optional(),
                }),
            ),
        }),
    ),

    isFeatured: z.boolean().optional(),

    isAvailableForPreOrder: z.boolean().optional(),

    isActive: z.boolean().optional(),

    businessTypeSlug: z.string(),
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

        // validateLocalizedField(
        //     data.description,
        //     data.currentLang,
        //     ctx,
        //     ["description"],
        //     "Description is required"
        // );

        // discount type and value validation
        // if (
        //   data.discountType === "PERCENTAGE" &&
        //   data.discount > 100
        // ) {
        //   ctx.addIssue({
        //     code: "custom",
        //     path: ["discount"],
        //     message: "Percentage discount cannot exceed 100%.",
        //   });
        // }

        // if (data?.price &&
        //   data.discountType === "FLAT" &&
        //   data?.discount > data.price
        // ) {
        //   ctx.addIssue({
        //     code: "custom",
        //     path: ["discount"],
        //     message: "Flat discount cannot exceed the product price.",
        //   });
        // }
    })
    .refine(
        (data) => {
            if (data.variations.length === 0 && !data.price) {
                return false;
            }
            return true;
        },
        {
            message: "Price is required",
            path: ["price"],
        },
    )
    .refine(
        (data) => {
            if (data.variations.length === 0 && data.price && data.price < 0) {
                return false;
            }
            return true;
        },
        {
            message: "Price cannot be negative",
            path: ["price"],
        },
    )
    .refine(
        (data) => {
            if (
                data.businessTypeSlug !== "restaurant" &&
                data.variations.length === 0 &&
                !data.quantity
            ) {
                return false;
            }
            return true;
        },
        {
            message: "Quantity is required",
            path: ["quantity"],
        },
    )
    .refine(
        (data) => {
            if (
                data.businessTypeSlug !== "restaurant" &&
                data.variations.length === 0 &&
                data.quantity &&
                data.quantity < 0
            ) {
                return false;
            }
            return true;
        },
        {
            message: "Quantity cannot be negative",
            path: ["quantity"],
        },
    );

export const variationOptionValidation = z.object({
    label: localizedTextSchema,
    price: z.number().min(0, "Price must be at least 0"),
    stockQuantity: z.number().min(0, "Stock quantity must be at least 0"),
});

export const variationValidation = z.object({
    name: localizedTextSchema,
    options: z
        .array(variationOptionValidation)
        .min(1, "At least one option is required"),

    currentLang: z.enum(["en", "pt"]),

}).superRefine((data, ctx) => {
    validateLocalizedField(
        data.name,
        data.currentLang,
        ctx,
        ["name"],
        "Name is required"
    );
})
