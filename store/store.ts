import { create } from "zustand";
import { persist } from "zustand/middleware";

type StoreState = {
  lang: "en" | "pt";
  setLang: (selectedLang: "en" | "pt") => void;
};

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      lang: "pt",
      setLang: (selectedLang) => set({ lang: selectedLang }),
    }),
    {
      name: "app-storage",
      partialize: (state) => ({ lang: state.lang })
    }
  )
);
