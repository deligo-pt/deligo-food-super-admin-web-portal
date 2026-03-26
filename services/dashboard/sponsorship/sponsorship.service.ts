"use server";

import { serverRequest } from "@/lib/serverFetch";
import { TSponsorship } from "@/types/sponsorship.type";
import { catchAsync } from "@/utils/catchAsync";

export const deleteSponsorshipReq = async (id: string) => {
  return catchAsync<null>(async () => {
    return await serverRequest.delete(`/sponsorships/soft-delete/${id}`);
  });
};

export const getAllSponsorshipsReq = async (
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

  const result = await catchAsync<TSponsorship[]>(async () => {
    return await serverRequest.get("/sponsorships", {
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

export const getSingleSponsorshipReq = async (id: string) => {
  const result = await catchAsync<TSponsorship>(async () => {
    return await serverRequest.get(`/sponsorships/${id}`);
  });

  if (result?.success) return result.data;

  return {};
};
