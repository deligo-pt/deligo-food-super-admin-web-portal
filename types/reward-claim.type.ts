
import { TMeta } from "@/types";

export type RewardTargetRole = "Customer" | "Rider" | "Vendor";

export interface IRewardProduct {
    _id: string;
    name: string;
    targetRole: RewardTargetRole;
    requiredPoints: number;
    cashPrice: number;
    regularPrice: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface RewardProductListResponse {
    data?: IRewardProduct[];
    meta?: TMeta;
}