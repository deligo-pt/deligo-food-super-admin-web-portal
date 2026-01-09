"use server";

import { serverRequest } from "@/lib/serverFetch";
import { TResponse } from "@/types";
import { TGlobalSettings } from "@/types/global-settings.type";

export const createGlobalSettingsReq = async (
  payload: Partial<TGlobalSettings>
) => {
  try {
    const result = (await serverRequest.post("/globalSettings/create", {
      data: payload,
    })) as TResponse<TGlobalSettings>;

    if (result.success) {
      return { success: true, data: result.data, message: result.message };
    }
    return { success: false, data: result.error, message: result.message };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error);
    return {
      success: false,
      data: error?.response?.data || null,
      message:
        error?.response?.data?.message || "Global settings creation failed",
    };
  }
};

export const updateGlobalSettingsReq = async (
  payload: Partial<TGlobalSettings>
) => {
  try {
    const result = (await serverRequest.patch("/globalSettings/update", {
      data: payload,
    })) as TResponse<TGlobalSettings>;

    if (result.success) {
      return { success: true, data: result.data, message: result.message };
    }
    return { success: false, data: result.error, message: result.message };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error);
    return {
      success: false,
      data: error?.response?.data || null,
      message:
        error?.response?.data?.message || "Global settings update failed",
    };
  }
};
