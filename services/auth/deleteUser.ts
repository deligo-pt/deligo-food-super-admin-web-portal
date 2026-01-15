"use server";

import { serverRequest } from "@/lib/serverFetch";
import { catchAsync } from "@/utils/catchAsync";

export const userSoftDeleteReq = async (id: string) => {
  return catchAsync<null>(async () => {
    return await serverRequest.delete(`/auth/soft-delete/${id}`);
  });
};
