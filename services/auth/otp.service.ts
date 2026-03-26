"use server";

import { serverRequest } from "@/lib/serverFetch";
import { TResponse } from "@/types";
import { catchAsync } from "@/utils/catchAsync";

export const resendOtpReq = async (data: { email: string }) => {
  try {
    const result = (await serverRequest.post("/auth/resend-otp", {
      data,
    })) as TResponse<null>;

    if (result.success) {
      return { success: true, data: result.data, message: result.message };
    }

    return { success: false, data: result.data, message: result.message };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error?.response?.data);
    return {
      success: false,
      data: null,
      message: error?.response?.data?.message || "OTP resending failed",
    };
  }
};

export const verifyOtpReq = async (data: { email: string; otp: string }) => {
  return catchAsync<{ accessToken: string; refreshToken: string }>(async () => {
    return await serverRequest.post("/auth/verify-otp", {
      data,
    });
  });
};
