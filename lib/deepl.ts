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

    const params = new URLSearchParams();

    texts.forEach((text) => {
        params.append("text", text);
    });

    params.append("source_lang", sourceLang);
    params.append("target_lang", targetLang);

    const response = await fetch(
        "https://api-free.deepl.com/v2/translate",
        {
            method: "POST",
            headers: {
                Authorization: `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`,
                "Content-Type":
                    "application/x-www-form-urlencoded",
            },
            body: params,
        }
    );

    if (!response.ok) {
        throw new Error("DeepL Translation Failed");
    }

    const result = await response.json();

    return result.translations.map(
        (translation: any) => translation.text
    );
}