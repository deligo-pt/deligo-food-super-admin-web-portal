/* eslint-disable @typescript-eslint/no-explicit-any */
export type Language = "en" | "pt";

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