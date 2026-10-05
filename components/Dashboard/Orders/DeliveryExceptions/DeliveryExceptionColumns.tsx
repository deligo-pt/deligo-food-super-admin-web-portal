import { Column } from "@/components/common/ReusableTable";
import { TDeliveryException } from "@/types/delivery-exception.type";
import { format } from "date-fns";
import {
    AlertTriangle,
    CalendarIcon,
    Cog,
    HashIcon,
    MapPin,
    MoreVertical,
    PackageIcon,
    Phone,
    Tag,
    UserIcon,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { Badge } from "@/components/ui/badge";

type TFunction = (key: string) => string;

interface GetDeliveryExceptionColumnsParams {
    t: TFunction;
    router: AppRouterInstance;
}

const formatStatus = (status?: string) =>
    status
        ?.split("_")
        ?.map((word) => word.charAt(0) + word.slice(1)?.toLowerCase())
        ?.join(" ") || "N/A";

export function getDeliveryExceptionColumns({
    t,
    router,
}: GetDeliveryExceptionColumnsParams): Column<TDeliveryException>[] {
    return [
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <HashIcon className="w-4" />
                    {t("order_id")}
                </div>
            ),
            accessor: "orderId",
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <CalendarIcon className="w-4" />
                    {t("opened_at")}
                </div>
            ),
            accessor: (row) =>
                row.exception?.openedAt
                    ? format(new Date(row.exception.openedAt), "do MMM yyyy, HH:mm")
                    : "N/A",
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <AlertTriangle className="w-4" />
                    {t("exception_type")}
                </div>
            ),
            accessor: (row) => formatStatus(row.exception?.type),
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <Tag className="w-4" />
                    {t("status")}
                </div>
            ),
            accessor: (row) => {
                const status = row.exception?.status;
                const isOpen = status === "OPEN";
                return (
                    <Badge
                        variant={isOpen ? "destructive" : "secondary"}
                        className={isOpen ? "bg-red-100 text-red-700 hover:bg-red-100" : ""}
                    >
                        {formatStatus(status)}
                    </Badge>
                );
            },
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <Tag className="w-4" />
                    {t("issue_tags")}
                </div>
            ),
            accessor: (row) =>
                row.exception?.issueTags?.length ? (
                    <div className="flex flex-wrap gap-1">
                        {row.exception.issueTags.map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                                {tag}
                            </Badge>
                        ))}
                    </div>
                ) : (
                    "—"
                ),
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <UserIcon className="w-4" />
                    {t("rider")}
                </div>
            ),
            accessor: (row) => (
                <div>
                    <div className="font-medium">
                        {row.deliveryPartner?.name || "N/A"}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {row.deliveryPartner?.contactNumber || "—"}
                    </div>
                </div>
            ),
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <PackageIcon className="w-4" />
                    {t("vendor")}
                </div>
            ),
            accessor: (row) => row.vendorName || "N/A",
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <MapPin className="w-4" />
                    {t("location")}
                </div>
            ),
            accessor: (row) => {
                const loc = row.exception?.location;
                if (!loc) return "N/A";
                return (
                    <div className="text-xs">
                        <div>
                            {loc.latitude.toFixed(5)}, {loc.longitude.toFixed(5)}
                        </div>
                        {loc.isStale && (
                            <span className="text-amber-600 font-medium">Stale</span>
                        )}
                    </div>
                );
            },
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <AlertTriangle className="w-4" />
                    {t("reports")}
                </div>
            ),
            accessor: (row) => row.exception?.reportCount ?? 0,
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center justify-end">
                    <Cog className="w-4" />
                    {t("actions")}
                </div>
            ),
            className: "text-right",
            accessor: (row) => {
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <MoreVertical className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={() =>
                                    router.push(`/admin/delivery-exceptions/${row.orderId}`)
                                }
                            >
                                {t("view")}
                            </DropdownMenuItem>
                            {/* More actions later */}
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];
}