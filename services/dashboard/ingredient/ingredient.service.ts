"use server";

import { serverFetch } from "@/lib/fetchHelper";
import { serverRequest } from "@/lib/serverFetch";
import { TMeta } from "@/types";
import { TIngredient, TIngredientOrder } from "@/types/ingredient.type";
import { catchAsync } from "@/utils/catchAsync";

/* 
==========================
INGREDIENT
==========================
*/

// Service function formatted precisely as requested
export const createIngredientReq = async (payload: Record<string, unknown>) => {
  return await catchAsync<null>(async () => {
    const response = await serverFetch.post("/ingredients/create-ingredient", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result?.message || "Failed to create ingredient");
    }

    return result;
  });
};


export const getSingleIngredientReq = async (sku: string) => {
  const result = await catchAsync<TIngredient>(async () => {
    return await serverRequest.get(`/ingredients/${sku}`);
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

/* 
==========================
INGREDIENT ORDERS
==========================
*/

export const getAllIngredientOrdersReq = async (
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

  const result = await catchAsync<{ data: TIngredientOrder[]; meta: TMeta }>(
    async () => {
      return await serverRequest.get("/ingredients-order/admin/all", {
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

export const getSingleIngredientOrderReq = async (id: string) => {
  const result = await catchAsync<TIngredientOrder>(async () => {
    return await serverRequest.get(`/ingredients-order/${id}`);
  });

  if (result?.success) return result.data;

  return {};
};

export const updatedIngredientOrderStatusReq = async (
  id: string,
  data: { status: string },
) => {
  return catchAsync<TIngredientOrder>(async () => {
    return await serverRequest.patch(`/ingredients-order/${id}/status`, {
      data,
    });
  });
};
