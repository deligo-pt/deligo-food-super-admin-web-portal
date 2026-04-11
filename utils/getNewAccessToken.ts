"use server";

import { serverRequest } from "@/lib/serverFetch";
import { catchAsync } from "@/utils/catchAsync";
import { verifyJWT } from "@/utils/verifyJWT";
import { cookies } from "next/headers";

export const getNewAccessToken = async () => {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value || "";

  const decoded = await verifyJWT(refreshToken, true);

  if (
    decoded?.success &&
    (decoded?.data?.role === "ADMIN" || decoded?.data?.role === "SUPER_ADMIN")
  ) {
    const result = await catchAsync<{ accessToken: string }>(async () => {
      return await serverRequest.post("/auth/refresh-token");
    });

    if (result?.success) {
      cookieStore.set({
        name: "accessToken",
        value: result?.data?.accessToken,
        maxAge: 60 * 60 * 24 * 7,
      });

      return result?.data;
    }

    return null;
  }

  return null;
};
