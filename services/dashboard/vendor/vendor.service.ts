"use server";

import { serverRequest } from "@/lib/serverFetch";
import { TMeta } from "@/types";
import { TVendor } from "@/types/user.type";
import { catchAsync } from "@/utils/catchAsync";

export const getAllVendorsReq = async (
  queries: Record<string, string | undefined>,
): Promise<{ data: TVendor[]; meta?: TMeta }> => {
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
    isDeleted: false,
  };

  const result = await catchAsync<TVendor[]>(async () => {
    return await serverRequest.get("/vendors", {
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

export const getSingleVendorReq = async (id: string) => {
  const result = await catchAsync<TVendor>(async () => {
    return await serverRequest.get(`/vendors/${id}`);
  });

  if (result?.success) return result.data;

  return {};
};
