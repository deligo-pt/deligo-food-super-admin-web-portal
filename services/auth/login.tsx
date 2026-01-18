"use server";

import { serverRequest } from "@/lib/serverFetch";
import { catchAsync } from "@/utils/catchAsync";

export const loginReq = async (data: { email: string; password: string }) => {
  return catchAsync<{ accessToken: string; refreshToken: string }>(async () => {
    return await serverRequest.post("/auth/login", {
      data,
    });
  });
};
