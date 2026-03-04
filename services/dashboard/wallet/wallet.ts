"use server";

import { serverRequest } from "@/lib/serverFetch";
import { TWallet } from "@/types/wallet.type";
import { catchAsync } from "@/utils/catchAsync";

export const getAllWalletsReq = async (params: {
  limit: number;
  userModel: "Vendor" | "FleetManager";
}) => {
  return catchAsync<TWallet[]>(async () => {
    return await serverRequest.get("/wallets", { params });
  });
};

export const getMyWalletReq = async () => {
  return catchAsync<TWallet>(async () => {
    return await serverRequest.get("/wallets/me");
  });
};

export const getSingleWalletReq = async (id: string) => {
  return catchAsync<TWallet>(async () => {
    return await serverRequest.get(`/wallets/${id}`);
  });
};
