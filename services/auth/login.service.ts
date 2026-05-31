"use server";

import { DEVICE_KEY } from "@/consts/device.const";
import { serverFetch } from "@/lib/fetchHelper";
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

    const response = await serverFetch.post("/auth/login", {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.message || "Failed to log in");
    }

    return await response.json();
  });
};

export const logoutReq = async () => {
  const deviceId = (await cookies()).get(DEVICE_KEY)?.value || "";

  return catchAsync<null>(async () => {
    const response = await serverFetch.post("/auth/logout", {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ deviceId }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.message || "Failed to log out");
    }

    return await response.json();
  });
};
