/* eslint-disable @typescript-eslint/no-explicit-any */
export type Language = "en" | "pt";

/** Why `/api/translate` could not translate (see `utils/translation/requestTranslations.ts`). */
export type TranslationErrorCode =
    | "QUOTA_EXCEEDED"
    | "RATE_LIMITED"
    | "UNAUTHORIZED"
    | "INVALID_REQUEST"
    | "UNAVAILABLE";

export interface TranslationResult {
    texts: string[];
    paths: string[];
}

export interface ApplyTranslationOptions {
    object: any;
    paths: string[];
    translations: string[];
    sourceLanguage: Language;
    targetLanguage: Language;
}