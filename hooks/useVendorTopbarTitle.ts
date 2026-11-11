
"use client";

import { useStore } from "@/store/store";
import { useEffect } from "react";

export function useVendorTopbarTitle(name?: string | null) {
    const setVendor = useStore((s) => s.setVendor);
    const clearVendor = useStore((s) => s.clearVendor);

    useEffect(() => {
        setVendor(name?.trim() || null);
        return () => clearVendor();
    }, [name, setVendor, clearVendor]);
}