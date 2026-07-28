"use server";

import { serverRequest } from "@/lib/serverFetch";
import { TMeta } from "@/types";
import { TAgent } from "@/types/user.type";
import { catchAsync } from "@/utils/catchAsync";

export const getAllFleetManagersReq = async (
  queries: Record<string, string | undefined>,
): Promise<{ data: TAgent[]; meta?: TMeta }> => {
  const limit = Number(queries?.limit || 10);
  const page = Number(queries.page || 1);
  const searchTerm = queries.searchTerm || "";
  const sortBy = queries.sortBy || "-createdAt";
  const status = queries.status || "";
  const city = queries.city || "";

  const params = {
    limit,
    page,
    sortBy,
    ...(searchTerm ? { searchTerm: searchTerm } : {}),
    ...(status ? { status: status } : {}),
    ...(city ? { city: city } : {}),
    isDeleted: false,
  };

  const result = await catchAsync<TAgent[]>(async () => {
    return await serverRequest.get("/fleet-managers", {
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

export const getSingleFleetManagerReq = async (id: string) => {
  const result = await catchAsync<TAgent>(async () => {
    return await serverRequest.get(`/fleet-managers/${id}`);
  });

  return result;
};
