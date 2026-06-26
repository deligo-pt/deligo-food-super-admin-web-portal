/* eslint-disable @typescript-eslint/no-explicit-any */
import { serverFetch } from "@/lib/fetchHelper";
import { queryStringFormatter } from "@/utils/formatter";
import { isRedirectError } from "next/dist/client/components/redirect-error";

export const getSalesReportAnalytics = async (queryString?: string) => {
  try {
    const res = await serverFetch.get(
      `/analytics/admin/sales-report-analytics${queryString ? `?${queryString}` : ""}`,
      {
        next: {
          revalidate: 30,
        },
      },
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to fetch sales analytics");
    }

    const result = await res.json();

    return result?.data || {};
  } catch (error: any) {
    if (isRedirectError(error)) {
      throw error;
    }
    console.log(error);
    return {
      success: false,
      message: `${process.env.NODE_ENV === "development" ? error?.message : "Something went wrong in sales analytics fetching."}`,
    };
  }
};

export const getOrderReportAnalytics = async (queryString?: string) => {
  try {
    const res = await serverFetch.get(
      `/analytics/admin/order-report-analytics${queryString ? `?${queryString}` : ""}`,
      {
        next: {
          revalidate: 30,
        },
      },
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to fetch order analytics");
    }

    const result = await res.json();

    return result?.data || {};
  } catch (error: any) {
    if (isRedirectError(error)) {
      throw error;
    }
    console.log(error);
    return {
      success: false,
      message: `${process.env.NODE_ENV === "development" ? error?.message : "Something went wrong in order analytics fetching."}`,
    };
  }
};

export const getCustomerReportAnalytics = async (
  queries?: Record<string, string | undefined>,
) => {
  try {
    const res = await serverFetch.get(
      `/analytics/admin/customer-report-analytics?${queries ? queryStringFormatter(queries) : ""}`,
      {
        next: {
          revalidate: 30,
        },
      },
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.message || "Failed to fetch customer analytics",
      );
    }

    const result = await res.json();

    return result?.data || {};
  } catch (error: any) {
    if (isRedirectError(error)) {
      throw error;
    }
    console.log(error);
    return {
      success: false,
      message: `${process.env.NODE_ENV === "development" ? error?.message : "Something went wrong in customer analytics fetching."}`,
    };
  }
};

export const getVendorReportAnalytics = async (
  queries?: Record<string, string | undefined>,
) => {
  try {
    const res = await serverFetch.get(
      `/analytics/admin/vendor-report-analytics?${queries ? queryStringFormatter(queries) : ""}`,
      {
        next: {
          revalidate: 30,
        },
      },
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to fetch vendor analytics");
    }

    const result = await res.json();

    return result?.data || {};
  } catch (error: any) {
    if (isRedirectError(error)) {
      throw error;
    }
    console.log(error);
    return {
      success: false,
      message: `${process.env.NODE_ENV === "development" ? error?.message : "Something went wrong in vendor analytics fetching."}`,
    };
  }
};

export const getFleetManagerReportAnalytics = async (
  queries?: Record<string, string | undefined>,
) => {
  try {
    const res = await serverFetch.get(
      `/analytics/admin/fleet-manager-report-analytics?${queries ? queryStringFormatter(queries) : ""}`,
      {
        next: {
          revalidate: 30,
        },
      },
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.message || "Failed to fetch fleet manager analytics",
      );
    }

    const result = await res.json();

    return result?.data || {};
  } catch (error: any) {
    if (isRedirectError(error)) {
      throw error;
    }
    console.log(error);
    return {
      success: false,
      message: `${process.env.NODE_ENV === "development" ? error?.message : "Something went wrong in fleet manager analytics fetching."}`,
    };
  }
};

export const getDeliverPartnerReportAnalytics = async (
  queries?: Record<string, string | undefined>,
) => {
  try {
    const res = await serverFetch.get(
      `/analytics/admin/delivery-partner-report-analytics?${queries ? queryStringFormatter(queries) : ""}`,
      {
        next: {
          revalidate: 30,
        },
      },
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.message || "Failed to fetch delivery partner analytics",
      );
    }

    const result = await res.json();

    return result?.data || {};
  } catch (error: any) {
    if (isRedirectError(error)) {
      throw error;
    }
    console.log(error);
    return {
      success: false,
      message: `${process.env.NODE_ENV === "development" ? error?.message : "Something went wrong in delivery partner analytics fetching."}`,
    };
  }
};
