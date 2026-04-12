"use server";

import { DEVICE_KEY } from "@/consts/device.const";
import { serverRequest } from "@/lib/serverFetch";
import { TDeviceDetails } from "@/types";
import { catchAsync } from "@/utils/catchAsync";
import { cookies } from "next/headers";

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

export const logoutReq = async (data: { email: string; token: string }) => {
  const deviceId = (await cookies()).get(DEVICE_KEY)?.value || "";

  return catchAsync<null>(async () => {
    return await serverRequest.post("/auth/logout", {
      data: { ...data, deviceId },
    });
  });
};
