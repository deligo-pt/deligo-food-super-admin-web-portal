"use server";

import { serverRequest } from "@/lib/serverFetch";
import { catchAsync } from "@/utils/catchAsync";

export const deleteProductReq = async (id: string) => {
  return catchAsync<null>(async () => {
    return await serverRequest.delete(`/products/soft-delete/${id}`);
  });
};
