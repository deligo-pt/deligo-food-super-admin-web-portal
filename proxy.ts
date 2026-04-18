import { USER_ROLE } from "@/consts/user.const";
import { getAdminInfo } from "@/utils/getAdminInfo";
import { verifyTokens } from "@/utils/verifyTokens";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const loginUrl = new URL("/", req.url);

  const tokenWasRefreshed = await verifyTokens();

  if (tokenWasRefreshed) {
    return NextResponse.redirect(new URL(pathname, req.url));
  }

  const adminResult = await getAdminInfo();

  if (adminResult) {
    const adminInfo = adminResult?.admin;

    if (
      adminInfo.role === USER_ROLE.ADMIN ||
      adminInfo.role === USER_ROLE.SUPER_ADMIN
    ) {
      if (pathname === "/") {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }
    } else {
      req.cookies.delete("accessToken");
      req.cookies.delete("refreshToken");
      if (pathname !== "/") {
        return NextResponse.redirect(loginUrl);
      }
    }
  } else {
    if (pathname.startsWith("/admin")) {
      const loginUrl = new URL("/", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/admin/:path*"],
};
