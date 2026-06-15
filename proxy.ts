import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/utils/verifyJWT";
import { USER_ROLE } from "@/consts/user.const";

export async function proxy(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  const accessToken = req.cookies.get("accessToken")?.value;

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