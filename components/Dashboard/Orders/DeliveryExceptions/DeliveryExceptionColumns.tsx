import { Column } from "@/components/common/ReusableTable";
import { TDeliveryException, TExceptionAction } from "@/types/delivery-exception.type";
import { format } from "date-fns";
import {
    AlertTriangle,
    CalendarIcon,
    Cog,
    HashIcon,
    Lock,
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
    setAction: (action: TExceptionAction | null) => void;
}

const formatStatus = (status?: string) =>
    status
        ?.split("_")
        ?.map((word) => word.charAt(0) + word.slice(1)?.toLowerCase())
        ?.join(" ") || "N/A";

export function getDeliveryExceptionColumns({
    t,
    router,
    setAction,
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
                    <PackageIcon className="w-4" />
                    {t("order_status")}
                </div>
            ),
            accessor: (row) => formatStatus(row.orderStatus),
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
                    <Lock className="w-4" />
                    {t("otp_locked")}
                </div>
            ),
            accessor: (row) => {
                const otp = row.deliveryOtp;
                const isLocked = !!otp?.lockedAt;

                return (
                    <div className="text-sm">
                        {isLocked ? (
                            <>
                                <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                                    {t("yes") || "Yes"}
                                </Badge>
                                <div className="text-xs text-slate-500 mt-1">
                                    {format(new Date(otp.lockedAt!), "do MMM yyyy, HH:mm")}
                                </div>
                            </>
                        ) : (
                            <Badge variant="secondary" className="bg-green-50 text-green-700">
                                {t("no") || "No"}
                            </Badge>
                        )}
                    </div>
                );
            },
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
                const isAcknowledged = !!row.exception?.acknowledgedAt;
                const status = row.orderStatus;

                const inTransit =
                    status === "PICKED_UP" || status === "ON_THE_WAY";
                const atReady = status === "READY_FOR_PICKUP";

                const isOtpLocked = !!row.deliveryOtp?.lockedAt;

                // ── Visibility rules (aligned with your docs) ──
                const canAcknowledge = !isAcknowledged;
                const canReplace = (inTransit || atReady);
                const canFaultCancel = (inTransit || atReady);

                // Reset OTP only when actually locked + in transit
                // (at READY_FOR_PICKUP no OTP exists yet)
                const canResetOtp = isOtpLocked && inTransit;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <MoreVertical className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {/* Always available */}
                            {/* <DropdownMenuItem
                                onClick={() =>
                                    router.push(`/admin/delivery-exceptions/${row.orderId}`)
                                }
                            >
                                {t("view")}
                            </DropdownMenuItem> */}

                            {canAcknowledge && (
                                <DropdownMenuItem
                                    onClick={() =>
                                        setAction({ type: "acknowledge", orderId: row.orderId })
                                    }
                                >
                                    {t("acknowledge")}
                                </DropdownMenuItem>
                            )}

                            <DropdownMenuItem
                                onClick={() =>
                                    setAction({ type: "resolve", orderId: row.orderId })
                                }
                            >
                                {t("resolve")}
                            </DropdownMenuItem>


                            {canReplace && (
                                <DropdownMenuItem
                                    onClick={() =>
                                        setAction({ type: "replace", orderId: row.orderId })
                                    }
                                >
                                    {t("replace_rider")}
                                </DropdownMenuItem>
                            )}

                            {/* Only when OTP is locked */}
                            {canResetOtp && (
                                <DropdownMenuItem
                                    onClick={() =>
                                        setAction({ type: "resetOtp", orderId: row.orderId })
                                    }
                                >
                                    {t("reset_otp")}
                                </DropdownMenuItem>
                            )}

                            {canFaultCancel && (
                                <DropdownMenuItem
                                    onClick={() =>
                                        setAction({ type: "faultCancel", orderId: row.orderId })
                                    }
                                    className="text-red-600 focus:text-red-600"
                                >
                                    {t("fault_cancel")}
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];
}