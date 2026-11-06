import { z } from "zod";
import type { ClaimStatus } from "@/types/reward-claim.type";

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

// claim related validation
export const CLAIM_STATUSES = ["PENDING", "SCHEDULED", "COLLECTED", "CANCELLED"] as const;
export const CLAIM_UPDATE_STATUSES = ["SCHEDULED", "COLLECTED", "CANCELLED"] as const;

/** Allowed transitions (anything else is 409 REWARD_CLAIM_STATUS_INVALID). COLLECTED/CANCELLED are final. */
export const CLAIM_TRANSITIONS: Record<ClaimStatus, readonly ClaimStatus[]> = {
    PENDING: ["SCHEDULED", "COLLECTED", "CANCELLED"],
    SCHEDULED: ["COLLECTED", "CANCELLED"],
    COLLECTED: [],
    CANCELLED: [],
};

/** The admin UI only offers these two actions. */
export const CLAIM_UI_ACTIONS = ["COLLECTED", "CANCELLED"] as const;

export const remarksField = z
    .string()
    .trim()
    .max(500, { message: "Remarks must be 500 characters or fewer" });

/** Modal form (just the remarks box) */
export const claimRemarksFormSchema = z.object({
    remarks: remarksField,
});

/** PATCH /rewards/admin/claims/:id/status */
export const updateClaimStatusSchema = z
    .object({
        status: z.enum(CLAIM_UPDATE_STATUSES, { message: "Select a valid status" }),
        remarks: remarksField.optional(),
    })
    .strict();

export type ClaimRemarksFormValues = z.infer<typeof claimRemarksFormSchema>;
export type UpdateClaimStatusInput = z.infer<typeof updateClaimStatusSchema>;
export type ClaimUiAction = (typeof CLAIM_UI_ACTIONS)[number];