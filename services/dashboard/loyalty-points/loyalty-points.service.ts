"use server";

import { serverRequest } from "@/lib/serverFetch";
import { TMeta } from "@/types";
import { TLoyaltyPoint } from "@/types/loyalty-point.type";
import { catchAsync } from "@/utils/catchAsync";

export const getAllLoyaltyPointsReq = async (
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

  const result = await catchAsync<{ data: TLoyaltyPoint[]; meta: TMeta }>(
    async () => {
      return await serverRequest.get("/loyalties/all-points", {
        params,
      });
    },
  );

  if (result?.success)
    return {
      data: result.data,
      meta: result.meta,
    };

  return {
    data: [],
  };
};
