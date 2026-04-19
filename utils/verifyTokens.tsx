import { getNewAccessToken } from "@/utils/getNewAccessToken";
import { verifyJWT } from "@/utils/verifyJWT";
import { cookies } from "next/headers";

export const verifyTokens = async (): Promise<boolean> => {
  const cookieStore = await cookies();

  const accessToken = cookieStore.get("accessToken")?.value || "";
  const refreshToken = cookieStore.get("refreshToken")?.value || "";
  let wasRefreshed = false;

  if (!accessToken && !refreshToken) {
    return wasRefreshed;
  }

  if (accessToken) {
    const decoded = await verifyJWT(accessToken);

    if (
      !decoded.success &&
      (decoded.reason === "jwt expired" ||
        decoded.reason === '"exp" claim timestamp check failed') &&
      refreshToken
    ) {
      const newAccessTokenResult = await getNewAccessToken();
      if (newAccessTokenResult) {
        wasRefreshed = true;
      }
    }
  }

  if (!accessToken && refreshToken) {
    const newAccessTokenResult = await getNewAccessToken();

    if (newAccessTokenResult) {
      wasRefreshed = true;
    }
  }

  return wasRefreshed;
};
