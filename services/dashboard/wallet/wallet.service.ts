"use server";

import { serverRequest } from "@/lib/serverFetch";
import { TWallet } from "@/types/wallet.type";
import { catchAsync } from "@/utils/catchAsync";

export const getSingleWalletReq = async (id: string) => {
  const result = await catchAsync<TWallet>(async () => {
    return await serverRequest.get(`/wallets/${id}`);
  });

  if (result?.success) return result.data;

  return {};
};

export const getAllWalletsReq = async (
  queries: Record<string, string | undefined>,
) => {
  const limit = Number(queries?.limit || 10);
  const page = Number(queries.page || 1);
  const searchTerm = queries.searchTerm || "";
  const sortBy = queries.sortBy || "-createdAt";
  const userModel = (queries.userModel || "Vendor") as
    | "Vendor"
    | "FleetManager";

  const params = {
    limit,
    page,
    sortBy,
    ...(searchTerm ? { searchTerm } : {}),
    ...(userModel ? { userModel } : {}),
  };

  const result = await catchAsync<TWallet[]>(async () => {
    return await serverRequest.get("/wallets", {
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
