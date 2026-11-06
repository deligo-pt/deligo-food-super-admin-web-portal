

import { create } from "zustand";
import { persist } from "zustand/middleware";

type StoreState = {
  lang: "en" | "pt";
  setLang: (selectedLang: "en" | "pt") => void;

  // Temporary: only lives while VendorDetails is mounted
  vendor: string | null;
  setVendor: (vendor: string | null) => void;
  clearVendor: () => void;
};

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      lang: "pt",
      setLang: (selectedLang) => set({ lang: selectedLang }),

      vendor: null,
      setVendor: (vendor) => set({ vendor }),
      clearVendor: () => set({ vendor: null }),
    }),
    {
      name: "app-storage",
      // Only `lang` is saved to localStorage, so `vendor` is never persisted
      partialize: (state) => ({ lang: state.lang }),
    }
  )
);
