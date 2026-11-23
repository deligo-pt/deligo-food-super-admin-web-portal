import type { TranslationErrorCode } from "@/types/translation.type";

/**
 * One call to `/api/translate` for the import's batch translator
 * (`utils/sheetTranslate.ts`, plan.md §9.5). Never throws.
 *
 * The vendor panel's route answers a `code` when it can't translate; this
 * panel's route (left as it is — every admin form uses it) answers 500 with
 * DeepL's message, e.g. "DeepL Translation Failed (456): …". The status in
 * that message gives the reason: 456 = quota used up, 429 = too many calls.
 */

export type DeepLLang = "EN" | "PT";

export type TranslationRequest = {
    texts: string[];
    sourceLang: DeepLLang;
    targetLang: DeepLLang;
};

export type TranslationReply =
    | { ok: true; translations: string[] }
    | { ok: false; code: TranslationErrorCode };

const KNOWN: TranslationErrorCode[] = ["QUOTA_EXCEEDED", "RATE_LIMITED", "UNAUTHORIZED", "INVALID_REQUEST", "UNAVAILABLE"];

/** The reason behind a refused call, from the reply's `code`, HTTP status or message. */
export function translationErrorCode(status: number, body: { code?: unknown; message?: unknown } | null): TranslationErrorCode {
    if (KNOWN.includes(body?.code as TranslationErrorCode)) return body?.code as TranslationErrorCode;
    const message = String(body?.message ?? "");
    if (status === 456 || /\(456\)|quota/i.test(message)) return "QUOTA_EXCEEDED";
    if (status === 429 || /\(429\)|too many/i.test(message)) return "RATE_LIMITED";
    if (status === 401 || status === 403) return "UNAUTHORIZED";
    if (status === 400) return "INVALID_REQUEST";
    return "UNAVAILABLE";
}

export async function requestTranslations(request: TranslationRequest): Promise<TranslationReply> {
    try {
        const response = await fetch("/api/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(request),
        });
        const result = await response.json().catch(() => null);
        if (!response.ok || !result?.success || !Array.isArray(result.translations)) {
            return { ok: false, code: translationErrorCode(response.status, result) };
        }
        return { ok: true, translations: result.translations };
    } catch {
        return { ok: false, code: "UNAVAILABLE" };
    }
}
