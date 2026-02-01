"use server";

import { serverRequest } from "@/lib/serverFetch";
import { TDeliveryPartner } from "@/types/delivery-partner.type";
import { catchAsync } from "@/utils/catchAsync";

export const registerPartnerAndSendOtpReq = async (data: {
  email: string;
  password: string;
}) => {
  return catchAsync<null>(async () => {
    return await serverRequest.post("/auth/register/onboard/delivery-partner", {
      data,
    });
  });
};

export const updatePartnerDataReq = async (
  id: string,
  data: Partial<TDeliveryPartner>,
) => {
  return catchAsync<{ accessToken: string; refreshToken: string }>(async () => {
    return await serverRequest.patch(`/delivery-partners/${id}`, {
      data,
    });
  });
};
