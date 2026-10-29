import { NextRequest, NextResponse } from "next/server";
import { getAllProducts } from "@/services/dashboard/product/product.service";

export async function GET(req: NextRequest) {
    const result = await getAllProducts(req.nextUrl.searchParams.toString());
    return NextResponse.json(result);
}