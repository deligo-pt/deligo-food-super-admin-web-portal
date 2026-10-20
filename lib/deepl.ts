/* eslint-disable @typescript-eslint/no-explicit-any */

export async function translateTexts({
    texts,
    sourceLang,
    targetLang,
}: {
    texts: string[];
    sourceLang: "EN" | "PT";
    targetLang: "EN" | "PT";
}) {
    if (!texts.length) return [];

    const apiKey = process.env.DEEPL_API_KEY?.trim();
    if (!apiKey) {
        throw new Error("DEEPL_API_KEY is missing in environment");
    }

    const baseUrl = (
        process.env.DEEPL_API_URL || "https://api-free.deepl.com"
    ).replace(/\/$/, "");

    const url = `${baseUrl}/v2/translate`;

    const params = new URLSearchParams();
    texts.forEach((text) => params.append("text", text));
    params.append("source_lang", sourceLang);
    params.append("target_lang", targetLang);

    const response = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: `DeepL-Auth-Key ${apiKey}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
    });

    const bodyText = await response.text();

    if (!response.ok) {
        throw new Error(
            `DeepL Translation Failed (${response.status}): ${bodyText || response.statusText}`
        );
    }

    // Body already read as text — parse it (do NOT call response.json())
    const result = JSON.parse(bodyText);

    return result.translations.map(
        (translation: any) => translation.text
    );
}