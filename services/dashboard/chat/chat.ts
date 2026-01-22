"use server";

import { USER_ROLE } from "@/consts/user.const";
import { serverRequest } from "@/lib/serverFetch";
import { TResponse } from "@/types";
import { TConversation } from "@/types/chat.type";

interface IOpenCoversationParams {
  type: string;
  targetUser: {
    userId: string;
    role: keyof typeof USER_ROLE;
    name: string;
  };
}

export const openConversationReq = async ({
  type,
  targetUser,
}: IOpenCoversationParams) => {
  try {
    const result = (await serverRequest.post("/support/conversation", {
      data: { type, targetUser },
    })) as TResponse<TConversation>;

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
    console.log("Server fetch error:", err);
    return {
      success: false,
      data: err?.response?.data || err,
      message: err?.response?.data?.message || "Open conversation failed",
    };
  }
};
