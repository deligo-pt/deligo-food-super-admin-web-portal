"use server";

import { serverRequest } from "@/lib/serverFetch";
import { TMeta } from "@/types";
import { TTransaction } from "@/types/transaction.type";
import { catchAsync } from "@/utils/catchAsync";

export const getAllTransactionsReq = async (
  queries: Record<string, string | undefined>,
) => {
  const limit = Number(queries?.limit || 10);
  const page = Number(queries.page || 1);
  const searchTerm = queries.searchTerm || "";
  const sortBy = queries.sortBy || "-createdAt";
  const type = queries.type;
  const status = queries.status;

  const params = {
    limit,
    page,
    sortBy,
    ...(searchTerm ? { searchTerm } : {}),
    ...(type ? { type } : {}),
    ...(status ? { status } : {}),
  };

  const result = await catchAsync<{ data: TTransaction[]; meta?: TMeta }>(
    async () => {
      return await serverRequest.get("/transactions", {
        params,
      });
    },
  );

  if (result?.success)
    return {
      data: result.data.data,
      meta: result.data.meta,
    };

  return {
    data: [],
  };
};

export const getSingleTransactionReq = async (id: string) => {
  const result = await catchAsync<TTransaction>(async () => {
    return await serverRequest.get(`/transactions/${id}`);
  });

  if (result?.success) return result.data;

  return {};
};
