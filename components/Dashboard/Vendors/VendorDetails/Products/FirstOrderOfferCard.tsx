"use client";

import {
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
    ChevronDown,
    ChevronUp,
    Globe,
    Sparkles,
    Store,
    User,
    Wallet,
} from "lucide-react";
import { useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";

/**
 * Form fields this card reads and writes (add them to your zod schema + defaultValues):
 *   isFirstOrder                    boolean   default false
 *   firstOrderRequireVerifiedPhone  boolean   default true
 *   firstOrderMaxRestores           number    0 to 5, default 2
 *
 * Must be rendered inside <Form {...form}>.
 */

const COPY = {
    VENDOR: {
        subtitle: "Only for customers ordering from this store for the first time.",
        scopeChip: "This store",
        ScopeIcon: Store,
        funding:
            "The store funds this discount. It is deducted from the store's payout for that order.",
        limit: "A store can have only one active first-order offer.",
    },
    GLOBAL: {
        subtitle: "Only for customers placing their first order on the platform.",
        scopeChip: "All stores",
        ScopeIcon: Globe,
        funding:
            "The platform funds this discount. Vendors are still paid on the full price.",
        limit: "Only one global first-order offer can be active at a time.",
    },
} as const;

export function Toggle({
    checked,
    onChange,
    label,
}: {
    checked: boolean;
    onChange: (v: boolean) => void;
    label: string;
}) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            onClick={() => onChange(!checked)}
            className={cn(
                "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC3173]/40",
                checked ? "bg-[#DC3173]" : "bg-gray-300",
            )}
        >
            <span
                className={cn(
                    "inline-block h-5 w-5 rounded-full bg-white shadow transition-transform",
                    checked ? "translate-x-5" : "translate-x-0.5",
                )}
            />
        </button>
    );
}

export default function FirstOrderOfferCard({
    scope,
}: {
    scope: "VENDOR" | "GLOBAL";
}) {
    const { control } = useFormContext();
    const enabled = !!useWatch({ control, name: "isFirstOrder" });
    const [advancedOpen, setAdvancedOpen] = useState(false);
    const c = COPY[scope];

    return (
        <div className="rounded-3xl border border-pink-100 bg-pink-50/50 p-5">
            {/* header */}
            <FormField
                control={control}
                name="isFirstOrder"
                render={({ field }) => (
                    <FormItem className="space-y-0">
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-pink-100 text-[#DC3173]">
                                <Sparkles size={22} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="font-semibold text-gray-900">First-order offer</p>
                                <p className="text-sm text-gray-600">{c.subtitle}</p>
                            </div>
                            <FormControl>
                                <Toggle
                                    checked={!!field.value}
                                    onChange={field.onChange}
                                    label="First-order offer"
                                />
                            </FormControl>
                        </div>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {enabled && (
                <div className="mt-4 space-y-4 pl-0 md:pl-16">
                    <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-pink-200 bg-white px-3 py-1 text-xs font-medium text-[#DC3173]">
                            <User size={13} /> Once per customer
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-pink-200 bg-white px-3 py-1 text-xs font-medium text-[#DC3173]">
                            <c.ScopeIcon size={13} /> {c.scopeChip}
                        </span>
                    </div>

                    <div className="rounded-2xl border border-pink-100 bg-white px-4 py-3 text-sm text-gray-700">
                        <div className="flex items-start gap-3">
                            <Wallet size={18} className="mt-0.5 shrink-0 text-[#DC3173]" />
                            <div>
                                <p>{c.funding}</p>
                                <p className="mt-1 text-xs text-muted-foreground">{c.limit}</p>
                            </div>
                        </div>
                    </div>

                    {/* advanced */}
                    <div>
                        <button
                            type="button"
                            onClick={() => setAdvancedOpen((o) => !o)}
                            className="inline-flex items-center gap-1 text-sm font-semibold text-[#DC3173] hover:underline"
                            aria-expanded={advancedOpen}
                        >
                            Advanced settings
                            {advancedOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>

                        {advancedOpen && (
                            <div className="mt-3 space-y-5 rounded-2xl border border-pink-100 bg-white p-5">
                                <FormField
                                    control={control}
                                    name="firstOrderRequireVerifiedPhone"
                                    render={({ field }) => (
                                        <FormItem className="space-y-0">
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        Verified phone required
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        The customer must verify their phone number to get the
                                                        offer. This stops repeat use with new accounts.
                                                    </p>
                                                </div>
                                                <FormControl>
                                                    <Toggle
                                                        checked={field.value ?? true}
                                                        onChange={field.onChange}
                                                        label="Verified phone required"
                                                    />
                                                </FormControl>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={control}
                                    name="firstOrderMaxRestores"
                                    render={({ field }) => (
                                        <FormItem className="space-y-0">
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        Times it can be given back
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        If an order with this offer is cancelled before the
                                                        store accepts it, or the store rejects it, the
                                                        customer gets the offer back up to this many times.
                                                    </p>
                                                </div>
                                                <Select
                                                    value={String(field.value ?? 2)}
                                                    onValueChange={(v) => field.onChange(Number(v))}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="h-11 w-24 shrink-0">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {[0, 1, 2, 3, 4, 5].map((n) => (
                                                            <SelectItem key={n} value={String(n)}>
                                                                {n}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}