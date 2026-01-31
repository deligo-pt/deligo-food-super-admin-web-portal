"use server";

import { serverRequest } from "@/lib/serverFetch";
import { TProduct } from "@/types/product.type";
import { catchAsync } from "@/utils/catchAsync";

export const getAllProductsReq = async (
  params: Record<string, string | number>,
) => {
  return catchAsync<TProduct[]>(async () => {
    return await serverRequest.get("/products", { params });
  });
};

export const deleteProductReq = async (id: string) => {
  return catchAsync<null>(async () => {
    return await serverRequest.delete(`/products/soft-delete/${id}`);
  });
};
