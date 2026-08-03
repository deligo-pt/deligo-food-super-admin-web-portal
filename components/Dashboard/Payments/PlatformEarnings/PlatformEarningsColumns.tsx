import { Column } from "@/components/common/ReusableTable";
import { TPlaformEarningsData } from "@/types/payment.type";
import { formatPrice } from "@/utils/formatPrice";
import {
    EuroIcon,
    HashIcon,
    PercentIcon,
    ShoppingBagIcon,
    UserIcon,
} from "lucide-react";

type TFunction = (key: string) => string;

interface GetPlatformEarningsColumnsParams {
    t: TFunction;
}

export function getPlatformEarningsColumns({
    t,
}: GetPlatformEarningsColumnsParams): Column<
    TPlaformEarningsData["commissions"][number]
>[] {
    return [
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <HashIcon className="w-4" />
                    {t("transaction_id")}
                </div>
            ),
            accessor: "transactionId",
        },

        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <UserIcon className="w-4" />
                    {t("customer")}
                </div>
            ),
            accessor: (row) =>
                `${row.customer?.name?.firstName || "N/A"} ${row.customer?.name?.lastName || ""
                }`,
        },

        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <ShoppingBagIcon className="w-4" />
                    {t("order_id")}
                </div>
            ),
            accessor: (row) => row.orderId || "N/A",
        },

        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <EuroIcon className="w-4" />
                    {t("amount")}
                </div>
            ),
            accessor: (row) => `€${formatPrice(row.amount || 0)}`,
        },

        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <PercentIcon className="w-4" />
                    {t("platform_fee")}
                </div>
            ),
            accessor: (row) => `€${formatPrice(row.platformFee || 0)}`,
        },
    ];
}