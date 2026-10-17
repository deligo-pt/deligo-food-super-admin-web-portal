import { z } from "zod";

export const sdrDepositValidation = z
    .object({
        depositAmount: z
            .number({
                error: (issue) =>
                    issue.input === undefined
                        ? "Deposit amount is required"
                        : "Deposit amount must be a number",
            })
            .min(0, "Deposit amount cannot be negative")
            .max(5, "Deposit amount cannot exceed 5")
            .refine(
                (val) => Number.isFinite(val) && Math.round(val * 100) / 100 === val,
                "Only whole cents are allowed (e.g. 0.10, 1.25, 5.00)"
            ),

        isActive: z.boolean({
            error: "Active status is required",
        }),

        // Now date-only (YYYY-MM-DD)
        effectiveFrom: z
            .string()
            .optional()
            .or(z.literal(""))
            .refine(
                (val) => !val || /^\d{4}-\d{2}-\d{2}$/.test(val),
                "Must be a valid date (YYYY-MM-DD)"
            ),

        note: z
            .string()
            .trim()
            .min(1, "Note must be at least 1 character")
            .max(500, "Note cannot exceed 500 characters")
            .optional()
            .or(z.literal("")),
    })
    .superRefine((data, ctx) => {
        if (data.isActive && data.depositAmount <= 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Active deposits must have an amount greater than 0",
                path: ["depositAmount"],
            });
        }

        if (data.effectiveFrom) {
            const effective = new Date(data.effectiveFrom + "T00:00:00.000Z");
            const now = new Date();
            // Allow small tolerance
            if (effective.getTime() < now.getTime() - 60_000) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Effective date cannot be in the past",
                    path: ["effectiveFrom"],
                });
            }
        }
    });

export type TSdrDepositForm = z.infer<typeof sdrDepositValidation>;