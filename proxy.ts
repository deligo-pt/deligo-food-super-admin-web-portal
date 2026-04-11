import { USER_ROLE } from "@/consts/user.const";
import { getAdminInfo } from "@/utils/getAdminInfo";
import { verifyTokens } from "@/utils/verifyTokens";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  if (searchParams.has("tokenRefreshed")) {
    const url = req.nextUrl.clone();
    url.searchParams.delete("tokenRefreshed");
    return NextResponse.redirect(url);
  }

  const loginUrl = new URL("/", req.url);
  loginUrl.searchParams.set("redirect", pathname);

  const tokenWasRefreshed = await verifyTokens();

  console.log("Token was refreshed:", tokenWasRefreshed);

  if (tokenWasRefreshed) {
    const url = req.nextUrl.clone();
    url.searchParams.set("tokenRefreshed", "true");
    return NextResponse.redirect(url);
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
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/admin/:path*"],
};
