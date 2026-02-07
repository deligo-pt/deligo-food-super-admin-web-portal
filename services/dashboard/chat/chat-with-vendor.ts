"use server";

import { serverRequest } from "@/lib/serverFetch";
import { TVendor } from "@/types/user.type";
import { catchAsync } from "@/utils/catchAsync";

export const getAllVendorsReq = async ({ limit = 10 }) => {
  return catchAsync<TVendor[]>(async () => {
    return await serverRequest.get("/vendors", {
      params: { limit },
    });
  });
};
