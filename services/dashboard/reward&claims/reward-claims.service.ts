/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { catchAsync } from "@/utils/catchAsync";
import { serverFetch } from "@/lib/fetchHelper";

// rewards related apis
// CREATE REWARD PRODUCT
export const createRewardProduct = async (data: any) => {
    const result = await catchAsync(async () => {
        const res = await serverFetch.post(`/rewards/admin/products`, {
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        return await res.json();
    });

    if (result.success) {
        revalidateTag("reward-products", {});
        revalidatePath("/admin/reward/product/all");
    }
    return result;
};

// GET ALL REWARD PRODUCT
export const getAllRewardProducts = async (queryString?: string) => {
    const url = `/rewards/admin/products${queryString ? `?${queryString}` : ""}`;

    const result = await catchAsync<any>(async () => {
        const res = await serverFetch.get(url, {
            next: {
                tags: ["reward-products"],
            },
        });
        return await res.json();
    });

    return result;
};

// UPDATE REWARD PRODUCT
export const updateRewardProduct = async (productId: string, data: Partial<any>) => {
    const result = await catchAsync<any>(async () => {
        const res = await serverFetch.patch(`/rewards/admin/products/${productId}`, {
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        return await res.json();
    });

    if (result.success) {
        revalidateTag("reward-products", {});
        revalidatePath("/admin/reward/product/all");
    }

    return result;
};


// claims related apis
// all claimed rewards
export const getAllClaimedRewards = async (queryString?: string) => {
    const url = `/rewards/admin/claims${queryString ? `?${queryString}` : ""}`;

    const result = await catchAsync<any>(async () => {
        const res = await serverFetch.get(url, {
            next: {
                tags: ["reward-claims"],
            },
        });
        return await res.json();
    });

    return result;
};

// UPDATE CLAIMED REWARD
export const updateClaimedReward = async (claimId: string, data: Partial<any>) => {
    const result = await catchAsync<any>(async () => {
        const res = await serverFetch.patch(`/rewards/admin/claims/${claimId}/status/`, {
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        return await res.json();
    });

    if (result.success) {
        revalidateTag("reward-claims", {});
        revalidatePath("/admin/reward/claims");
    }

    return result;
};