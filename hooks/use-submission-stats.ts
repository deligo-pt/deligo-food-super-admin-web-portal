"use client";

import { getSubmissionStats } from "@/services/dashboard/analytics/analytics.service";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

export type TSubmissionStats = {
    admin: number;
    vendor: number;
    subVendor: number;
    deliveryPartner: number;
    fleetManager: number;
    total: number;
};

const EMPTY: TSubmissionStats = {
    admin: 0,
    vendor: 0,
    subVendor: 0,
    deliveryPartner: 0,
    fleetManager: 0,
    total: 0,
};

export function useSubmissionStats(intervalMs = 30_000) {
    const pathname = usePathname();
    const [stats, setStats] = useState<TSubmissionStats>(EMPTY);
    const inFlight = useRef(false);

    const refresh = useCallback(async () => {
        if (inFlight.current) return;
        inFlight.current = true;
        try {
            const result = await getSubmissionStats();
            if (!result?.success || !result.data) return;

            const d = result.data;
            setStats({
                admin: d.admin?.submitted ?? 0,
                vendor: d.vendor?.submitted ?? 0,
                subVendor: d.subVendor?.submitted ?? 0,
                deliveryPartner: d.deliveryPartner?.submitted ?? 0,
                fleetManager: d.fleetManager?.submitted ?? 0,
                total: d.totals?.submitted ?? 0,
            });
        } catch {
            /* keep old numbers */
        } finally {
            inFlight.current = false;
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh, pathname]);

    useEffect(() => {
        const id = setInterval(refresh, intervalMs);
        const onFocus = () => refresh();
        window.addEventListener("focus", onFocus);
        return () => {
            clearInterval(id);
            window.removeEventListener("focus", onFocus);
        };
    }, [refresh, intervalMs]);

    return { stats, refresh };
}