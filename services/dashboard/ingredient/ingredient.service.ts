"use server";

import { serverRequest } from "@/lib/serverFetch";
import { TMeta } from "@/types";
import { TIngredient } from "@/types/ingredient.type";
import { catchAsync } from "@/utils/catchAsync";

export const getSingleIngredientReq = async (id: string) => {
  const result = await catchAsync<TIngredient>(async () => {
    return await serverRequest.get(`/ingredients/${id}`);
  });

  if (result?.success) return result.data;

  return {};
};

export const getAllIngredientsReq = async (
  queries: Record<string, string | undefined>,
) => {
  const limit = Number(queries?.limit || 10);
  const page = Number(queries.page || 1);
  const searchTerm = queries.searchTerm || "";
  const sortBy = queries.sortBy || "-createdAt";

  const params = {
    limit,
    page,
    sortBy,
    ...(searchTerm ? { searchTerm: searchTerm } : {}),
  };

  const result = await catchAsync<{ data: TIngredient[]; meta: TMeta }>(
    async () => {
      return await serverRequest.get("/ingredients", {
        params,
      });
    },
  );

  if (result?.success)
    return {
      data: result.data,
      meta: result.meta,
    };

  return {
    data: [],
  };
};
