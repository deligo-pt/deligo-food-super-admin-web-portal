"use server";

import { serverRequest } from "@/lib/serverFetch";
import { catchAsync } from "@/utils/catchAsync";

export const updateFcmTockenReq = async (data: {
  token: string;
  deviceId: string;
}) => {
  return catchAsync<{ accessToken: string; refreshToken: string }>(async () => {
    return await serverRequest.post("/auth/update-fcm-token", {
      data,
    });
  });
};
