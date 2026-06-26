"use server";

import { cookies } from "next/headers";
import { verifyJWT } from "@/utils/verifyJWT";

const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

export const getNewAccessToken = async () => {
  const cookieStore = await cookies();

  const refreshToken = cookieStore.get("refreshToken")?.value || "";

  if (!refreshToken) {
    return null;
  }

  const decoded = await verifyJWT(
    refreshToken,
    true
  );

  const role = decoded?.data?.role;

  if (!decoded?.success || !["ADMIN", "SUPER_ADMIN"].includes(role ?? "")) {
    return null;
  }

  try {
    const response = await fetch(
      `${backendUrl}/auth/refresh-token`,
      {
        method: "POST",
        headers: {
          cookie: `refreshToken=${refreshToken}`,
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const result = await response.json();

    return {
      accessToken: result?.data?.accessToken,
    };
  } catch {
    return null;
  }
};