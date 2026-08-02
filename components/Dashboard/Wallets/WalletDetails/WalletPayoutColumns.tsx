import { Column } from "@/components/common/ReusableTable";
import { Button } from "@/components/ui/button";
import { TPayout } from "@/types/payout.type";
import { formatPrice } from "@/utils/formatPrice";
import { format } from "date-fns";
import {
    CalendarIcon,
    Cog,
    EuroIcon,
    EyeIcon,
    ShapesIcon,
} from "lucide-react";

type TFunction = (key: string) => string;

interface GetWalletPayoutColumnsParams {
    t: TFunction;
}

export function getWalletPayoutColumns({
    t,
}: GetWalletPayoutColumnsParams): Column<TPayout>[] {
    return [
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <CalendarIcon className="w-4" />
                    {t("date")}
                </div>
            ),
            accessor: (p) =>
                p.paymentDate ? format(p.paymentDate, "do MMM yyyy") : "-",
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <ShapesIcon className="w-4" />
                    {t("iban")}
                </div>
            ),
            accessor: (p) => p.userId?.bankDetails?.iban || "-",
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <EuroIcon className="w-4" />
                    {t("earnings_amount")}
                </div>
            ),
            accessor: (p) => `€${formatPrice(p.amount || 0)}`,
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center justify-end">
                    <Cog className="w-4" />
                    {t("actions")}
                </div>
            ),
            className: "text-right",
            accessor: () => (
                <Button
                    size="sm"
                    className="bg-[#DC3173] flex items-center gap-2 hover:bg-[#DC3173]/90 ml-auto"
                >
                    <EyeIcon />
                    {t("orders_capital")}
                </Button>
            ),
        },
    ];
}