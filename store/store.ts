import { create } from "zustand";

type StoreState = {
  lang: "en" | "pt";
  setLang: (selectedLang: "en" | "pt") => void;
};

export const useStore = create<StoreState>((set) => ({
  lang: "pt",
  setLang: (selectedLang) => set({ lang: selectedLang }),
}));
