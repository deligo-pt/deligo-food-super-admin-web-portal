/* eslint-disable @typescript-eslint/no-explicit-any */

import { serverFetch } from "@/lib/fetchHelper";


export const getAllVendorAgreements = async (queryString?: string) => {
    try {
        const res = await serverFetch.get(
            `/agreements${queryString ? `?${queryString}` : ""}`,
            {
                next: {
                    revalidate: 30,
                },
            },
        );

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || "Failed to fetch agreements data");
        }

        const result = await res.json();


        return result || { success: false, data: [] };
    } catch (error: any) {
        console.error("Error inside getAllVendorAgreements execution context:", error);
        return {
            success: false,
            message: `${process.env.NODE_ENV === "development"
                ? error?.message
                : "Something went wrong in agreements data fetching."
                }`,
        };
    }
};

export const getSingleAgreement = async (agreementId: string) => {
    try {
        const response = await serverFetch.get(`/agreements/${agreementId}`, {
            next: {
                tags: ["agreement", `agreement-${agreementId}`],
                revalidate: 10
            }
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result?.message || "Failed to fetch agreement details");
        }

        return result?.data;
    } catch (error) {
        console.error("Get Single Agreement Error:", error);
        throw error;
    }
};