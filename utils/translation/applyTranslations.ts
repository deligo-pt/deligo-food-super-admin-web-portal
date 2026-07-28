import { ApplyTranslationOptions } from "@/types/translation.type";



export function applyTranslations({
    object,
    paths,
    translations,
    sourceLanguage,
    targetLanguage,
}: ApplyTranslationOptions) {
    const cloned = structuredClone(object);

    paths.forEach((path, index) => {
        const keys = path.split(".");

        let current = cloned;

        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];

            const isLast = i === keys.length - 1;

            if (!isLast) {
                current = current[key];
                continue;
            }

            current[key] = {
                ...current[key],

                [sourceLanguage]: current[key][sourceLanguage],

                [targetLanguage]: translations[index],
            };
        }
    });

    return cloned;
}