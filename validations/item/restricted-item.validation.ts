import { RESTRICTED_CATEGORIES } from "@/consts/item.const";
import { z } from "zod";

export const restrictedItemValidation = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters long")
    .nonempty("Name is required"),

  category: z.enum(
    RESTRICTED_CATEGORIES.map((cat) => cat.value) as [string, ...string[]],
    "Category must be one of the following: ALCOHOL, TOBACCO, DANGEROUS_GOODS, OTHER",
  ),

  reason: z
    .string()
    .min(5, "Reason must be at least 5 characters long")
    .nonempty("Reason is required"),
});
