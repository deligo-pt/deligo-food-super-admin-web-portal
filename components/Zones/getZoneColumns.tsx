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
import {
    softDeleteZone,
    permanentDeleteZone,
    toggleZoneStatus
} from "@/services/dashboard/zone/zone.service";
import { IZone } from "@/types/zone.type";
import {
    MapPin,
    MoreVertical,
    Eye,
    Pencil,
    Power,
    Trash2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useState } from "react";
import DeleteModal from "../Modals/DeleteModal";

type TFunction = (key: string) => string;

interface UseZoneColumnsParams {
    t: TFunction;
    onRefresh?: () => void;
}

export function useZoneColumns({
    t,
    onRefresh,
}: UseZoneColumnsParams) {
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
        variant: "destructive",
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
            console.log("error in zone", error);
        } finally {
            setIsPending(false);
        }
    };

    const openToggleModal = (zone: IZone) => {
        const willBeOperational = !zone.isOperational;
        setModalState({
            isOpen: true,
            title: willBeOperational ? "Activate Zone" : "Deactivate Zone",
            description: `Are you sure you want to ${willBeOperational ? "activate" : "deactivate"} "${zone.zoneName}"?`,
            confirmText: willBeOperational ? "Activate" : "Deactivate",
            variant: "default",
            action: async () => {
                const toastId = toast.loading("Updating status...");
                const result = await toggleZoneStatus(zone.zoneId, willBeOperational);
                if (result.success) {
                    toast.success(result?.message, { id: toastId });
                } else {
                    toast.error(result.message || "Failed to update status", { id: toastId });
                }
            },
        });
    };

    const openSoftDeleteModal = (zone: IZone) => {
        setModalState({
            isOpen: true,
            title: "Soft Delete Zone",
            description: `Are you sure you want to soft delete "${zone.zoneName}"? It can be restored later if needed.`,
            confirmText: "Soft Delete",
            variant: "destructive",
            action: async () => {
                const toastId = toast.loading("Deleting zone...");
                const result = await softDeleteZone(zone.zoneId);
                if (result.success) {
                    toast.success("Zone soft-deleted successfully", { id: toastId });
                } else {
                    toast.error(result.message || "Failed to soft delete zone", { id: toastId });
                }
            },
        });
    };

    const openPermanentDeleteModal = (zone: IZone) => {
        setModalState({
            isOpen: true,
            title: "Permanently Delete Zone",
            description: `Warning: This action is permanent and cannot be undone. Are you sure you want to permanently delete "${zone.zoneName}"?`,
            confirmText: "Permanent Delete",
            variant: "destructive",
            action: async () => {
                const toastId = toast.loading("Deleting zone....");
                const result = await permanentDeleteZone(zone.zoneId);
                if (result.success) {
                    toast.success("Zone permanently deleted", { id: toastId });
                } else {
                    toast.error(result.message || "Failed to permanently delete zone", { id: toastId });
                }
            },
        });
    };

    const columns: Column<IZone>[] = [
        {
            header: (
                <div className="flex items-center gap-2 text-[#DC3173] font-medium">
                    <MapPin size={16} />
                    <span>Zone</span>
                </div>
            ),
            accessor: (zone) => (
                <div className="min-w-45">
                    <div className="font-medium text-gray-900">{zone.zoneName}</div>
                    <div className="text-xs text-gray-400 font-mono">{zone.zoneId}</div>
                </div>
            ),
        },
        {
            header: <span className="text-[#DC3173] font-medium">District</span>,
            accessor: (zone) => (
                <span className="text-sm text-gray-700">{zone.district}</span>
            ),
        },
        {
            header: <span className="text-[#DC3173] font-medium">Area</span>,
            accessor: (zone) => (
                <span className="text-sm font-medium">
                    {zone.areaKm2?.toFixed(2)} km²
                </span>
            ),
        },
        {
            header: (
                <div className="text-center text-[#DC3173] font-medium">Status</div>
            ),
            className: "text-center",
            accessor: (zone) =>
                zone.isOperational ? (
                    <Badge className="bg-green-50 text-green-700 border-green-200">
                        Operational
                    </Badge>
                ) : (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                        Inactive
                    </Badge>
                ),
        },
        {
            header: <span className="text-[#DC3173] font-medium">Min Fee</span>,
            accessor: (zone) => (
                <span className="text-sm">
                    {zone.minDeliveryFee != null ? `€${zone.minDeliveryFee}` : "—"}
                </span>
            ),
        },
        {
            header: <span className="text-[#DC3173] font-medium">Max Distance</span>,
            accessor: (zone) => (
                <span className="text-sm">
                    {zone.maxDeliveryDistanceKm != null
                        ? `${zone.maxDeliveryDistanceKm} km`
                        : "—"}
                </span>
            ),
        },
        {
            header: (
                <div className="text-right pr-4 text-[#DC3173] font-medium">
                    Actions
                </div>
            ),
            className: "text-right pr-4",
            accessor: (zone) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                        >
                            <MoreVertical size={16} />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem asChild>
                            <Link
                                href={`/admin/zones/${zone.zoneId}`}
                                className="flex items-center gap-2 cursor-pointer"
                            >
                                <Eye size={16} />
                                View Details
                            </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                            <Link
                                href={`/admin/zones/${zone.zoneId}/edit`}
                                className="flex items-center gap-2 cursor-pointer"
                            >
                                <Pencil size={16} />
                                Edit
                            </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            onClick={() => openToggleModal(zone)}
                            className="flex items-center gap-2 cursor-pointer"
                        >
                            <Power size={16} />
                            {zone.isOperational ? "Deactivate" : "Activate"}
                        </DropdownMenuItem>

                        {zone.isDeleted ? (
                            <DropdownMenuItem
                                onClick={() => openPermanentDeleteModal(zone)}
                                className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
                            >
                                <Trash2 size={16} />
                                Permanent Delete
                            </DropdownMenuItem>
                        ) : (
                            <DropdownMenuItem
                                onClick={() => openSoftDeleteModal(zone)}
                                className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
                            >
                                <Trash2 size={16} />
                                Soft Delete
                            </DropdownMenuItem>
                        )}
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