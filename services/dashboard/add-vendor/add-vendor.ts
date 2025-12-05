"use server";

import { serverRequest } from "@/lib/serverFetch";
import { TResponse } from "@/types";
import { TVendor } from "@/types/user.type";
import { jwtDecode } from "jwt-decode";

export const registerVendorandSendOtpReq = async (data: {
  email: string;
  password: string;
}) => {
  try {
    const result = (await serverRequest.post("/auth/register/create-vendor", {
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
      message: error?.response?.data?.message || "Vendor addition failed",
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

export const uploadVendorDocumentsReq = async (
  id: string,
  key: string,
  file: Blob
) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("data", JSON.stringify({ docImageTitle: key }));

    const result = await serverRequest.patch(`/vendors/${id}/docImage`, {
      data: formData,
    });

    if (result.success) {
      return { success: true, data: result.data, message: result.message };
    }

    return { success: false, data: result.data, message: result.message };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error("Server fetch error:", err);
    return {
      success: false,
      data: null,
      message: err?.response?.data?.message || "Document upload failed",
    };
  }
};

export const updateVendorDataReq = async (
  id: string,
  data: Partial<TVendor>
) => {
  try {
    const result = await serverRequest.patch(`/vendors/${id}`, {
      data,
    });

    if (result.success) {
      return { success: true, data: result.data, message: result.message };
    }

    return { success: false, data: result.data, message: result.message };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error("Server fetch error:", err);
    return {
      success: false,
      data: null,
      message: err?.response?.data?.message || "Vendor update failed",
    };
  }
};
