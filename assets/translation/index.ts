import { en } from "./en";
import { pt } from "./pt";

export const translations = {
    en,
    pt
};


export type LanguageCode = keyof typeof translations