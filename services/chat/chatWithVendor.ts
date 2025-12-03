"use server";

import { serverRequest } from "@/lib/serverFetch";
import { TResponse } from "@/types";
import { TMessage } from "@/types/chat.type";

export const getVendorPreviousChats = async (id: string) => {
  try {
    const result = (await serverRequest.delete(`/messages/${id}`)) as TResponse<
      TMessage[]
    >;

    if (result.success) {
      return { success: true, data: result.data || ([] as TMessage[]) };
    }
    return { success: false, data: result.message };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return {
      false: true,
      data:
        error?.response?.data?.message || "Vendor Previous Chats Fetch Failed",
    };
  }
};
