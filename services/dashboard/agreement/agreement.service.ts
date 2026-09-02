/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';
import { serverFetch } from "@/lib/fetchHelper";
import { catchAsync } from "@/utils/catchAsync";
// import { TUserAgreementForm } from "@/validations/agreements/agreement.validation";
import { revalidatePath, revalidateTag } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";


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
        if (isRedirectError(error)) {
            throw error;
        }
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
        if (isRedirectError(error)) {
            throw error;
        }
        console.error("Get Single Agreement Error:", error);
        throw error;
    }
};

// create agreement
// export const createAgreement = async (id: string, data: Partial<TUserAgreementForm>) => {
//     const result = await catchAsync(async () => {
//         const res = await serverFetch.post(`/agreements/party/${id}`, {
//             headers: {
//                 "Content-Type": "application/json",
//             },
//             body: JSON.stringify(data),
//         });

//         return await res.json();
//     });

//     if (result.success) {
//         revalidateTag("agreements", {});
//         revalidatePath("/become-vendor/agreement-sign");
//     };


//     return result;
// };


/**
 * draft agreement
 */

// create draft agreement
export const createDraftAgreement = async (data: any) => {
    const result = await catchAsync(async () => {
        const res = await serverFetch.post(`/agreement-versions`, {
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
        return await res.json();
    });

    if (result.success) {
        revalidateTag("agreement-versions", {});
        revalidatePath("/admin/agreements/all");
    };

    return result;
};


// get all agreements
export const getAllAgreements = async (query?: string) => {
    const result = await catchAsync(async () => {
        const res = await serverFetch.get(`/agreement-versions${query ? `?${query}` : ''}`, {
            next: {
                tags: ["agreement-versions"],
            }
        });
        return await res.json();
    });

    return result;
};

// get all agreements
export const getSingleAgreementVersion = async (versionId: string) => {
    const result = await catchAsync(async () => {
        const res = await serverFetch.get(`/agreement-versions/${versionId}`, {
            next: {
                tags: ["agreement-versions"],
            }
        });
        return await res.json();
    });

    return result;
};

