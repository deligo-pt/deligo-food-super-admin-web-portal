import z from "zod";

export const productCategoryValidation = z.object({
  name: z.object({
    en: z.string().trim().max(50, "Max 50 characters allowed").optional(),
    pt: z.string().trim().max(50, "Max 50 characters allowed").optional(),
  }),

  description: z.string().optional(),

  businessCategoryId: z.string().nonempty("Business category is required"),

  image: z.object(
    {
      file: z.file().nullable(),
      url: z.url("Image is required").nonempty("Image is required"),
    },
    "Image is required",
  ),
  currentLang: z.enum(["en", "pt"]),
})// Refinement logic to conditionally require the current language field
  .refine(
    (data) => {
      const currentLanguage = data.currentLang;
      const targetNameValue = data.name[currentLanguage];
      return !!targetNameValue && targetNameValue.trim().length > 0;
    },
    {
      message: "Category name is required for the active language",
      path: ["name"], // Points directly to the name object container in your form
    }
  )
  .superRefine((data, ctx) => {
    const currentLanguage = data.currentLang;
    const targetNameValue = data.name[currentLanguage];

    if (!targetNameValue || targetNameValue.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Category name is required",
        path: ["name", currentLanguage], // Highlights the exact active field in your UI form
      });
    }
  });

export const updateProductCategoryValidation = z.object({
  name: z
    .object({
      en: z.string().trim().max(50).optional(),
      pt: z.string().trim().max(50).optional(),
    })
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
