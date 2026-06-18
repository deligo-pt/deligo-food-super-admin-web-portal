"use server";

import { serverFetch } from "@/lib/fetchHelper";
import { serverRequest } from "@/lib/serverFetch";
import { TAdmin } from "@/types/admin.type";
import { catchAsync } from "@/utils/catchAsync";

export const getAllAdminsReq = async (
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

  const result = await catchAsync<TAdmin[]>(async () => {
    return await serverRequest.get("/admins", {
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

export const getAllAdmin = async () => {
  const url = `/admins`;

  const result = await catchAsync<TAdmin[]>(async () => {
    const res = await serverFetch.get(url, {
      next: {
        tags: ["admin-list"],
        revalidate: 30,
      },
    });
    return await res.json();
  });

  if (result?.success) return result;

  return null;
};
