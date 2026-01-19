"use server";

import { serverRequest } from "@/lib/serverFetch";
import { TTax } from "@/types/tax.type";
import { catchAsync } from "@/utils/catchAsync";

export const createTaxReq = async (data: Partial<TTax>) => {
  return catchAsync<null>(async () => {
    return await serverRequest.post("/taxes/create-tax", { data });
  });
};

export const getAllTaxesReq = async (data: Partial<TTax>) => {
  return catchAsync<null>(async () => {
    return await serverRequest.get("/taxes", { data });
  });
};

export const getSingleTaxReq = async (id: string) => {
  return catchAsync<null>(async () => {
    return await serverRequest.patch(`/taxes/${id}`);
  });
};

export const updateTaxReq = async (id: string, data: Partial<TTax>) => {
  return catchAsync<null>(async () => {
    return await serverRequest.patch(`/taxes/${id}`, { data });
  });
};

export const deleteTaxReq = async (id: string) => {
  return catchAsync<null>(async () => {
    return await serverRequest.delete(`/taxes/soft-delete/${id}`);
  });
};
