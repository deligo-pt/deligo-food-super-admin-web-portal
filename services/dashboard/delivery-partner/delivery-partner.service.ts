"use server";

import { serverRequest } from "@/lib/serverFetch";
import { TDeliveryPartner } from "@/types/delivery-partner.type";
import { catchAsync } from "@/utils/catchAsync";

export const getAllDeliveryPartnersReq = async (
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

  const result = await catchAsync<TDeliveryPartner[]>(async () => {
    return await serverRequest.get("/delivery-partners", {
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

export const getSingleDeliveryPartnerReq = async (id: string) => {
  const result = await catchAsync<TDeliveryPartner>(async () => {
    return await serverRequest.get(`/delivery-partners/${id}`);
  });

  if (result?.success) return result.data;

  return {};
};
