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
        credentials: "include",
        headers: {
          cookie: cookieStore.toString(),
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const result = await response.json();
    console.log("new acc token", result?.accessToken);

    cookieStore.set({
      name: "accessToken",
      value: result.accessToken,
    });

    return {
      accessToken: result.accessToken,
    };
  } catch {
    return null;
  }
};