import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/utils/verifyJWT";
import { USER_ROLE } from "@/consts/user.const";
import { getNewAccessToken } from "./utils/getNewAccessToken";

export async function proxy(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  const accessToken = req.cookies.get("accessToken")?.value;
  const refreshToken = req.cookies.get("refreshToken")?.value;

  const loginUrl = new URL("/", req.url);

  let isAdmin = false;

  if (pathname === "/" && searchParams.get("clearSession") === "true") {
    const response = NextResponse.redirect(new URL("/", req.url));
    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");
    return response;
  }


  // VERIFY TOKEN
  if (accessToken) {
    const decoded = await verifyJWT(accessToken);

    if (decoded.success) {
      if (
        decoded?.data?.role === USER_ROLE.ADMIN ||
        decoded?.data?.role === USER_ROLE.SUPER_ADMIN
      ) {
        isAdmin = true;
      }
    } else if (decoded?.reason === 'jwt expired' && refreshToken) {
      const newAccessTokenResponse = await getNewAccessToken();

      const newAccessToken =
        typeof newAccessTokenResponse === "string"
          ? newAccessTokenResponse
          : newAccessTokenResponse?.accessToken;

      if (newAccessToken) {

        const verified = await verifyJWT(newAccessToken);

        if (verified.success) {
          const response = NextResponse.next();

          response.cookies.set({
            name: "accessToken",
            value: newAccessToken,
            httpOnly: true,
            secure:
              process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
          });

          return response;
        }
      }
    }
  }

  // REDIRECT LOGGED IN USER FROM "/"
  if (pathname === "/" && isAdmin) {
    return NextResponse.redirect(
      new URL("/admin/dashboard", req.url)
    );
  }

  // PROTECT ADMIN ROUTES
  if (pathname.startsWith("/admin")) {
    if (!accessToken || !isAdmin) {
      const response = NextResponse.redirect(loginUrl);

      // remove tokens
      response.cookies.delete("accessToken");
      response.cookies.delete("refreshToken");

      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/admin/:path*"],
};