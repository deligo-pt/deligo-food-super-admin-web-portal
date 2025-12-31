"use server";

import { serverRequest } from "@/lib/serverFetch";
import { TResponse } from "@/types";
import { TMessage } from "@/types/chat.type";

export const getMessagesByRoom = async (room: string) => {
  try {
    const result = (await serverRequest.get(
      `/support/conversations/${room}/messages`
    )) as TResponse<TMessage>;

    if (result.success) {
      return {
        success: false,
        data: result.data,
        message: result.message,
      };
    }

    return {
      success: false,
      data: null,
      message: result.message || "Get messages failed",
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return {
      success: false,
      data: error?.response?.data || error,
      message: error?.response?.data?.message || "Get messages failed",
    };
  }
};
