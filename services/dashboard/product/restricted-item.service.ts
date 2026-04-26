"use server";

import { serverRequest } from "@/lib/serverFetch";
import { TRestrictedItem } from "@/types/product.type";
import { catchAsync } from "@/utils/catchAsync";

type TRestrictedItemPayload = {
  name?: string;
  reason?: string;
  category?: string;
};

export const createRestrictedItemReq = async (data: TRestrictedItemPayload) => {
  return catchAsync<null>(async () => {
    return await serverRequest.post("/restricted-items/add", { data });
  });
};

export const updateRestrictedItemReq = async (
  id: string,
  data: TRestrictedItemPayload,
) => {
  return catchAsync<null>(async () => {
    return await serverRequest.patch(`/restricted-items/${id}`, { data });
  });
};

export const deleteRestrictedItemReq = async (id: string) => {
  return catchAsync<null>(async () => {
    return await serverRequest.delete(`/restricted-items/${id}`);
  });
};

export const getSingleRestrictedItemReq = async (id: string) => {
  const result = await catchAsync<TRestrictedItem>(async () => {
    return await serverRequest.get(`/restricted-items/${id}`);
  });

  if (result?.success) return result.data;

  return {};
};

export const getAllRestrictedItemsReq = async (
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
    isDeleted: false,
  };

  const result = await catchAsync<TRestrictedItem[]>(async () => {
    return await serverRequest.get("/restricted-items", {
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
