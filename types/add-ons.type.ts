import { TTax } from "./tax.type";

type LocalizedType = {
    en?: string;
    pt?: string;
}


export type TAddonOptionSdr = {
    applicable: boolean;
    containerCount: number;
};

export type TAddonOption = {
    _id?: string;
    name: LocalizedType;
    sku?: string;
    price: number;
    tax: TTax | string;
    isActive?: boolean;
    sdr?: TAddonOptionSdr;
};

export type TAddonGroup = {
    _id: string;
    vendorId?: string;
    title: LocalizedType;
    minSelectable: number;
    maxSelectable: number;
    options: TAddonOption[];
    isActive: boolean;
    isDeleted: boolean;
};
