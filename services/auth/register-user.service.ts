"use server";

import { serverRequest } from "@/lib/serverFetch";
import { TAdmin } from "@/types/admin.type";
import { TDeliveryPartner } from "@/types/delivery-partner.type";
import { TAgent, TVendor } from "@/types/user.type";
import { catchAsync } from "@/utils/catchAsync";

export const registerUserAndSendOtpReq = async (
  data: {
    email: string;
    password: string;
  },
  endPoint: string,
) => {
  return catchAsync<null>(async () => {
    return await serverRequest.post(`/auth/register/${endPoint}`, {
      data,
    });
  });
};

export const updateUserDataReq = async (
  endPoint: string,
  data: Partial<TVendor | TAgent | TDeliveryPartner | TAdmin>,
) => {
  return catchAsync<null>(async () => {
    return await serverRequest.patch(endPoint, {
      data,
    });
  });
};

// export const uploadUserDocumentsReq = async (
//   id: string,
//   key: string,
//   file: Blob,
// ) => {
//   try {
//     const formData = new FormData();
//     formData.append("file", file);
//     formData.append("data", JSON.stringify({ docImageTitle: key }));

//     const result = await serverRequest.patch(`/vendors/${id}/docImage`, {
//       data: formData,
//     });

//     if (result.success) {
//       return { success: true, data: result.data, message: result.message };
//     }

//     return { success: false, data: result.data, message: result.message };
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   } catch (err: any) {
//     console.log("Server fetch error:", err);
//     return {
//       success: false,
//       data: null,
//       message: err?.response?.data?.message || "Document upload failed",
//     };
//   }
// };
