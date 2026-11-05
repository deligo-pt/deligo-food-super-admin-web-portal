// src/components/Dashboard/Reward&Claims/CreateRewardProduct.tsx
"use client";

import { useTranslation } from "@/hooks/use-translation";
import { createRewardProduct } from "@/services/dashboard/reward&claims/reward-claims.service";
import {
    createRewardProductSchema,
    RewardProductFormValues,
} from "@/validations/reward-claim/reward-claim.validation";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import RewardProductForm from "./RewardProductForm";
import TitleHeader from "@/components/TitleHeader/TitleHeader";

const CreateRewardProduct = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCreate = async (values: RewardProductFormValues) => {
        // Re-validate with the strict schema so no stray keys ever reach the API
        const parsed = createRewardProductSchema.safeParse(values);
        if (!parsed.success) {
            toast.error(parsed.error.issues[0]?.message ?? "Invalid data");
            return;
        }

        setIsSubmitting(true);
        const toastId = toast.loading("Creating product...");
        try {
            const result = await createRewardProduct(parsed.data);
            if (result?.success) {
                toast.success(result.message || "Reward product created successfully.", { id: toastId });
                router.push("/admin/reward/product/all");
            } else {
                // includes 409 REWARD_PRODUCT_ALREADY_EXISTS (same name for the same role)
                toast.error(result?.message || "Failed to create product", { id: toastId });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="">
            <TitleHeader
                title={t("create_reward_product") || "Create reward product"}
                subtitle={t("create_reward_product_subtitle") || "Set the points and cash price users need to claim this reward."}
            />

            <RewardProductForm
                mode="create"
                isSubmitting={isSubmitting}
                onSubmit={handleCreate}
                onCancel={() => router.back()}
            />
        </div>
    );
};

export default CreateRewardProduct;