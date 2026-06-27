import { extractFields } from "./extractFields";
import { applyTranslations } from "./applyTranslations";
import { Language } from "@/types/translation.type";


export async function translateObject<T>(
    object: T,
    sourceLanguage: Language
): Promise<T> {
    const targetLanguage =
        sourceLanguage === "en"
            ? "pt"
            : "en";

    const sourceLang =
        sourceLanguage.toUpperCase();

    const targetLang =
        targetLanguage.toUpperCase();

    const {
        texts,
        paths,
    } = extractFields(
        object,
        sourceLanguage
    );

    if (!texts.length) {
        return object;
    }

    const response = await fetch(
        "/api/translate",
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json",
            },

            body: JSON.stringify({
                texts,
                sourceLang,
                targetLang,
            }),
        }
    );

    if (!response.ok) {
        throw new Error(
            "Translation failed"
        );
    }

    const result =
        await response.json();

    return applyTranslations({
        object,
        paths,
        translations:
            result.translations,
        sourceLanguage,
        targetLanguage,
    });
}