"use server";

import { serverRequest } from "@/lib/serverFetch";
import { catchAsync } from "@/utils/catchAsync";

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
