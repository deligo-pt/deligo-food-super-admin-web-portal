"use server";

import { serverRequest } from "@/lib/serverFetch";
import { TResponse } from "@/types";
import { TVendor } from "@/types/user.type";

export const getAllVendorsReq = async ({ page = 1, limit = 10 }) => {
  try {
    const result = (await serverRequest.get("/vendors", {
      params: { limit, page },
    })) as TResponse<TVendor[]>;

    if (result.success) {
      return {
        success: true,
        data: result.data,
        message: result.message,
        meta: result.meta,
      };
    }

    return { success: false, data: result.error, message: result.message };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error("Server fetch error:", err);
    return {
      success: false,
      data: err?.response?.data || err,
      message: err?.response?.data?.message || "Vendors retrieve failed",
    };
  }
};
