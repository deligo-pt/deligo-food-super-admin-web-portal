/* eslint-disable @typescript-eslint/no-explicit-any */
import { serverFetch } from "@/lib/fetchHelper";


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