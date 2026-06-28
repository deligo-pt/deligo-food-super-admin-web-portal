'use server';

import { serverFetch } from "@/lib/fetchHelper";
import { TCuisine } from "@/types/cuisine.type";
import { catchAsync } from "@/utils/catchAsync";


export const createCuisine = async (
    data: {
        name: {
            en: string,
            pt: string,
        }
    },
    image?: File | null,
) => {
    return catchAsync(async () => {
        const formData = new FormData();
        formData.append("data", JSON.stringify(data));

        if (image) formData.append("file", image);

        const response = await serverFetch.post("/categories/cuisine/create", {
            body: formData,
        });
        const result = await response.json();

        return result;
    });
};

export const getAllCuisine = async (queryString?: string) => {
    let cleanQueryString = "";
    let activeLang = "en";

    if (queryString) {
        const params = new URLSearchParams(queryString);

        if (params.has("lang")) {
            activeLang = params.get("lang") || "en";
            params.delete("lang");
        }

        cleanQueryString = params.toString();
    }

    const result = await catchAsync(async () => {
        const url = `/categories/cuisine${cleanQueryString ? `?${cleanQueryString}` : ""}`;

        const res = await serverFetch.get(url, {
            headers: {
                "Accept-Language": activeLang,
            },
            next: {
                tags: ["cuisine-list"],
            },
        });
        return await res.json();
    });

    if (result?.success) return result;

    return null;
};

// Get Single Cuisine by ID
export const getSingleCuisine = async (id: string, lang: "en" | "pt") => {
    return catchAsync(async () => {
        const res = await serverFetch.get(`/categories/cuisine/${id}`, {
            headers: {
                "Accept-Language": lang
            }
        });
        return await res.json();
    });
};

// update cuisine
export const updateCuisine = async (
    cuisineId: string,
    data: Partial<TCuisine>,
    image?: File | null,
) => {
    return catchAsync(async () => {
        const formData = new FormData();
        if (data) {
            formData.append("data", JSON.stringify(data));
        }

        if (image) {
            formData.append("file", image);
        }

        const response = await serverFetch.patch(`/categories/cuisine/${cuisineId}`, {
            body: formData,
        });
        const result = await response.json();

        return result;
    });
};

// Soft Delete Cuisine
export const softDeleteCuisineReq = async (id: string) => {
    return catchAsync(async () => {
        const res = await serverFetch.delete(`/categories/cuisine/soft-delete/${id}`, {
            method: "DELETE"
        });
        return await res.json();
    });
};

// Permanent Delete Cuisine
export const permanentDeleteCuisineReq = async (id: string) => {
    return catchAsync(async () => {
        const res = await serverFetch.delete(`/categories/cuisine/permanent-delete/${id}`, {
            method: "DELETE"
        });
        return await res.json();
    });
};