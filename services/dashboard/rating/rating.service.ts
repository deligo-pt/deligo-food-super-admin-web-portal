"use server";

import { serverRequest } from "@/lib/serverFetch";
import { TRating } from "@/types/rating.type";
import { catchAsync } from "@/utils/catchAsync";

export const getAllRatingsReq = async (
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

  const result = await catchAsync<TRating[]>(async () => {
    return await serverRequest.get("/ratings/get-all-ratings", {
      params,
    });
  });

  if (result?.success)
    return {
      data: result.data,
      meta: result.meta,
    };

  return {
    data: [],
  };
};

/**
 * Every rating left on one order: a PRODUCT rating per rated item and one
 * DELIVERY_PARTNER rating. The order itself only carries `isRated` /
 * `ratingStatus`; the stars and comments live here. The filter takes the
 * order's Mongo `_id` — the `ORD-…` code matches nothing.
 */
export const getOrderRatingsReq = async (orderObjectId: string) => {
  const result = await catchAsync<TRating[]>(async () => {
    return await serverRequest.get("/ratings/get-all-ratings", {
      params: { orderId: orderObjectId, limit: 50, sortBy: "createdAt" },
    });
  });

  if (result?.success && Array.isArray(result.data))
    return { ok: true as const, data: result.data };

  return { ok: false as const, data: [] as TRating[] };
};
