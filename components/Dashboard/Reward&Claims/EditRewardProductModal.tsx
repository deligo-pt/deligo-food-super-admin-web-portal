// src/components/Dashboard/Reward&Claims/EditRewardProductModal.tsx
"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
} from "@/components/ui/dialog";
import { useTranslation } from "@/hooks/use-translation";
import { updateRewardProduct } from "@/services/dashboard/reward&claims/reward-claims.service";
import { IRewardProduct } from "@/types/reward-claim.type";
import {
    RewardProductFormValues,
    updateRewardProductSchema,
} from "@/validations/reward-claim/reward-claim.validation";
import { useState } from "react";
import { toast } from "sonner";
import RewardProductForm, { RewardFormDirtyFields } from "./RewardProductForm";
import TitleHeader from "@/components/TitleHeader/TitleHeader";

interface IProps {
    product: IRewardProduct | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

// targetRole is excluded on purpose: the API rejects it on PATCH
const EDITABLE_KEYS = ["name", "requiredPoints", "cashPrice", "regularPrice", "isActive"] as const;

export default function EditRewardProductModal({ product, open, onOpenChange, onSuccess }: IProps) {
    const { t } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleUpdate = async (
        values: RewardProductFormValues,
        dirtyFields: RewardFormDirtyFields
    ) => {
        if (!product) return;

        // Send only the fields that changed (at least one is required)
        const diff: Record<string, unknown> = {};
        EDITABLE_KEYS.forEach((key) => {
            if (dirtyFields[key]) diff[key] = values[key];
        });

        const parsed = updateRewardProductSchema.safeParse(diff);
        if (!parsed.success) {
            toast.info(parsed.error.issues[0]?.message ?? "Nothing to update");
            return;
        }

        setIsSubmitting(true);
        const toastId = toast.loading("Saving changes...");
        try {
            const result = await updateRewardProduct(product._id, parsed.data);
            if (result?.success) {
                toast.success(result.message || "Reward product updated successfully.", { id: toastId });
                onOpenChange(false);
                onSuccess?.();
            } else {
                toast.error(result?.message || "Failed to update product", { id: toastId });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(o) => !isSubmitting && onOpenChange(o)}>
            <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto p-3">
                <DialogHeader className="pb-2">
                    <TitleHeader
                        title={`${t("edit_reward_product") || "Edit reward product"}${product ? ` — ${product.name}` : ""}`}
                        subtitle={t("edit_reward_product_note") || "Changes to points or prices apply to future claims only."}
                    />
                </DialogHeader>

                {product && (
                    <RewardProductForm
                        key={product._id}
                        mode="edit"
                        className="space-y-6"
                        defaultValues={{
                            name: product.name,
                            targetRole: product.targetRole,
                            requiredPoints: product.requiredPoints,
                            cashPrice: product.cashPrice,
                            regularPrice: product.regularPrice,
                            isActive: product.isActive,
                        }}
                        isSubmitting={isSubmitting}
                        onSubmit={handleUpdate}
                        onCancel={() => onOpenChange(false)}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}