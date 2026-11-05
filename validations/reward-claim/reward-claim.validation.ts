import { z } from "zod";

export const REWARD_TARGET_ROLES = ["Customer", "Rider", "Vendor"] as const;

const fields = {
    name: z
        .string()
        .trim()
        .min(1, { message: "Product name is required" })
        .max(120, { message: "Name must be 120 characters or fewer" }),
    requiredPoints: z
        .number({ message: "Required points is required" })
        .int({ message: "Points must be a whole number" })
        .min(1, { message: "Points must be at least 1" }),
    cashPrice: z
        .number({ message: "Cash price is required" })
        .min(0, { message: "Cash price cannot be negative" }),
    regularPrice: z
        .number({ message: "Regular price is required" })
        .min(0, { message: "Regular price cannot be negative" }),
    isActive: z.boolean(),
};

/** POST /rewards/admin/products  (strict body, targetRole required) */
export const createRewardProductSchema = z
    .object({
        targetRole: z.enum(REWARD_TARGET_ROLES, {
            message: "Select a target role",
        }),
        ...fields,
    })
    .strict();

/**
 * PATCH /rewards/admin/products/:id
 * - targetRole is NOT allowed (backend returns 400)
 * - at least one field is required
 */
export const updateRewardProductSchema = z
    .object(fields)
    .partial()
    .strict()
    .refine((obj) => Object.keys(obj).length > 0, {
        message: "Change at least one field before saving",
    });

export type CreateRewardProductInput = z.infer<typeof createRewardProductSchema>;
export type UpdateRewardProductInput = z.infer<typeof updateRewardProductSchema>;
export type RewardProductFormValues = CreateRewardProductInput;