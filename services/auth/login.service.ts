"use server";

import { serverRequest } from "@/lib/serverFetch";
import { TDeviceDetails } from "@/types";
import { catchAsync } from "@/utils/catchAsync";

export const loginReq = async (data: {
  email: string;
  password: string;
  forceLogin?: boolean;
  deviceDetails: TDeviceDetails;
}) => {
  return catchAsync<{ accessToken: string; refreshToken: string }>(async () => {
    return await serverRequest.post("/auth/login", {
      data,
    });
  });
};
