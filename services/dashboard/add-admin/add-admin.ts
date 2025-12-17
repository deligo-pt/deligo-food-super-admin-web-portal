"use server";

import { serverRequest } from "@/lib/serverFetch";
import { TResponse } from "@/types";
import { TAdmin } from "@/types/admin.type";
import { jwtDecode } from "jwt-decode";

export const registerAdminAndSendOtpReq = async (data: {
  email: string;
  password: string;
}) => {
  try {
    const result = (await serverRequest.post("/auth/register/create-admin", {
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
      message: error?.response?.data?.message || "Admin creation failed",
    };
  }
};

export const verifyOtpReq = async (data: { email: string; otp: string }) => {
  try {
    const result = (await serverRequest.post("/auth/verify-otp", {
      data,
    })) as TResponse<{ accessToken: string; refreshToken: string }>;

    if (result.success) {
      const decoded = jwtDecode(result.data.accessToken) as { id: string };

      return { success: true, data: decoded?.id, message: result.message };
    }

    return { success: false, data: result.data, message: result.message };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error?.response?.data);
    return {
      success: false,
      data: null,
      message: error?.response?.data?.message || "OTP verification failed",
    };
  }
};

export const updateAdminDataReq = async (id: string, data: Partial<TAdmin>) => {
  try {
    const result = await serverRequest.patch(`/admins/${id}`, {
      data,
    });

    if (result.success) {
      const result2 = await serverRequest.patch(
        `/auth/${id}/approved-rejected-user`,
        {
          data: { status: "APPROVED" },
        }
      );

      if (result2.success) {
        return { success: true, data: result2.data, message: result.message };
      }
      return { success: false, data: result.data, message: result.message };
    }

    return { success: false, data: result.data, message: result.message };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error("Server fetch error:", err);
    return {
      success: false,
      data: null,
      message: err?.response?.data?.message || "Admin added failed",
    };
  }
};
