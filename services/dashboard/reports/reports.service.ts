/* eslint-disable @typescript-eslint/no-explicit-any */
import { serverFetch } from "@/lib/fetchHelper";


export const getSalesReportAnalytics = async (queryString?: string) => {
    try {
        const res = await serverFetch.get(`/analytics/admin-sales-report-analytics${queryString ? `?${queryString}` : ""}`, {
            next: {
                revalidate: 30
            }
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || "Failed to fetch sales analytics");
        }

        const result = await res.json();

        return result?.data || {};

    } catch (error: any) {
        console.log(error);
        return {
            success: false,
            message: `${process.env.NODE_ENV === 'development' ? error?.message : 'Something went wrong in sales analytics fetching.'}`
        };
    }
};

export const getCustomerReportAnalytics = async () => {
    try {
        const res = await serverFetch.get(`/analytics/admin-customer-report-analytics`, {
            next: {
                revalidate: 30
            }
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || "Failed to fetch customer analytics");
        }

        const result = await res.json();

        return result?.data || {};

    } catch (error: any) {
        console.log(error);
        return {
            success: false,
            message: `${process.env.NODE_ENV === 'development' ? error?.message : 'Something went wrong in customer analytics fetching.'}`
        };
    }
};

export const getVendorReportAnalytics = async () => {
    try {
        const res = await serverFetch.get(`/analytics/admin-vendor-report-analytics`, {
            next: {
                revalidate: 30
            }
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || "Failed to fetch vendor analytics");
        }

        const result = await res.json();

        return result?.data || {};

    } catch (error: any) {
        console.log(error);
        return {
            success: false,
            message: `${process.env.NODE_ENV === 'development' ? error?.message : 'Something went wrong in vendor analytics fetching.'}`
        };
    }
};

export const getFleetManagerReportAnalytics = async () => {
    try {
        const res = await serverFetch.get(`/analytics/admin-fleet-manager-report-analytics`, {
            next: {
                revalidate: 30
            }
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || "Failed to fetch fleet manager analytics");
        }

        const result = await res.json();

        return result?.data || {};

    } catch (error: any) {
        console.log(error);
        return {
            success: false,
            message: `${process.env.NODE_ENV === 'development' ? error?.message : 'Something went wrong in fleet manager analytics fetching.'}`
        };
    }
};

export const getDeliverPartnerReportAnalytics = async () => {
    try {
        const res = await serverFetch.get(`/analytics/admin-delivery-partner-report-analytics`, {
            next: {
                revalidate: 30
            }
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || "Failed to fetch delivery partner analytics");
        }

        const result = await res.json();

        return result?.data || {};

    } catch (error: any) {
        console.log(error);
        return {
            success: false,
            message: `${process.env.NODE_ENV === 'development' ? error?.message : 'Something went wrong in delivery partner analytics fetching.'}`
        };
    }
};