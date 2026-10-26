import { Column } from "@/components/common/ReusableTable";
import { TTransaction } from "@/types/transaction.type";
import { formatPrice } from "@/utils/formatPrice";
import { format } from "date-fns";
import {
    CalendarIcon,
    EuroIcon,
    ShapesIcon,
} from "lucide-react";

type TFunction = (key: string) => string;

interface GetWalletTransactionColumnsParams {
    t: TFunction;
}

export function getWalletTransactionColumns({
    t,
}: GetWalletTransactionColumnsParams): Column<TTransaction>[] {
    return [
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <CalendarIcon className="w-4" />
                    {t("order_id")}
                </div>
            ),
            accessor: (t) =>
                t.orderId ? t.orderId : "-",
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <CalendarIcon className="w-4" />
                    {t("date")}
                </div>
            ),
            accessor: (t) =>
                t.createdAt ? format(t.createdAt, "do MMM yyyy") : "-",
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <EuroIcon className="w-4" />
                    {t("earnings_amount")}
                </div>
            ),
            accessor: (row) => <>€{formatPrice(row.amount || 0)}</>,
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <ShapesIcon className="w-4" />
                    {t("type")}
                </div>
            ),
            accessor: (row) => (
                <span className="capitalize">
                    {row.type}
                </span>
            ),
        }
    ];
}