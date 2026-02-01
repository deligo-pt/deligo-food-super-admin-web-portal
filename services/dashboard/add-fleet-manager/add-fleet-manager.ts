"use server";

import { serverRequest } from "@/lib/serverFetch";
import { TResponse } from "@/types";
import { TAgent } from "@/types/user.type";

export const registerFleetManagerandSendOtpReq = async (data: {
  email: string;
  password: string;
}) => {
  try {
    const result = (await serverRequest.post(
      "/auth/register/create-fleet-manager",
      {
        data,
      },
    )) as TResponse<null>;

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
      message:
        error?.response?.data?.message || "Fleet Manager addition failed",
    };
  }
};

export const uploadFleetManagerDocumentsReq = async (
  id: string,
  key: string,
  file: Blob,
) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("data", JSON.stringify({ docImageTitle: key }));

    const result = await serverRequest.patch(`/fleet-managers/${id}/docImage`, {
      data: formData,
    });

    if (result.success) {
      return { success: true, data: result.data, message: result.message };
    }

    return { success: false, data: result.data, message: result.message };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.log("Server fetch error:", err);
    return {
      success: false,
      data: null,
      message: err?.response?.data?.message || "Document upload failed",
    };
  }
};

export const updateFleetManagerDataReq = async (
  id: string,
  data: Partial<TAgent>,
) => {
  try {
    const result = await serverRequest.patch(`/fleet-managers/${id}`, {
      data,
    });

    if (result.success) {
      const result2 = await serverRequest.patch(
        `/auth/${id}/approved-rejected-user`,
        {
          data: { status: "APPROVED" },
        },
      );

      if (result2.success) {
        return { success: true, data: result2.data, message: result.message };
      }
      return { success: false, data: result.data, message: result.message };
    }

    return { success: false, data: result.data, message: result.message };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.log("Server fetch error:", err);
    return {
      success: false,
      data: null,
      message: err?.response?.data?.message || "Fleet manager added failed",
    };
  }
};
