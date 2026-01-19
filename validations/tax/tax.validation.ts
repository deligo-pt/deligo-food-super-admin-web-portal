import { TAX_RATE } from "@/consts/tax.const";
import z from "zod";

export const taxValidation = z
  .object({
    taxName: z
      .string()
      .min(2, "Tax name must be at least 2 characters long")
      .max(50, "Tax name must be at most 50 characters long")
      .nonempty("Tax name is required"),

    taxCode: z.enum(
      Object.keys(TAX_RATE),
      "Tax code must be one of NOR, INT, RED, or ISE",
    ),

    taxRate: z
      .number()
      .min(0, "Tax rate must be at least 0")
      .max(23, "Tax rate must be at most 23")
      .refine(
        (value) => Object.values(TAX_RATE).includes(value),
        "Tax rate must be one of 0, 6, 13, or 23",
      ),

    countryID: z
      .string()
      .min(2, "Country ID must be at least 2 characters long")
      .max(50, "Country ID must be at most 50 characters long")
      .optional(),

    description: z
      .string()
      .min(10, "Description must be at least 10 characters long")
      .max(500, "Description must be at most 500 characters long")
      .nonempty("Description is required"),

    taxExemptionCode: z.string().optional(),

    taxExemptionReason: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.taxRate !== TAX_RATE[data.taxCode as keyof typeof TAX_RATE]) {
        return false;
      }
      return true;
    },
    {
      message: "Tax rate does not match tax code",
      path: ["taxRate"],
    },
  )
  .refine(
    (data) => {
      if (data.taxRate === 0 && !data.taxExemptionCode) {
        return false;
      }
      return true;
    },
    {
      message: "Tax exemption code is required if tax rate is 0",
      path: ["taxExemptionCode"],
    },
  )
  .refine(
    (data) => {
      if (data.taxRate === 0 && !data.taxExemptionReason) {
        return false;
      }
      return true;
    },
    {
      message: "Tax exemption reason is required if tax rate is 0",
      path: ["taxExemptionReason"],
    },
  );
