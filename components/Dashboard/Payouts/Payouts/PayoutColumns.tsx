
import { Column } from "@/components/common/ReusableTable";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { USER_ROLE } from "@/consts/user.const";
import { TPayout } from "@/types/payout.type";
import { downloadFileFromAnyLink } from "@/utils/downloadFromLink";
import { formatPrice } from "@/utils/formatPrice";
import { format } from "date-fns";
import {
    CalendarCheck,
    CalendarMinus,
    CalendarPlus,
    Cog,
    Euro,
    FileText,
    MoreVertical,
    Store,
    Truck,
    UserCog,
} from "lucide-react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

type TFunction = (key: string) => string;

interface GetPayoutColumnsParams {
    t: TFunction;
    router: AppRouterInstance;
    userRole: "VENDOR" | "FLEET_MANAGER" | "DELIVERY_PARTNER";
}

const payoutLinks = {
    VENDOR: "/admin/vendor-payouts",
    FLEET_MANAGER: "/admin/fleet-manager-payouts",
    DELIVERY_PARTNER: "/admin/delivery-partner-payouts",
} as const;

export function getPayoutColumns({
    t,
    router,
    userRole,
}: GetPayoutColumnsParams): Column<TPayout>[] {
    const roleHeader = (() => {
        if (userRole === USER_ROLE.VENDOR) {
            return (
                <>
                    <Store className="w-4" />
                    {t("vendor")}
                </>
            );
        }
        if (userRole === USER_ROLE.FLEET_MANAGER) {
            return (
                <>
                    <UserCog className="w-4" />
                    {t("fleet_manager")}
                </>
            );
        }
        return (
            <>
                <Truck className="w-4" />
                {t("delivery_partner")}
            </>
        );
    })();

    return [
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    {roleHeader}
                </div>
            ),
            accessor: (payout) => (
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage
                            src={payout?.userId?.profilePhoto}
                            alt={`${payout?.userId?.name?.firstName} ${payout?.userId?.name?.lastName}`}
                        />
                        <AvatarFallback>
                            {payout?.userId?.name?.firstName?.charAt(0)}
                            {payout?.userId?.name?.lastName?.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="font-semibold">
                            {payout?.userId?.name?.firstName}{" "}
                            {payout?.userId?.name?.lastName}
                        </div>
                        <div className="text-xs text-slate-400">
                            {payout?.userId?.userId}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <CalendarPlus className="w-4" />
                    {t("start_date")}
                </div>
            ),
            accessor: (payout) =>
                payout.startDate ? format(payout.startDate, "do MMM yyyy") : "-",
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <CalendarMinus className="w-4" />
                    {t("end_date")}
                </div>
            ),
            accessor: (payout) =>
                payout.endDate ? format(payout.endDate, "do MMM yyyy") : "-",
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <Euro className="w-4" />
                    {t("amount")}
                </div>
            ),
            accessor: (payout) => `€${formatPrice(Number(payout.amount) || 0)}`,
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <CalendarCheck className="w-4" />
                    {t("payment_date")}
                </div>
            ),
            accessor: (payout) =>
                payout.paymentDate
                    ? format(payout.paymentDate, "do MMM yyyy")
                    : "-",
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <FileText className="w-4" />
                    {t("document")}
                </div>
            ),
            accessor: (payout) =>
                payout.payoutProof ? (
                    <button
                        onClick={() =>
                            downloadFileFromAnyLink(payout.payoutProof as string)
                        }
                        className="flex items-center gap-1 bg-[#DC3173] hover:bg-[#DC3173]/90 text-white px-2 py-1.5 font-semibold text-[10px] rounded-md"
                    >
                        Download
                    </button>
                ) : (
                    "-"
                ),
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center justify-end">
                    <Cog className="w-4" />
                    {t("actions")}
                </div>
            ),
            className: "text-right",
            accessor: (payout) => (
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <MoreVertical className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            onClick={() =>
                                router.push(
                                    `${payoutLinks[userRole]}/${payout.payoutId}`,
                                )
                            }
                        >
                            {t("view")}
                        </DropdownMenuItem>

                        {payout.status === "PENDING" && (
                            <DropdownMenuItem
                                onClick={() =>
                                    router.push(
                                        `${payoutLinks[userRole]}/${payout.payoutId}/settle`,
                                    )
                                }
                            >
                                {t("settle_payout")}
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];
}