import { Column } from "@/components/common/ReusableTable";
import { Button } from "@/components/ui/button";
import { TTransaction } from "@/types/transaction.type";
import { formatPrice } from "@/utils/formatPrice";
import { format } from "date-fns";
import {
    CalendarIcon,
    Cog,
    EuroIcon,
    EyeIcon,
    HashIcon,
    InfoIcon,
    ShapesIcon,
} from "lucide-react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

type TFunction = (key: string) => string;

interface GetTransactionColumnsParams {
    t: TFunction;
    router: AppRouterInstance;
}

export function getTransactionColumns({
    t,
    router,
}: GetTransactionColumnsParams): Column<TTransaction>[] {
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
                    <InfoIcon className="w-4" />
                    {t("description")}
                </div>
            ),
            accessor: "description",
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
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <EuroIcon className="w-4" />
                    {t("amount")}
                </div>
            ),
            accessor: (row) => <>€{formatPrice(row.amount || 0)}</>,
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <CalendarIcon className="w-4" />
                    {t("date")}
                </div>
            ),
            accessor: (row) => format(row.createdAt, "do MMM yyyy"),
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center justify-end">
                    <Cog className="w-4" />
                    {t("actions")}
                </div>
            ),
            className: "text-right",
            accessor: (transaction) => (
                <Button
                    size="sm"
                    className="bg-[#DC3173] hover:bg-[#DC3173]/90 ml-auto flex items-center gap-2"
                    onClick={() =>
                        router.push(
                            `/admin/transaction-history/${transaction.transactionId}`
                        )
                    }
                >
                    <EyeIcon className="w-4 h-4" />
                    {t("view")}
                </Button>
            ),
        },
    ];
}