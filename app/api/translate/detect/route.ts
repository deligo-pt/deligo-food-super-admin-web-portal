import { NextRequest, NextResponse } from "next/server";
import { DeepLDetectError, translateDetect } from "@/lib/deeplDetect";
import { verifyJWT } from "@/utils/verifyJWT";

// The import grid's converter (plan §12): texts in any language, each
// detected and returned in English and Portuguese. Same limits as
// /api/translate.
const MAX_TEXTS = 50;
const MAX_TEXT_LENGTH = 5000;
const MAX_TOTAL_LENGTH = 20000;
const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 60_000;
const recentRequests = new Map<string, number[]>();

function isRateLimited(userId: string) {
    const now = Date.now();
    const recent = (recentRequests.get(userId) ?? []).filter((time) => now - time < RATE_WINDOW_MS);
    const limited = recent.length >= RATE_LIMIT;
    if (!limited) recent.push(now);
    recentRequests.set(userId, recent);
    return limited;
}

function fail(status: number, code: string, message: string) {
    return NextResponse.json({ success: false, code, message }, { status });
}

export async function POST(req: NextRequest) {
    const accessToken = req.cookies.get("accessToken")?.value;
    const session = accessToken ? await verifyJWT(accessToken) : null;
    const userId = session?.success ? String(session.data?.userId ?? "") : "";
    if (!userId) return fail(401, "UNAUTHORIZED", "Sign in to use translation");
    if (isRateLimited(userId)) return fail(429, "RATE_LIMITED", "Too many translation requests, try again in a minute");

    const body = await req.json().catch(() => null);
    const texts: unknown = body?.texts;
    if (!Array.isArray(texts) || !texts.every((text) => typeof text === "string" && text.trim())) {
        return fail(400, "INVALID_REQUEST", "Expected texts[] (not empty)");
    }
    if (
        texts.length > MAX_TEXTS ||
        texts.some((text: string) => text.length > MAX_TEXT_LENGTH) ||
        texts.reduce((total: number, text: string) => total + text.length, 0) > MAX_TOTAL_LENGTH
    ) {
        return fail(400, "INVALID_REQUEST", "Too much text in one translation request");
    }

    try {
        return NextResponse.json({ success: true, results: await translateDetect(texts as string[]) });
    } catch (error) {
        if (error instanceof DeepLDetectError) {
            console.error(`DeepL detect ${error.status}: ${error.message}`);
            return fail(503, error.code, "Translation is unavailable right now");
        }
        console.error("Translation (detect) failed:", error);
        return fail(503, "UNAVAILABLE", "Translation is unavailable right now");
    }
}
