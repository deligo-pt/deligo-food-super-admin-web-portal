// src/components/Dashboard/Reward&Claims/EditRewardProduct.tsx
"use client";

import { useTranslation } from "@/hooks/use-translation";
import { updateRewardProduct } from "@/services/dashboard/reward&claims/reward-claims.service";
import { IRewardProduct } from "@/types/reward-claim.type";
import {
    RewardProductFormValues,
    updateRewardProductSchema,
} from "@/validations/reward-claim/reward-claim.validation";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import RewardProductForm, { RewardFormDirtyFields } from "./RewardProductForm";

interface IProps {
    product: IRewardProduct;
}

// targetRole is intentionally excluded: the API rejects it on PATCH
const EDITABLE_KEYS = ["name", "requiredPoints", "cashPrice", "regularPrice", "isActive"] as const;

const EditRewardProduct = ({ product }: IProps) => {
    const { t } = useTranslation();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleUpdate = async (
        values: RewardProductFormValues,
        dirtyFields: RewardFormDirtyFields
    ) => {
        // Docs: "Send only the fields you change; at least one is required."
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
                router.push("/admin/reward/product/all");
            } else {
                // includes 409 on renamed duplicate
                toast.error(result?.message || "Failed to update product", { id: toastId });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl font-semibold text-gray-900">
                    {t("edit_reward_product") || "Edit reward product"} — {product.name}
                </h1>
                <p className="text-sm text-gray-500">
                    {t("edit_reward_product_note") ||
                        "Changes to points or prices apply to future claims only. Existing claims keep their original values."}
                </p>
            </div>

            <RewardProductForm
                mode="edit"
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
                onCancel={() => router.back()}
            />
        </div>
    );
};

export default EditRewardProduct;