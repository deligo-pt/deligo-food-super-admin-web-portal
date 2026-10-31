"use client";

import { useTranslation } from "@/hooks/use-translation";
import { useRouter, useSearchParams } from "next/navigation";
import { useOptimistic, useTransition } from "react";

export type TProductTab = "ALL" | "ACTIVE" | "INACTIVE" | "SDR";

interface IProps {
    counts: { all: number; active: number; inactive: number; sdr: number };
}


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
                className="inline-flex items-center gap-1 rounded-full border border-gray-100 bg-white p-1 shadow-sm"
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
                            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap cursor-pointer transition-colors duration-200 ${isActive
                                    ? "bg-[#DC3173] text-white shadow-sm"
                                    : "bg-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                }`}
                        >
                            <span>{tab.label}</span>
                            <span
                                className={`min-w-7 rounded-full px-2 py-0.5 text-center text-xs transition-colors duration-200 ${isActive
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