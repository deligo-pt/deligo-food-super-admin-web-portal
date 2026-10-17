export type TSdrDepositState = "SCHEDULED" | "EFFECTIVE" | "SUPERSEDED" | "CANCELLED";

export type TSdrDeposit = {
    _id: string;
    depositAmount: number;
    currency: string;
    effectiveFrom: string; // ISO datetime
    isActive: boolean;
    note?: string | null;
    isCancelled: boolean;
    createdBy: string;
    cancelledBy?: string | null;
    cancelledAt?: string | null;
    createdAt: string;
    updatedAt: string;
    state: TSdrDepositState;
    __v?: number;
};

export type TEffectiveSdrDeposit = {
    isActive: boolean;
    depositAmount: number;
    currency: string;
    source: "SCHEDULE" | "MANUAL" | string;
    depositId: string;
    effectiveFrom: string; // ISO datetime
};