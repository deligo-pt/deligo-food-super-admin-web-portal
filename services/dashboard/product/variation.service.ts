"use server";

import { serverRequest } from "@/lib/serverFetch";
import { catchAsync } from "@/utils/catchAsync";
import { TResponse } from "@/types";
import { TProduct } from "@/types/product.type";

type LocalizedType = {
    en?: string;
    pt?: string;
};
interface IVariation {
    name: {
        en?: string | undefined;
        pt?: string | undefined;
    };
    options: {
        label: {
            en?: string | undefined;
            pt?: string | undefined;
        };
        price: number;
        stockQuantity: number;
    }[];
}

export const addVariationReq = async (
    productId: string,
    data: Partial<IVariation>,
) => {
    return catchAsync<null>(async () => {
        return await serverRequest.patch(
            `/products/manage-product-variations/${productId}`,
            { data },
        );
    });
};

export const renameVariationReq = async (
    productId: string,
    data: {
        oldName: string;
        newName?: LocalizedType;
        oldLabel?: string;
        newLabel?: LocalizedType;
    },
) => {
    return catchAsync<null>(async () => {
        return await serverRequest.patch(
            `/products/rename-product-variations/${productId}`,
            { data },
        );
    });
};

export const updateVariationPrice = async (
    productId: string,
    data: {
        variationSku: string;
        newPrice: number;
    },
) => {
    return catchAsync<null>(async () => {
        return await serverRequest.patch(
            `/products/update-inventory-and-pricing/${productId}`,
            { data },
        );
    });
};

export const removeVariationReq = async (
    productId: string,
    data: {
        name: string;
        labelToRemove?: string;
    },
) => {
    return catchAsync<null>(async () => {
        return await serverRequest.patch(
            `/products/remove-product-variations/${productId}`,
            { data },
        );
    });
};

/**
 * One vendor's whole catalogue, just what the "Clone variations" picker
 * needs (plan.md §11.5): 500 a page, every page, deleted ones left out.
 */
export const getVendorProductsForVariationCloneReq = async (vendorMongoId: string, lang: "en" | "pt") => {
    return catchAsync<TProduct[]>(async () => {
        const all: TProduct[] = [];
        for (let page = 1; page <= 20; page++) {
            const result = (await serverRequest.get("/products", {
                params: { vendorId: vendorMongoId, limit: 500, page, fields: "productId,name,variations,category,image,isDeleted" },
                headers: { "Accept-Language": lang },
            })) as TResponse<TProduct[]>;
            if (!result?.success) return result;
            // The admin list includes deleted products (`isDeleted: true`).
            all.push(...(result.data ?? []).filter((product) => product.isDeleted !== true));
            if (page >= (result.meta?.totalPage ?? 1) || !result.data?.length) break;
        }
        return { success: true, message: "", data: all } as TResponse<TProduct[]>;
    });
};
