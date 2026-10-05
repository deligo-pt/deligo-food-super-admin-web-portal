import { TMeta } from "@/types";

export type TExceptionLocation = {
    latitude: number;
    longitude: number;
    capturedAt: string;
    isStale: boolean;
};

export type TLastKnownLocation = {
    latitude: number;
    longitude: number;
    lastLocationUpdate: string;
};

export type TDeliveryPartner = {
    deliveryPartnerId: string;
    userId: string;
    name: string;
    contactNumber: string;
    lastKnownLocation: TLastKnownLocation;
};

export type TDeliveryOtp = {
    attempts: number;
    maxAttempts: number;
    lockedAt: string | null;
    generation: number;
    resetCount: number;
};

export type TExceptionDetails = {
    type: string;
    status: string;
    resolution: string | null;
    openedAt: string;
    lastReportedAt: string;
    reportCount: number;
    sosId: string;
    issueTags: string[];
    riderNote: string | null;
    location: TExceptionLocation;
    acknowledgedAt: string | null;
    resolvedAt: string | null;
    resolutionNote: string | null;
};

export type TDeliveryException = {
    orderId: string;
    orderStatus: string;
    exception: TExceptionDetails;
    deliveryPartner: TDeliveryPartner;
    vendorName: string;
    deliveryOtp: TDeliveryOtp;
};

export type TDeliveryExceptionsResponse = {
    success: boolean;
    message: string;
    meta: TMeta;
    data: TDeliveryException[];
};