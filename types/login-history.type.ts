export type TLoginHistory = {
    _id: string;
    userId: string;
    email: string;
    userRole: "SUPER_ADMIN" | "ADMIN" | "DELIVERY_PARTNER" | "FLEET_MANAGER" | "VENDOR" | string;
    ipAddress: string;
    city: string;
    country: string;
    deviceType: string;
    browser: string;
    os: string;
    userAgent: string;
    status: "SUCCESS" | "FAILED" | string;
    sessionId: string;
    loginAt: string;
    durationSec: number;
};

export type TLoginHistoryResponse = {
    data: TLoginHistory[];
    meta: {
        total: number;
        totalPage: number;
        page: number;
        limit: number;
    };
}