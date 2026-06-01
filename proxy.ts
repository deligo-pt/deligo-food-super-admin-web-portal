import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/utils/verifyJWT";
import { USER_ROLE } from "@/consts/user.const";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const accessToken = req.cookies.get("accessToken")?.value;

  const loginUrl = new URL("/", req.url);

  let isAdmin = false;

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
      req.cookies.clear();
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/admin/:path*"],
};