"use server";

import { serverRequest } from "@/lib/serverFetch";
import { TMeta } from "@/types";
import { TTax } from "@/types/tax.type";
import { catchAsync } from "@/utils/catchAsync";

export const createTaxReq = async (data: Partial<TTax>) => {
  return catchAsync<null>(async () => {
    return await serverRequest.post("/taxes/create-tax", { data });
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

export const permanentDeleteTax = async (id: string) => {
  return catchAsync<null>(async () => {
    return await serverRequest.delete(`/taxes/permanent-delete/${id}`);
  });
};

export const getSingleTaxReq = async (id: string, lang: "en" | "pt") => {
  const result = await catchAsync<TTax>(async () => {
    return await serverRequest.get(`/taxes/${id}`, {
      headers: {
        "Accept-Language": lang
      }
    });
  });

  if (result?.success) return result.data;

  return {};
};

export const getAllTaxesReq = async (
  queries: Record<string, string | undefined>,
) => {
  const limit = Number(queries?.limit || 10);
  const page = Number(queries.page || 1);
  const searchTerm = queries.searchTerm || "";
  const sortBy = queries.sortBy || "-createdAt";
  const lang = queries.lang || "en";

  const params = {
    limit,
    page,
    sortBy,
    ...(searchTerm ? { searchTerm: searchTerm } : {}),
  };

  const result = await catchAsync<{ data: TTax[]; meta: TMeta }>(async () => {
    return await serverRequest.get("/taxes", {
      params,
      headers: {
        "Accept-Language": lang
      }
    });
  });

  if (result?.success)
    return {
      data: result.data,
      meta: result.meta,
    };

  return {
    data: [],
  };
};
