"use server";

import { serverRequest } from "@/lib/serverFetch";
import { TResponse } from "@/types";
import { TNotification } from "@/types/notification.type";

export const getAllNotificationsReq = async ({ limit = 10 }) => {
  try {
    const result = (await serverRequest.get("/notifications/my-notifications", {
      params: { limit },
    })) as TResponse<TNotification[]>;

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
      message: err?.response?.data?.message || "Notifications retrieve failed",
    };
  }
};

export const singleMarkReadReq = async (id: string) => {
  try {
    const result = (await serverRequest.patch(
      `/notifications/${id}/read`
    )) as TResponse<null>;

    if (result.success) {
      return {
        success: true,
        data: null,
        message: result.message,
      };
    }

    return { success: false, data: result.error, message: result.message };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error("Server fetch error:", err);
    return {
      success: false,
      data: err?.response?.data || err,
      message: err?.response?.data?.message || "Notification read failed",
    };
  }
};

export const allMarkReadReq = async () => {
  try {
    const result = (await serverRequest.patch(
      "/notifications/mark-all-as-read"
    )) as TResponse<null>;

    if (result.success) {
      return {
        success: true,
        data: null,
        message: result.message,
      };
    }

    return { success: false, data: result.error, message: result.message };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error("Server fetch error:", err);
    return {
      success: false,
      data: err?.response?.data || err,
      message: err?.response?.data?.message || "Notifications read failed",
    };
  }
};
