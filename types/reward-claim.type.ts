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

// ---------------------------------------------------------------------------
// Reward claims
// ---------------------------------------------------------------------------
export type ClaimStatus = "PENDING" | "SCHEDULED" | "COLLECTED" | "CANCELLED";
export type ClaimHolderModel = "Customer" | "DeliveryPartner" | "Vendor";

export interface IClaimHolderProfile {
    _id: string;
    userId?: string; // e.g. "CUS-48213"
    name?: { firstName?: string; lastName?: string };
    email?: string;
    contactNumber?: string;
    profilePhoto?: string;
}

export interface IClaimHolder {
    id: IClaimHolderProfile | null; // null if the profile no longer exists
    model: ClaimHolderModel;
}

export interface IClaimProduct {
    _id: string;
    name: string;
    targetRole: RewardTargetRole;
    requiredPoints: number;
    cashPrice: number;
    regularPrice: number;
}

export interface IRewardClaim {
    _id: string;
    userId: IClaimHolder | null;
    productId: IClaimProduct | null; // null if the product no longer exists
    pointsSpent: number;
    cashAmount: number; // what the person pays at the office
    status: ClaimStatus;
    scheduledPickupDate?: string;
    year: number;
    remarks?: string;
    statusUpdatedBy?: string;
    createdAt: string;
    updatedAt: string;
    // pointsBreakdown exists on the API but is internal bookkeeping: never display it
}

export interface RewardClaimListResponse {
    data?: IRewardClaim[];
    meta?: TMeta;
}