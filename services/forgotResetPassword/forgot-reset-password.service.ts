"use server";

import { serverRequest } from "@/lib/serverFetch";
import { TResponse } from "@/types";

export const forgotPasswordReq = async (data: { email: string; role: string; }) => {
  const result = (await serverRequest.post("/auth/forgot-password", {
    data,
  })) as TResponse<null>;

  return result;
};

export const resetPasswordReq = async (data: {
  email: string;
  newPassword: string;
  role: string;
  token: string;
}) => {
  const result = (await serverRequest.post("/auth/reset-password", {
    data,
  })) as TResponse<null>;

  return result;
};
