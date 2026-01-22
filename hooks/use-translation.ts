import { translations } from "@/assets/translation"
import { useStore } from "@/store/store"


export const useTranslation = () => {
    const lang = useStore((state) => state.lang)

    const t = (key: string): string => {
        return (
            (translations[lang] as Record<string, string>)?.[key] ||
            translations.en[key as keyof typeof translations.en] ||
            key
        )
    }

    return { t }
}
