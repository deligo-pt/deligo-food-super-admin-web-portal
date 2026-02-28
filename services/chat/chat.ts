"use server";

import { serverRequest } from "@/lib/serverFetch";
import { TResponse } from "@/types";
import { TConversation, TMessage } from "@/types/chat.type";
import { catchAsync } from "@/utils/catchAsync";

export const getConversationByRoom = async (room: string) => {
  try {
    const result = (await serverRequest.get(
      `/support/conversations/${room}`,
    )) as TResponse<TConversation>;

    console.log(result);

    if (result.success) {
      return {
        success: true,
        data: result.data,
        message: result.message,
      };
    }

    return {
      success: false,
      data: null,
      message: result.message || "Get conversation failed",
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return {
      success: false,
      data: error?.response?.data || error,
      message: error?.response?.data?.message || "Get conversation failed",
    };
  }
};

export const getMessagesByRoom = async (room: string) => {
  try {
    const result = (await serverRequest.get(
      `/support/conversations/${room}/messages`,
      { params: { limit: 50, sortBy: "-createdAt" } },
    )) as TResponse<TMessage[]>;

    if (result.success) {
      const messages = result?.data?.reverse();
      return {
        success: true,
        data: messages,
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

export const getUnreadCountReq = async () => {
  return catchAsync<number>(async () => {
    return await serverRequest.get("/support/unread-count");
  });
};
