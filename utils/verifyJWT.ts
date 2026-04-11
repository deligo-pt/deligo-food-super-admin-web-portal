import { TJwtPayload } from "@/types";
import { jwtVerify } from "jose";

export async function verifyJWT(token: string, isRefreshToken = false) {
  try {
    const JWT_ACCESS_SECRET = new TextEncoder().encode(
      process.env.JWT_ACCESS_SECRET || "Secret",
    );
    const JWT_REFRESH_SECRET = new TextEncoder().encode(
      process.env.JWT_REFRESH_SECRET || "Secret",
    );

    const { payload } = await jwtVerify(
      token,
      isRefreshToken ? JWT_REFRESH_SECRET : JWT_ACCESS_SECRET,
    );

    return { success: true, data: payload as TJwtPayload };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      return { success: false, data: null, reason: "jwt expired" };
    }

    return { success: false, data: null, reason: err.message };
  }
}
