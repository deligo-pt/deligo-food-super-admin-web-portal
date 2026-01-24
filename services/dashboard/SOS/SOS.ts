"use server";

import { serverRequest } from "@/lib/serverFetch";
import { TSOS } from "@/types/sos.type";
import { catchAsync } from "@/utils/catchAsync";

export const getAllSOS = async () => {
  return catchAsync<TSOS[]>(async () => {
    return await serverRequest.get("/sos");
  });
};

export const getSingleSOS = async (id: string) => {
  return catchAsync<TSOS>(async () => {
    return await serverRequest.get(`/sos/${id}`);
  });
};

export const updateSOSStatus = async (
  id: string,
  data: { status: TSOS["status"]; note?: string },
) => {
  return catchAsync<TSOS>(async () => {
    return await serverRequest.patch(`/sos/${id}/status`, { data });
  });
};

// export const getNearbySOS = async () => {
//   return catchAsync<TSOS[]>(async () => {
//     return await serverRequest.get("/sos/nearby");
//   });
// };
