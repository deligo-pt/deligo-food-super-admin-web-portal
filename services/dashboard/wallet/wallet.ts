"use server";

import { serverRequest } from "@/lib/serverFetch";
import { catchAsync } from "@/utils/catchAsync";

export const getAllWalletsReq = async () => {
  return catchAsync<null>(async () => {
    return await serverRequest.get("/wallets");
  });
};

export const getMyWalletReq = async () => {
  return catchAsync<null>(async () => {
    return await serverRequest.get("/wallets/me");
  });
};

export const getSingleWalletReq = async (id: string) => {
  return catchAsync<null>(async () => {
    return await serverRequest.get(`/wallets/${id}`);
  });
};
