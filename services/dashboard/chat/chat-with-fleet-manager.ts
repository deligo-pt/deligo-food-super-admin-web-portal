"use server";

import { serverRequest } from "@/lib/serverFetch";
import { TAgent } from "@/types/user.type";
import { catchAsync } from "@/utils/catchAsync";

export const getAllFleetManagersReq = async ({ limit = 10 }) => {
  return catchAsync<TAgent[]>(async () => {
    return await serverRequest.get("/fleet-managers", {
      params: { limit },
    });
  });
};
