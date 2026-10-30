"use client";

import { useTranslation } from "@/hooks/use-translation";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useOptimistic, useTransition } from "react";

export type TProductTab = "ALL" | "ACTIVE" | "INACTIVE" | "SDR";

interface IProps {
    counts: { all: number; active: number; inactive: number; sdr: number };
}

/**
 * Four independent tabs. Each one rewrites the status-related query params
 * (and keeps search / sort untouched):
 *   All          -> meta.status=ALL            (server strips it for the backend)
 *   Active       -> meta.status=ACTIVE
 *   Inactive     -> meta.status=INACTIVE
 *   SDR Products -> sdr.applicable=true        (no meta.status)
 */
export default function ProductStatusTabs({ counts }: IProps) {
    const { t } = useTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const current: TProductTab =
        searchParams.get("sdr.applicable") === "true"
            ? "SDR"
            : (searchParams.get("meta.status") as TProductTab) || "ACTIVE";

    // highlight the clicked tab immediately, before the server responds
    const [optimisticTab, setOptimisticTab] =
        useOptimistic<TProductTab>(current);

    const tabs: { value: TProductTab; label: string; count: number }[] = [
        { value: "ALL", label: t("all") || "All", count: counts.all },
        { value: "ACTIVE", label: t("active") || "Active", count: counts.active },
        {
            value: "INACTIVE",
            label: t("inactive") || "Inactive",
            count: counts.inactive,
        },
        {
            value: "SDR",
            label: t("sdr_products") || "SDR Products",
            count: counts.sdr,
        },
    ];

    const onSelect = (value: TProductTab) => {
        if (value === current) return;
        const params = new URLSearchParams(searchParams.toString());

        // tabs are mutually exclusive → reset both, then set the one we need
        params.delete("meta.status");
        params.delete("sdr.applicable");
        params.delete("page");

        if (value === "SDR") params.set("sdr.applicable", "true");
        else params.set("meta.status", value);

        startTransition(() => {
            setOptimisticTab(value);
            router.replace(`?${params.toString()}`, { scroll: false });
        });
    };

    return (
        <div className="px-1 py-2">
            <div
                role="tablist"
                aria-busy={isPending}
                className={`inline-flex items-center gap-1 rounded-full border border-gray-100 bg-white p-1 shadow-sm transition-opacity ${isPending ? "opacity-80" : ""
                    }`}
            >
                {tabs.map((tab) => {
                    const isActive = optimisticTab === tab.value;
                    return (
                        <button
                            key={tab.value}
                            type="button"
                            role="tab"
                            aria-selected={isActive}
                            onClick={() => onSelect(tab.value)}
                            className="relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium cursor-pointer whitespace-nowrap"
                        >
                            {isActive && (
                                <motion.span
                                    layoutId="product-status-pill"
                                    className="absolute inset-0 rounded-full bg-[#DC3173]"
                                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                                />
                            )}
                            <span
                                className={`relative z-10 transition-colors ${isActive ? "text-white" : "text-gray-600 hover:text-gray-900"
                                    }`}
                            >
                                {tab.label}
                            </span>
                            <span
                                className={`relative z-10 min-w-7 rounded-full px-2 py-0.5 text-center text-xs transition-colors ${isActive
                                        ? "bg-white/25 text-white"
                                        : "bg-gray-100 text-gray-500"
                                    }`}
                            >
                                {tab.count}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}