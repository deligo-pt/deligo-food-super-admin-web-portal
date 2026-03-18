"use server";

import { serverRequest } from "@/lib/serverFetch";
import { TVendor } from "@/types/user.type";
import { catchAsync } from "@/utils/catchAsync";

export const getAllVendorsReq = async (
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
