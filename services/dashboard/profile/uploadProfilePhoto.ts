"use server";

import { serverRequest } from "@/lib/serverFetch";
import { TResponse } from "@/types";
import { TAdmin } from "@/types/admin.type";
import { jwtDecode } from "jwt-decode";
import { cookies } from "next/headers";

export const uploadProfilePhoto = async (file: File) => {
  const accessToken = (await cookies())?.get("accessToken")?.value || "";
  const decoded = jwtDecode(accessToken) as { id: string };

  const formData = new FormData();
  formData.append("file", file);

  const result = (await serverRequest.patch(`/admins/${decoded.id}`, {
    data: formData,
  })) as TResponse<TAdmin>;

  return result;
};
