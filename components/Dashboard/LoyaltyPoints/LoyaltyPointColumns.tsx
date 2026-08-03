import { Column } from "@/components/common/ReusableTable";
import SupportRoleBadge from "@/components/SupportTickets/SupportRoleBadge";
import { TLoyaltyPoint } from "@/types/loyalty-point.type";
import { format } from "date-fns";
import {
    CalendarIcon,
    CoinsIcon,
    ShieldCheckIcon,
    ShoppingBagIcon,
    TrendingUpIcon,
    User,
} from "lucide-react";

type TFunction = (key: string) => string;

interface GetLoyaltyPointColumnsParams {
    t: TFunction;
}

export function getLoyaltyPointColumns({
    t,
}: GetLoyaltyPointColumnsParams): Column<TLoyaltyPoint>[] {
    return [
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <User className="w-4" />
                    {t("user")}
                </div>
            ),
            accessor: (point) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#DC3173]/20 rounded-full flex items-center justify-center text-sm text-[#DC3173]">
                        {point.userId?.id?.name?.firstName?.charAt(0)}
                        {point.userId?.id?.name?.lastName?.charAt(0)}
                    </div>

                    <div>
                        <div className="font-semibold">
                            {!point.userId?.id?.name?.firstName &&
                                !point.userId?.id?.name?.lastName
                                ? "N/A"
                                : `${point.userId?.id?.name?.firstName ?? ""} ${point.userId?.id?.name?.lastName ?? ""
                                }`}
                        </div>

                        <div className="text-xs text-slate-400">
                            {point.userId?.id?.email || "-"}
                        </div>
                    </div>
                </div>
            ),
        },

        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <ShieldCheckIcon className="w-4" />
                    {t("role")}
                </div>
            ),
            accessor: (point) => (
                <SupportRoleBadge role={point.userId?.model} />
            ),
        },

        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <CoinsIcon className="w-4" />
                    {t("current_points")}
                </div>
            ),
            accessor: "currentPoints",
        },

        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <ShoppingBagIcon className="w-4" />
                    {t("total_spent")}
                </div>
            ),
            accessor: "totalSpent",
        },

        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <TrendingUpIcon className="w-4" />
                    {t("total_earned")}
                </div>
            ),
            accessor: "totalEarned",
        },

        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <CalendarIcon className="w-4" />
                    {t("expiry_date")}
                </div>
            ),
            accessor: (point) => format(point.expiryDate, "do MMM yyyy"),
        },
    ];
}