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


// GET ALL SDR DEPOSITS
export const getAllSdrDeposits = async (queryString?: string) => {
    const url = `/sdr-deposits${queryString ? `?${queryString}` : ""}`;

    const result = await catchAsync(async () => {
        const res = await serverFetch.get(url, {
            next: {
                tags: ["sdr-deposits"],
            },
        });
        return await res.json();
    });

    return result;
};


export const cancelSdrDeposit = async (id: string) => {
    const result = await catchAsync(async () => {
        const res = await serverFetch.delete(`/sdr-deposits/${id}`);
        return await res.json();
    });

    if (result.success) {
        revalidateTag("sdr-deposits", {});
        revalidatePath("/admin/sdr-deposits");
    }

    return result;
};