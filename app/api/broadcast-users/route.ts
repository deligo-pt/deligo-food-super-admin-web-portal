// app/api/broadcast-users/route.ts
//
// Why a route handler? Server actions run ONE AT A TIME in Next.js, so five
// getAllUsersReq() calls from the client queue up behind each other.
// Plain fetch() calls to a route handler run in parallel.
import { NextRequest, NextResponse } from "next/server";
import { getAllUsersReq } from "@/services/dashboard/system-management/email-notification-settings.service";
import { USER_STATUS } from "@/consts/user.const";

const ROLES = [
    "VENDOR",
    "FLEET_MANAGER",
    "CUSTOMER",
    "DELIVERY_PARTNER",
    "ADMIN",
] as const;

export async function GET(req: NextRequest) {
    const sp = req.nextUrl.searchParams;
    const role = sp.get("role") as (typeof ROLES)[number] | null;

    if (!role || !ROLES.includes(role)) {
        return NextResponse.json({ data: [] }, { status: 400 });
    }

    const result = await getAllUsersReq({
        role,
        page: Number(sp.get("page") || 1),
        limit: Number(sp.get("limit") || 10),
        searchTerm: sp.get("searchTerm") || "",
        status: (sp.get("status") || undefined) as
            | keyof typeof USER_STATUS
            | undefined,
    });

    return NextResponse.json(result);
}