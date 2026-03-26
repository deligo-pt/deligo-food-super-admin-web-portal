"use server";

import { serverRequest } from "@/lib/serverFetch";
import { TMeta } from "@/types";
import { TOffer } from "@/types/offer.type";
import { catchAsync } from "@/utils/catchAsync";

export const createOfferReq = async (data: Partial<TOffer>) => {
  return catchAsync<null>(async () => {
    return await serverRequest.post("/offers/create-offer", {
      data,
    });
  });
};

export const updateOfferReq = async (id: string, data: Partial<TOffer>) => {
  return catchAsync<null>(async () => {
    return await serverRequest.patch(`/offers/${id}`, {
      data,
    });
  });
};

export const deleteOfferReq = async (id: string) => {
  return catchAsync<null>(async () => {
    return await serverRequest.delete(`/offers/soft-delete/${id}`);
  });
};

export const getSingleOfferReq = async (id: string) => {
  const result = await catchAsync<TOffer>(async () => {
    return await serverRequest.get(`/offers/${id}`);
  });

  if (result?.success) return result.data;

  return {};
};

export const getAllOffersReq = async (
  queries: Record<string, string | undefined>,
): Promise<{ data: TOffer[]; meta?: TMeta }> => {
  const limit = Number(queries?.limit || 10);
  const page = Number(queries.page || 1);
  const searchTerm = queries.searchTerm || "";
  const sortBy = queries.sortBy || "-createdAt";
  const vendorId = queries.vendorId;
  const activeStatus = queries.activeStatus;
  const validStatus = queries.validStatus;

  const params = {
    limit,
    page,
    sortBy,
    ...(searchTerm ? { searchTerm } : {}),
    ...(vendorId ? { vendorId } : {}),
    ...(activeStatus ? { isActive: activeStatus !== "ACTIVE" } : {}),
    ...(validStatus ? { isExpired: validStatus !== "VALID" } : {}),
    isDeleted: false,
  };

  const result = await catchAsync<TOffer[]>(async () => {
    return await serverRequest.get("/offers", {
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
