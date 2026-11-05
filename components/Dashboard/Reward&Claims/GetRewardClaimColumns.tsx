// src/components/Dashboard/Reward&Claims/GetRewardClaimColumns.tsx
"use client";

import { Column } from "@/components/common/ReusableTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ClaimStatus, IRewardClaim } from "@/types/reward-claim.type";
import {
    CLAIM_TRANSITIONS,
    ClaimUiAction,
} from "@/validations/reward-claim/reward-claim.validation";
import { CheckCircle2, MoreVertical, UserRound, XCircle } from "lucide-react";

type TFunction = (key: string) => string;

interface UseRewardClaimColumnsParams {
    t: TFunction;
    onAction: (claim: IRewardClaim, action: ClaimUiAction) => void;
}

const STATUS_STYLES: Record<ClaimStatus, string> = {
    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
    SCHEDULED: "bg-blue-50 text-blue-700 border-blue-200",
    COLLECTED: "bg-green-50 text-green-700 border-green-200",
    CANCELLED: "bg-gray-100 text-gray-600 border-gray-200",
};

const MODEL_LABEL: Record<string, string> = {
    Customer: "Customer",
    DeliveryPartner: "Rider",
    Vendor: "Vendor",
};

const euro = (n: number) => `€${n.toFixed(2)}`;

const formatDate = (iso?: string) =>
    iso
        ? new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
        : "—";

/** Holder fields depend on the profile type, so fall back gracefully. */
export const getClaimHolder = (claim: IRewardClaim) => {
    const profile = claim.userId?.id;
    const fullName = `${profile?.name?.firstName || ""} ${profile?.name?.lastName || ""}`.trim();
    return {
        name: fullName || profile?.email || (claim.userId ? "Unnamed user" : "Deleted user"),
        email: fullName ? profile?.email : undefined,
        code: profile?.userId,
        role: claim.userId ? MODEL_LABEL[claim.userId.model] ?? claim.userId.model : undefined,
    };
};

export function useRewardClaimColumns({ t, onAction }: UseRewardClaimColumnsParams) {
    const tr = (key: string, fallback: string) => t(key) || fallback;

    const columns: Column<IRewardClaim>[] = [
        {
            header: (
                <div className="flex items-center gap-2 text-[#DC3173] font-medium">
                    <UserRound size={16} />
                    <span>{tr("claimed_by", "Claimed by")}</span>
                </div>
            ),
            accessor: (claim) => {
                const holder = getClaimHolder(claim);
                return (
                    <div className="min-w-44">
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{holder.name}</span>
                            {holder.role && (
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                    {holder.role}
                                </Badge>
                            )}
                        </div>
                        {holder.email && <div className="text-xs text-gray-400">{holder.email}</div>}
                        {holder.code && (
                            <div className="text-xs text-gray-400 font-mono">{holder.code}</div>
                        )}
                    </div>
                );
            },
        },
        {
            header: <span className="text-[#DC3173] font-medium">{tr("product", "Product")}</span>,
            accessor: (claim) =>
                claim.productId ? (
                    <span className="text-sm font-medium text-gray-800">{claim.productId.name}</span>
                ) : (
                    <span className="text-sm text-gray-400 italic">
                        {tr("deleted_product", "Deleted product")}
                    </span>
                ),
        },
        {
            header: <span className="text-[#DC3173] font-medium">{tr("points_spent", "Points")}</span>,
            accessor: (claim) => (
                <span className="text-sm font-semibold text-gray-800">
                    {claim.pointsSpent.toLocaleString()} pts
                </span>
            ),
        },
        {
            header: (
                <span className="text-[#DC3173] font-medium">{tr("cash_to_collect", "Cash at pickup")}</span>
            ),
            accessor: (claim) =>
                claim.cashAmount === 0 ? (
                    <span className="text-sm font-medium text-emerald-600">{tr("free", "Free")}</span>
                ) : (
                    <span className="text-sm font-medium text-gray-800">{euro(claim.cashAmount)}</span>
                ),
        },
        {
            header: <span className="text-[#DC3173] font-medium">{tr("pickup_date", "Pickup")}</span>,
            accessor: (claim) => (
                <span className="text-sm text-gray-600" suppressHydrationWarning>
                    {formatDate(claim.scheduledPickupDate)}
                </span>
            ),
        },
        {
            header: <div className="text-center text-[#DC3173] font-medium">{tr("status", "Status")}</div>,
            className: "text-center",
            accessor: (claim) => (
                <Badge variant="outline" className={STATUS_STYLES[claim.status]}>
                    {claim.status}
                </Badge>
            ),
        },
        {
            header: (
                <div className="text-right pr-4 text-[#DC3173] font-medium">{tr("actions", "Actions")}</div>
            ),
            className: "text-right pr-4",
            accessor: (claim) => {
                const allowed = CLAIM_TRANSITIONS[claim.status];
                const canCollect = allowed.includes("COLLECTED");
                const canCancel = allowed.includes("CANCELLED");

                // COLLECTED / CANCELLED are final: no actions
                if (!canCollect && !canCancel) {
                    return <span className="text-gray-300 pr-3">—</span>;
                }

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                <MoreVertical size={16} />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            {canCollect && (
                                <DropdownMenuItem
                                    onClick={() => onAction(claim, "COLLECTED")}
                                    className="flex items-center gap-2 cursor-pointer"
                                >
                                    <CheckCircle2 size={16} />
                                    {tr("mark_collected", "Mark collected")}
                                </DropdownMenuItem>
                            )}
                            {canCancel && (
                                <DropdownMenuItem
                                    onClick={() => onAction(claim, "CANCELLED")}
                                    className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
                                >
                                    <XCircle size={16} />
                                    {tr("cancel_claim", "Cancel claim")}
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    return { columns };
}