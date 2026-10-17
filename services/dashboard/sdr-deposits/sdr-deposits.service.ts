'use server';

import { serverFetch } from "@/lib/fetchHelper";
import { catchAsync } from "@/utils/catchAsync";
import { revalidatePath, revalidateTag } from "next/cache";

export type CreateSdrDepositPayload = {
    depositAmount: number;
    isActive: boolean;
    effectiveFrom?: string;
    note?: string;
};

export const createSdrDeposit = async (data: CreateSdrDepositPayload) => {
    const result = await catchAsync(async () => {
        const res = await serverFetch.post(`/sdr-deposits`, {
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        return await res.json();
    });

    if (result.success) {
        revalidateTag("sdr-deposits", {});
        revalidatePath("/admin/sdr/all");
    }

    return result;
};