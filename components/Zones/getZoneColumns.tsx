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
import { softDeleteZone, toggleZoneStatus } from "@/services/dashboard/zone/zone.service";
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

type TFunction = (key: string) => string;

interface GetZoneColumnsParams {
    t: TFunction;
    onRefresh?: () => void;
}

export function getZoneColumns({
    t,
    onRefresh,
}: GetZoneColumnsParams): Column<IZone>[] {
    const handleToggle = async (zone: IZone) => {
        const result = await toggleZoneStatus(zone.zoneId, !zone.isOperational);
        if (result.success) {
            toast.success(
                zone.isOperational ? "Zone deactivated" : "Zone activated"
            );
            onRefresh?.();
        } else {
            toast.error(result.message || "Failed to update status");
        }
    };

    const handleSoftDelete = async (zone: IZone) => {
        if (!confirm(`Soft delete zone "${zone.zoneName}"?`)) return;

        const result = await softDeleteZone(zone.zoneId);
        if (result.success) {
            toast.success("Zone soft-deleted");
            onRefresh?.();
        } else {
            toast.error(result.message || "Failed to delete");
        }
    };

    return [
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
                            onClick={() => handleToggle(zone)}
                            className="flex items-center gap-2 cursor-pointer"
                        >
                            <Power size={16} />
                            {zone.isOperational ? "Deactivate" : "Activate"}
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            onClick={() => handleSoftDelete(zone)}
                            className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
                        >
                            <Trash2 size={16} />
                            Soft Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];
}