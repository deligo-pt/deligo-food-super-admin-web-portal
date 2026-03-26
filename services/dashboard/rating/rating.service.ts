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
