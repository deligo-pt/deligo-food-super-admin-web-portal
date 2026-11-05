// src/components/Dashboard/Reward&Claims/GetRewardProductColumns.tsx
"use client";

import { Column } from "@/components/common/ReusableTable";
import DeleteModal from "@/components/Modals/DeleteModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { updateRewardProduct } from "@/services/dashboard/reward&claims/reward-claims.service";
import { IRewardProduct, RewardTargetRole } from "@/types/reward-claim.type";
import { Gift, MoreVertical, Pencil, Power } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type TFunction = (key: string) => string;

interface UseRewardProductColumnsParams {
    t: TFunction;
    onRefresh?: () => void;
    onEdit: (product: IRewardProduct) => void;
}

const ROLE_STYLES: Record<RewardTargetRole, string> = {
    Customer: "bg-blue-50 text-blue-700 border-blue-200",
    Rider: "bg-amber-50 text-amber-700 border-amber-200",
    Vendor: "bg-purple-50 text-purple-700 border-purple-200",
};

const euro = (n: number) => `€${n.toFixed(2)}`;

export function useRewardProductColumns({ t, onRefresh, onEdit }: UseRewardProductColumnsParams) {
    const tr = (key: string, fallback: string) => t(key) || fallback;

    const [modalState, setModalState] = useState<{
        isOpen: boolean;
        title: string;
        description: string;
        confirmText: string;
        variant: "default" | "destructive";
        action: () => Promise<unknown>;
    }>({
        isOpen: false,
        title: "",
        description: "",
        confirmText: "Confirm",
        variant: "default",
        action: async () => { },
    });
    const [isPending, setIsPending] = useState(false);

    const handleConfirmAction = async () => {
        setIsPending(true);
        try {
            await modalState.action();
            setModalState((prev) => ({ ...prev, isOpen: false }));
            onRefresh?.();
        } catch (error) {
            console.log("error in reward product", error);
        } finally {
            setIsPending(false);
        }
    };

    // No toggle endpoint: PATCH { isActive } is the documented way to hide/show
    const openToggleModal = (product: IRewardProduct) => {
        const willBeActive = !product.isActive;
        setModalState({
            isOpen: true,
            title: willBeActive
                ? tr("activate_product", "Activate product")
                : tr("deactivate_product", "Deactivate product"),
            description: willBeActive
                ? `"${product.name}" ${tr("will_be_visible_and_claimable", "will appear in the user catalog and can be claimed again.")}`
                : `"${product.name}" ${tr("will_be_hidden_and_unclaimable", "will be hidden from the user catalog and can no longer be claimed. Existing claims are not affected.")}`,
            confirmText: willBeActive ? tr("activate", "Activate") : tr("deactivate", "Deactivate"),
            variant: willBeActive ? "default" : "destructive",
            action: async () => {
                const toastId = toast.loading("Updating status...");
                const result = await updateRewardProduct(product._id, { isActive: willBeActive });
                if (result?.success) {
                    toast.success(result.message || "Status updated", { id: toastId });
                } else {
                    toast.error(result?.message || "Failed to update status", { id: toastId });
                }
            },
        });
    };

    const columns: Column<IRewardProduct>[] = [
        {
            header: (
                <div className="flex items-center gap-2 text-[#DC3173] font-medium">
                    <Gift size={16} />
                    <span>{tr("product", "Product")}</span>
                </div>
            ),
            accessor: (p) => <div className="min-w-40 font-medium text-gray-900">{p.name}</div>,
        },
        {
            header: <span className="text-[#DC3173] font-medium">{tr("target_role", "Target role")}</span>,
            accessor: (p) => (
                <Badge variant="outline" className={ROLE_STYLES[p.targetRole]}>
                    {p.targetRole}
                </Badge>
            ),
        },
        {
            header: <span className="text-[#DC3173] font-medium">{tr("required_points", "Points")}</span>,
            accessor: (p) => (
                <span className="text-sm font-semibold text-gray-800">
                    {p.requiredPoints.toLocaleString()} pts
                </span>
            ),
        },
        {
            header: <span className="text-[#DC3173] font-medium">{tr("cash_price", "Cash price")}</span>,
            accessor: (p) =>
                p.cashPrice === 0 ? (
                    <span className="text-sm font-medium text-emerald-600">{tr("free", "Free")}</span>
                ) : (
                    <span className="text-sm font-medium text-gray-800">{euro(p.cashPrice)}</span>
                ),
        },
        {
            header: <span className="text-[#DC3173] font-medium">{tr("regular_price", "Regular price")}</span>,
            accessor: (p) => (
                <span
                    className={
                        p.regularPrice > p.cashPrice
                            ? "text-sm text-gray-400 line-through"
                            : "text-sm text-gray-600"
                    }
                >
                    {euro(p.regularPrice)}
                </span>
            ),
        },
        {
            header: <div className="text-center text-[#DC3173] font-medium">{tr("status", "Status")}</div>,
            className: "text-center",
            accessor: (p) =>
                p.isActive ? (
                    <Badge className="bg-green-50 text-green-700 border-green-200">
                        {tr("active", "Active")}
                    </Badge>
                ) : (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                        {tr("inactive", "Inactive")}
                    </Badge>
                ),
        },
        {
            header: (
                <div className="text-right pr-4 text-[#DC3173] font-medium">{tr("actions", "Actions")}</div>
            ),
            className: "text-right pr-4",
            accessor: (p) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                            <MoreVertical size={16} />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                            onClick={() => onEdit(p)}
                            className="flex items-center gap-2 cursor-pointer"
                        >
                            <Pencil size={16} />
                            {tr("edit", "Edit")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => openToggleModal(p)}
                            className="flex items-center gap-2 cursor-pointer"
                        >
                            <Power size={16} />
                            {p.isActive ? tr("deactivate", "Deactivate") : tr("activate", "Activate")}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    return {
        columns,
        renderModal: (
            <DeleteModal
                open={modalState.isOpen}
                onOpenChange={(open) => setModalState((prev) => ({ ...prev, isOpen: open }))}
                onConfirm={handleConfirmAction}
                isDeleting={isPending}
                title={modalState.title}
                description={modalState.description}
                confirmText={modalState.confirmText}
                variant={modalState.variant}
            />
        ),
    };
}