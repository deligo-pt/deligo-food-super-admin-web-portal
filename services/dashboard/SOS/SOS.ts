"use server";

import { serverRequest } from "@/lib/serverFetch";
import { TMeta } from "@/types";
import { TSOS } from "@/types/sos.type";
import { catchAsync } from "@/utils/catchAsync";

export const getAllSOSReq = async (
  params: Record<string, string | number | object>,
) => {
  return catchAsync<{ result: TSOS[]; meta?: TMeta }>(async () => {
    return await serverRequest.get("/sos", { params });
  });
};

export const getSingleSOSReq = async (id: string) => {
  return catchAsync<TSOS>(async () => {
    return await serverRequest.get(`/sos/${id}`);
  });
};

export const updateSOSStatusReq = async (
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
