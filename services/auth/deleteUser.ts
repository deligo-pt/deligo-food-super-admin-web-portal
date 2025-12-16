"use server";

import { serverRequest } from "@/lib/serverFetch";
import { TResponse } from "@/types";

export const userSoftDeleteReq = async (id: string) => {
  try {
    const result = (await serverRequest.delete(
      `/auth/soft-delete/${id}`
    )) as TResponse<null>;
    if (result.success) {
      return { success: true, data: null };
    }
    return { success: false, data: result.message };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return {
      false: true,
      data: error?.response?.data?.message || "User deletion failed",
    };
  }
};
