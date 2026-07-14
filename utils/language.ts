import Cookies from "js-cookie";

export const LANGUAGE_COOKIE = "lang";

export const setLanguageCookie = (lang: "en" | "pt") => {
    Cookies.set(LANGUAGE_COOKIE, lang, {
        expires: 365,
        path: "/",
        sameSite: "lax",
    });
};

export const getLanguageCookie = () => {
    return Cookies.get(LANGUAGE_COOKIE);
};