"use server";

import { serverRequest } from "@/lib/serverFetch";
import { TResponse } from "@/types";
import { TAdmin } from "@/types/admin.type";
import { catchAsync } from "@/utils/catchAsync";
import { jwtDecode } from "jwt-decode";
import { cookies } from "next/headers";

export const getProfileReq = async () => {
  const result = await catchAsync<TAdmin>(async () => {
    return await serverRequest.get("/profile");
  });

  if (result?.success) return result.data;

  return {};
};

export const uploadProfilePhoto = async (file: File) => {
  const accessToken = (await cookies())?.get("accessToken")?.value || "";
  const decoded = jwtDecode(accessToken) as { userId: string };

  const formData = new FormData();
  formData.append("file", file);

  const result = (await serverRequest.patch(`/admins/${decoded.userId}`, {
    data: formData,
  })) as TResponse<TAdmin>;

  return result;
};
