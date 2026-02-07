"use server";

import { serverRequest } from "@/lib/serverFetch";
import { TCustomer } from "@/types/user.type";
import { catchAsync } from "@/utils/catchAsync";

export const getAllCustomersReq = async ({ limit = 10 }) => {
  return catchAsync<TCustomer[]>(async () => {
    return await serverRequest.get("/customers", {
      params: { limit },
    });
  });
};
