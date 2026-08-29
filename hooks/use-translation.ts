import { translations } from "@/assets/translation"
import { useStore } from "@/store/store"

type Language = keyof typeof translations

export const useTranslation = () => {
    const lang = useStore((state) => state.lang)

    const t = (key: string): string => {
        return (
            translations[lang]?.[key as keyof (typeof translations)[Language]] ||
            translations.en[key as keyof typeof translations.en] ||
            key
        )
    }

    return { t }
}
