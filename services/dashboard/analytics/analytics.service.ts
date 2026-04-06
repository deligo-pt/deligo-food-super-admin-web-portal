"use server";

import { serverRequest } from "@/lib/serverFetch";
import { TMeta } from "@/types";
import { TAnalytics } from "@/types/analytics.type";
import { TCustomerInsights } from "@/types/analytics/customer-insights.type";
import { TDeliveryInsights } from "@/types/analytics/delivery-insights.type";
import { TPeakHoursAnalysis } from "@/types/analytics/peak-hour-analysis.type";
import { TSalesAnalytics } from "@/types/analytics/sales-analytics.type";
import { TTopVendors } from "@/types/analytics/top-vendors.type";
import { TPlaformEarningsData } from "@/types/payment.type";
import { catchAsync } from "@/utils/catchAsync";

export const getAdminDashboardReq = async () => {
  const result = await catchAsync<TAnalytics>(async () => {
    return await serverRequest.get("/analytics/admin/dashboard-analytics");
  });

  if (result?.success) return result.data;

  return {};
};

export const getPerformanceAnalyticsReq = async <T>(
  endPoint: string,
  queries: Record<string, string | undefined>,
) => {
  const limit = Number(queries?.limit || 10);
  const page = Number(queries.page || 1);
  const searchTerm = queries.searchTerm || "";
  const sortBy = queries.sortBy || "-createdAt";
  const status = queries.status || "";

  const params = {
    limit,
    page,
    sortBy,
    ...(searchTerm ? { searchTerm: searchTerm } : {}),
    ...(status ? { status: status } : {}),
  };

  const result = await catchAsync<T>(async () => {
    return await serverRequest.get(`/analytics/admin/${endPoint}`, {
      params,
    });
  });

  if (result.success) return { data: result.data, meta: result.meta };

  return { data: {}, meta: {} };
};

export const getSinglePerformanceReq = async <T>(endPoint: string) => {
  const result = await catchAsync<T>(async () => {
    return await serverRequest.get(`/analytics/admin/${endPoint}`);
  });

  if (result?.success) return result.data;

  return {};
};

export const getCustomerInsightsReq = async () => {
  const result = await catchAsync<TCustomerInsights>(async () => {
    return await serverRequest.get("/analytics/admin/customer-insights");
  });

  if (result?.success) return result.data;

  return {};
};

export const getDeliveryInsightsReq = async (
  queries: Record<string, string | undefined>,
) => {
  const limit = Number(queries?.limit || 10);
  const page = Number(queries.page || 1);
  const searchTerm = queries.searchTerm || "";
  const sortBy = queries.sortBy || "-createdAt";

  const params = {
    limit,
    page,
    sortBy,
    ...(searchTerm ? { searchTerm } : {}),
  };

  const result = await catchAsync<TDeliveryInsights>(async () => {
    return await serverRequest.get("/analytics/admin/delivery-insights", {
      params,
    });
  });

  if (result?.success) return result.data;

  return {};
};

export const getPeakHourAnalysisReq = async () => {
  const result = await catchAsync<TPeakHoursAnalysis>(async () => {
    return await serverRequest.get("/analytics/admin/peak-hours");
  });

  if (result?.success) return result.data;

  return {};
};

export const getPlatformEarningsReq = async (
  queries: Record<string, string | undefined>,
): Promise<{ data: TPlaformEarningsData; meta?: TMeta }> => {
  const limit = Number(queries?.limit || 10);
  const page = Number(queries.page || 1);
  const searchTerm = queries.searchTerm || "";
  const sortBy = queries.sortBy || "-createdAt";

  const params = {
    limit,
    page,
    sortBy,
    ...(searchTerm ? { searchTerm } : {}),
  };

  const result = await catchAsync<{ data: TPlaformEarningsData; meta?: TMeta }>(
    async () => {
      return await serverRequest.get("/analytics/admin/platform-earnings", {
        params,
      });
    },
  );

  return {
    data: result.data.data || [],
    meta: result.data.meta,
  };
};

export const getSalesAnalyticsReq = async () => {
  const result = await catchAsync<TSalesAnalytics>(async () => {
    return await serverRequest.get("/analytics/admin/sales-analytics");
  });

  if (result?.success) return result.data;

  return {};
};

export const getTopVendorsReq = async () => {
  const result = await catchAsync<TTopVendors>(async () => {
    return await serverRequest.get("/analytics/admin/top-vendors");
  });

  if (result?.success) return result.data;

  return {};
};
