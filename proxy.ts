import { DEVICE_KEY } from "@/consts/device.const";
import { USER_ROLE } from "@/consts/user.const";
import { getAdminInfo } from "@/utils/getAdminInfo";
import { verifyTokens } from "@/utils/verifyTokens";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const loginUrl = new URL("/", req.url);
  loginUrl.searchParams.set("redirect", pathname);

  try {
    /**
     * ==================================================
     * TOKEN VERIFY / REFRESH
     * ==================================================
     */

    const tokenWasRefreshed = await verifyTokens();

    /**
     * IMPORTANT:
     * NEVER redirect to same pathname here.
     * This causes redirect loops + router corruption.
     */

    if (tokenWasRefreshed) {
      console.log("Token refreshed successfully");

      return NextResponse.next();
    }

    /**
     * ==================================================
     * GET ADMIN INFO
     * ==================================================
     */

    const adminResult = await getAdminInfo();

    /**
     * ==================================================
     * IF ADMIN EXISTS
     * ==================================================
     */

    if (adminResult) {
      const adminInfo = adminResult?.admin;

      /**
       * ==================================================
       * ROLE CHECK
       * ==================================================
       */

      if (
        adminInfo.role === USER_ROLE.ADMIN ||
        adminInfo.role === USER_ROLE.SUPER_ADMIN
      ) {
        /**
         * ==================================================
         * DEVICE SESSION CHECK
         * ==================================================
         */

        const currentDeviceId = req.cookies.get(DEVICE_KEY)?.value || "";


        const isValidSession = adminInfo?.loginDevices?.some(
          (device) => currentDeviceId === device.deviceId,
        );


        /**
         * ==================================================
         * INVALID SESSION
         * ==================================================
         */

        if (!isValidSession) {
          const response = NextResponse.redirect(loginUrl);

          response.cookies.delete("accessToken");
          response.cookies.delete("refreshToken");

          if (pathname !== "/") {
            loginUrl.searchParams.set("sessionExpired", "true");

            return NextResponse.redirect(loginUrl);
          }

          return response;
        }

        /**
         * ==================================================
         * REDIRECT LOGGED IN USER FROM "/"
         * ==================================================
         */

        if (pathname === "/" && isValidSession) {

          return NextResponse.redirect(
            new URL("/admin/dashboard", req.url),
          );
        }

        return NextResponse.next();
      }

      /**
       * ==================================================
       * INVALID ROLE
       * ==================================================
       */

      const response = NextResponse.redirect(loginUrl);

      response.cookies.delete("accessToken");
      response.cookies.delete("refreshToken");


      if (pathname !== "/") {
        return response;
      }

      return response;
    }

    /**
     * ==================================================
     * NO ADMIN FOUND
     * ==================================================
     */

    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  } catch (error) {
    console.log("MIDDLEWARE ERROR =>", error);

    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/", "/admin/:path*"],
};