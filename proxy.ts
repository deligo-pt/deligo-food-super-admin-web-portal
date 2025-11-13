import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

const JWT_ACCESS_SECRET = new TextEncoder().encode(
  process.env.JWT_ACCESS_SECRET || "Secret"
);

async function verifyJWT(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_ACCESS_SECRET);
    return payload as { role?: string; status?: string };
  } catch {
    return null;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const accessToken = req.cookies.get("accessToken")?.value;

  const loginUrl = new URL("/", req.url);
  loginUrl.searchParams.set("redirect", pathname);

  if (pathname === "/") {
    if (accessToken) {
      const decoded = await verifyJWT(accessToken);
      if (
        decoded &&
        (decoded?.role === "SUPER_ADMIN" || decoded?.role === "ADMIN")
      ) {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    if (!accessToken) {
      return NextResponse.redirect(loginUrl);
    }

    const decoded = await verifyJWT(accessToken);
    if (!decoded) {
      return NextResponse.redirect(loginUrl);
    }

    if (decoded?.role !== "SUPER_ADMIN" && decoded?.role !== "ADMIN") {
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/admin/:path*"],
};
