import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TOfferType } from "@/types/offer.type";
import { TOfferStatus } from "@/utils/offer.util";
import { Flame, Gift, Percent, ShieldCheck, Sparkles, Tag } from "lucide-react";

export const STATUS_STYLES: Record<
    TOfferStatus,
    { label: string; pill: string; dot: string; bar: string }
> = {
    ACTIVE: {
        label: "Active",
        pill: "bg-emerald-50 text-emerald-700 border-emerald-200",
        dot: "bg-emerald-500",
        bar: "bg-emerald-500",
    },
    INACTIVE: {
        label: "Inactive",
        pill: "bg-amber-50 text-amber-700 border-amber-200",
        dot: "bg-amber-500",
        bar: "bg-amber-400",
    },
    EXPIRED: {
        label: "Expired",
        pill: "bg-gray-100 text-gray-600 border-gray-200",
        dot: "bg-gray-400",
        bar: "bg-gray-300",
    },
    SCHEDULED: {
        label: "Scheduled",
        pill: "bg-sky-50 text-sky-700 border-sky-200",
        dot: "bg-sky-500",
        bar: "bg-sky-400",
    },
};

export function OfferStatusBadge({ status }: { status: TOfferStatus }) {
    const s = STATUS_STYLES[status];
    return (
        <Badge variant="outline" className={cn("gap-1.5 font-medium", s.pill)}>
            <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
            {s.label}
        </Badge>
    );
}

export function OfferTypeIcon({
    type,
    size = 24,
    className,
}: {
    type: TOfferType;
    size?: number;
    className?: string;
}) {
    return (
        <div
            className={cn(
                "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-pink-100 text-pink-600",
                className,
            )}
        >
            {type === "PERCENT" && <Percent size={size} />}
            {type === "FLAT" && <Flame size={size} />}
            {type === "BUY_AND_REWARD" && <Gift size={size} />}
            {type === "BOGO" && <Tag size={size} />}
        </div>
    );
}

/** Shown beside the promo code on offers an admin created for a store */
export function AdminOfferBadge() {
    return (
        <Badge
            variant="outline"
            title="Created by an admin for this store"
            className="gap-1 border-[#DC3173]/30 bg-[#DC3173]/10 text-[#DC3173]"
        >
            <ShieldCheck size={12} />
            Admin offer
        </Badge>
    );
}

export function FirstOrderBadge({ scope }: { scope?: "GLOBAL" | "VENDOR" }) {
    return (
        <Badge
            variant="outline"
            className="gap-1 border-indigo-200 bg-indigo-50 text-indigo-700"
        >
            <Sparkles size={12} />
            First order{scope === "VENDOR" ? " (store)" : scope === "GLOBAL" ? " (platform)" : ""}
        </Badge>
    );
}