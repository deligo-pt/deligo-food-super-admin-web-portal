import { TMeta } from ".";

export type UserRole = 'ADMIN' | "SUPER_ADMIN" | 'VENDOR' | 'CUSTOMER' | "FLEET_MANAGER" | "DELIVERY_PARTNER" | string;

export type ActivityLogType = 'INFO' | 'WARNING' | 'DANGER' | string;

export interface IActivityLog {
    _id: string;
    authUserId: string;
    userName: string;
    email: string;
    role: UserRole;
    action: string;
    target: string;
    type: ActivityLogType;
    createdAt: string;
    updatedAt: string;
    __v: number;
}


export interface ActivityLogResponse {
    meta: TMeta;
    data: IActivityLog[];
}