"use server";

import { TResponse } from "@/types";
import { catchAsync } from "@/utils/catchAsync";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1"

export const resendOtpReq = async (data: { email: string; role: string }) => {
  return catchAsync<null>(async () => {
    const response = await fetch(`${BASE_URL}/auth/resend-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result?.message || "Resend otp failed!");
    }
    return result as TResponse<null>;
  });
};

export const verifyOtpReq = async (data: {
  email: string;
  otp: string;
  role: string;
}) => {
  return catchAsync<{ accessToken: string; refreshToken: string }>(async () => {
    const response = await fetch(`${BASE_URL}/auth/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result?.message || "Verify otp failed!");
    }

    return result;
  });
};

// export const resendOtpReq = async (data: { email: string; role: string; }) => {
//   try {
//     const result = (await serverRequest.post("/auth/resend-otp", {
//       data,
//     })) as TResponse<null>;

//     if (result.success) {
//       return { success: true, data: result.data, message: result.message };
//     }

//     return { success: false, data: result.data, message: result.message };

//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   } catch (error: any) {
//     console.log(error?.response?.data);
//     return {
//       success: false,
//       data: null,
//       message: error?.response?.data?.message || "OTP resending failed",
//     };
//   }
// };

