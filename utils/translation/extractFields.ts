/* eslint-disable @typescript-eslint/no-explicit-any */

import { Language, TranslationResult } from "@/types/translation.type";



function isTranslatableField(value: any): boolean {
    if (!value || typeof value !== "object") return false;

    return (
        Object.prototype.hasOwnProperty.call(value, "en") &&
        Object.prototype.hasOwnProperty.call(value, "pt")
    );
}

export function extractFields(
    object: any,
    sourceLanguage: Language
): TranslationResult {
    const texts: string[] = [];
    const paths: string[] = [];

    function traverse(current: any, currentPath: string) {
        if (current === null || current === undefined) return;

        // Array
        if (Array.isArray(current)) {
            current.forEach((item, index) => {
                traverse(item, `${currentPath}.${index}`);
            });

            return;
        }

        // Primitive
        if (typeof current !== "object") return;

        // Translation Object
        if (isTranslatableField(current)) {
            texts.push(current[sourceLanguage] ?? "");
            paths.push(currentPath);

            return;
        }

        // Continue Traversing
        Object.entries(current).forEach(([key, value]) => {
            const nextPath = currentPath
                ? `${currentPath}.${key}`
                : key;

            traverse(value, nextPath);
        });
    }

    traverse(object, "");

    return {
        texts,
        paths,
    };
}