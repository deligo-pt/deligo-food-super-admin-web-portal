"use server";

import { serverRequest } from "@/lib/serverFetch";
import { TResponse } from "@/types";
import { TOffer } from "@/types/offer.type";

export const createOffer = async (payload: Partial<TOffer>) => {
  try {
    const result = (await serverRequest.post("/offers/create-offer", {
      data: payload,
    })) as TResponse<null>;

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
      message: error?.response?.data?.message || "Offer creation failed",
    };
  }
};
