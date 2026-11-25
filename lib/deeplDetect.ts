// lib/deeplDetect.ts
//
// The import grid's converter (plan §12): the vendor types each text in any
// language and does not say which. DeepL detects it and the other language
// is filled — English ↔ Portuguese; any other language gets both.
//
// No `@/` imports, so it runs under bare Node with a stubbed `fetch`.

export type DetectedText = {
    /** The language DeepL detected, lower case ("en", "pt", "es"…). */
    from: string;
    en: string;
    pt: string;
};

export class DeepLDetectError extends Error {
    status: number;
    code: "QUOTA_EXCEEDED" | "RATE_LIMITED" | "UNAVAILABLE";

    constructor(status: number, message: string) {
        super(message);
        this.name = "DeepLDetectError";
        this.status = status;
        this.code = status === 456 ? "QUOTA_EXCEEDED" : status === 429 ? "RATE_LIMITED" : "UNAVAILABLE";
    }
}

type DeepLTranslation = { text: string; detected_source_language?: string };

// Portugal: European Portuguese, not Brazilian ("sandes", not "sanduíche").
const TARGET = { EN: "EN-GB", PT: "PT-PT" } as const;

async function callDeepL(texts: string[], targetLang: "EN" | "PT", sourceLang?: "EN"): Promise<DeepLTranslation[]> {
    const apiKey = process.env.DEEPL_API_KEY?.trim();
    if (!apiKey) throw new DeepLDetectError(500, "DEEPL_API_KEY is not set");
    const baseUrl = (process.env.DEEPL_API_URL || "https://api-free.deepl.com").replace(/\/$/, "");

    const params = new URLSearchParams();
    texts.forEach((text) => params.append("text", text));
    if (sourceLang) params.append("source_lang", sourceLang);
    params.append("target_lang", TARGET[targetLang]);

    const response = await fetch(`${baseUrl}/v2/translate`, {
        method: "POST",
        headers: {
            Authorization: `DeepL-Auth-Key ${apiKey}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
    });
    if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new DeepLDetectError(response.status, body?.message || response.statusText || "DeepL request failed");
    }
    const result = (await response.json()) as { translations?: DeepLTranslation[] };
    const translations = result.translations ?? [];
    if (translations.length !== texts.length) {
        throw new DeepLDetectError(502, "DeepL returned an unexpected number of translations");
    }
    return translations;
}

/**
 * Detects each text's language and returns it in English and Portuguese.
 * One call to English detects every text; English texts then go to
 * Portuguese, and texts in a third language get their Portuguese too.
 * A text in English costs its characters twice; the others once (twice for
 * a third language).
 */
export async function translateDetect(texts: string[]): Promise<DetectedText[]> {
    if (!texts.length) return [];
    const toEnglish = await callDeepL(texts, "EN");
    const results: DetectedText[] = texts.map((text, i) => {
        const from = (toEnglish[i].detected_source_language || "").toLowerCase();
        return from === "en"
            ? { from, en: text, pt: "" }
            : { from, en: toEnglish[i].text, pt: from === "pt" ? text : "" };
    });

    const english = results.flatMap((r, i) => (r.from === "en" ? [i] : []));
    if (english.length) {
        const pt = await callDeepL(english.map((i) => texts[i]), "PT", "EN");
        english.forEach((i, k) => (results[i].pt = pt[k].text));
    }
    const third = results.flatMap((r, i) => (r.from !== "en" && r.from !== "pt" ? [i] : []));
    if (third.length) {
        const pt = await callDeepL(third.map((i) => texts[i]), "PT");
        third.forEach((i, k) => (results[i].pt = pt[k].text));
    }
    return results;
}
