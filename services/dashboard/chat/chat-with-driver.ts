"use server";

import { serverRequest } from "@/lib/serverFetch";
import { TDeliveryPartner } from "@/types/delivery-partner.type";
import { catchAsync } from "@/utils/catchAsync";

export const getAllDriversReq = async ({ limit = 10 }) => {
  return catchAsync<TDeliveryPartner[]>(async () => {
    return await serverRequest.get("/delivery-partners", {
      params: { limit },
    });
  });
};
