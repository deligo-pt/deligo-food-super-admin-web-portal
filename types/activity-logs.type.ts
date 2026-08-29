import { ActivityActionTypeKey, ActivityEntityTypeKey } from "@/consts/activity-logs.const";
import { TMeta } from ".";

export type UserRole = 'ADMIN' | "SUPER_ADMIN" | 'VENDOR' | 'CUSTOMER' | "FLEET_MANAGER" | "DELIVERY_PARTNER" | string;

export type ActivityLogType = 'INFO' | 'WARNING' | 'DANGER' | string;

export const ActivityEntityType = {
    VENDOR: 'VENDOR',
    SUB_VENDOR: 'SUB_VENDOR',
    DELIVERY_PARTNER: 'DELIVERY_PARTNER',
    FLEET_MANAGER: 'FLEET_MANAGER',
    ADMIN: 'ADMIN',
    CUSTOMER: 'CUSTOMER',
    AUTH_USER: 'AUTH_USER',
    PRODUCT: 'PRODUCT',
    PRODUCT_CATEGORY: 'PRODUCT_CATEGORY',
    BUSINESS_CATEGORY: 'BUSINESS_CATEGORY',
    CUISINE_CATEGORY: 'CUISINE_CATEGORY',
    OFFER: 'OFFER',
    INGREDIENT: 'INGREDIENT',
    SPONSORSHIP: 'SPONSORSHIP',
    ORDER: 'ORDER',
    PAYOUT: 'PAYOUT',
    PAYMENT_TOKEN: 'PAYMENT_TOKEN',
    PERMISSION: 'PERMISSION',
    TAX: 'TAX',
    ZONE: 'ZONE',
    GLOBAL_SETTING: 'GLOBAL_SETTING',
    RESTRICTED_ITEM: 'RESTRICTED_ITEM',
    AGREEMENT: 'AGREEMENT',
    SOS: 'SOS',
    NOTIFICATION: 'NOTIFICATION',
    SUPPORT_TICKET: 'SUPPORT_TICKET',
    ADDON_GROUP: 'ADDON_GROUP',
};

interface TActivityMeta {
    newStatus?: string;
    previousPermissions?: string[],
    newPermissions?: string[];
    amount?: number;
    currency?: "EUR";
    previousStatus?: string;
    reason?: string;
    previousDeliveryPartnerId?: string;
    title?: string;
    last4?: string;
    fleetManagerId?: string;
    isOperational?: boolean;
}

export interface IActivityLog {
    _id: string;
    authUserId: string;
    userName: string;
    email: string;
    role: UserRole;
    action?: ActivityActionTypeKey;
    target: string;
    entityType?: ActivityEntityTypeKey,
    entityId?: string,
    type: ActivityLogType;
    createdAt: string;
    updatedAt: string;
    metadata?: TActivityMeta;
}


export interface ActivityLogResponse {
    meta: TMeta;
    data: IActivityLog[];
}