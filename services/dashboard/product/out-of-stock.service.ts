"use server";

import { serverFetch } from "@/lib/fetchHelper";
import { serverRequest } from "@/lib/serverFetch";
import { TProduct } from "@/types/product.type";
import { catchAsync } from "@/utils/catchAsync";

export const getAllOutOfStocksReq = async (
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
    ...(searchTerm ? { searchTerm: searchTerm } : {}),
  };

  const result = await catchAsync<TProduct[]>(async () => {
    return await serverRequest.get("/products/out-of-stock-alerts", {
      params,
    });
  });

  if (result?.success)
    return {
      data: result.data || [],
      meta: result.meta,
    };

  return {
    data: [],
  };
};

export const notifyVendorReq = async (productId: string) => {
  return await catchAsync(async () => {
    const response = await serverFetch.post(`/products/notify-vendor/${productId}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    return result;
  });
};