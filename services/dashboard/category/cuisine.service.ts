'use server';

import { serverFetch } from "@/lib/fetchHelper";
import { catchAsync } from "@/utils/catchAsync";


export const createCuisine = async (
    data: {
        name: string
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


export const getAllCuisine = async () => {

    const result = await catchAsync(async () => {
        const res = await serverFetch.get("/categories/cuisine", {
            next: {
                tags: ["cuisine-list"],
            },
        });
        return await res.json();
    });

    if (result?.success) return result;

    return null;
};