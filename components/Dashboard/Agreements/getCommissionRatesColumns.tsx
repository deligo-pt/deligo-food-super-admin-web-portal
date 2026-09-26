import { Column } from "@/components/common/ReusableTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ICommissionRate } from "@/types/agreement.type";
import { Calendar, Loader2, Percent, XCircle } from "lucide-react";


type TFunction = (key: string) => string;

interface GetCommissionRatesColumnsParams {
    t: TFunction;
    cancellingId: string;
    handleCancelRate: (id: string) => void;
}


export function getCommissionRatesColumns({
    t,
    cancellingId,
    handleCancelRate
}: GetCommissionRatesColumnsParams): Column<ICommissionRate>[] {

    return [
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <Percent className="w-4 h-4" />
                    {t("platform_percent") || "Platform %"}
                </div>
            ),
            accessor: (row) => (
                <span className="font-semibold text-gray-900">
                    {row.platformPercent}%
                </span>
            ),
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    {t("platform_vat_rate") || "VAT Rate"}
                </div>
            ),
            accessor: (row) => (
                <span className="text-gray-700">{row.platformVatRate}%</span>
            ),
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    {t("state") || "State"}
                </div>
            ),
            accessor: (row) => {
                const isEffective = row.state === "EFFECTIVE";
                return (
                    <Badge
                        className={`font-normal ${isEffective
                            ? "bg-emerald-100 text-emerald-800 border-0"
                            : row.state === "AWAITING_PUBLISH"
                                ? "bg-amber-100 text-amber-800 border-0"
                                : "bg-gray-100 text-gray-700 border-0"
                            }`}
                    >
                        {row.state?.replace(/_/g, " ") || "N/A"}
                    </Badge>
                );
            },
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    {t("baseline") || "Baseline"}
                </div>
            ),
            accessor: (row) =>
                row.isBaseline ? (
                    <span className="text-emerald-600 font-medium text-sm">
                        {t("yes") || "Yes"}
                    </span>
                ) : (
                    <span className="text-gray-400 text-sm">{t("no") || "No"}</span>
                ),
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <Calendar className="w-4 h-4" />
                    {t("effective_from") || "Effective From"}
                </div>
            ),
            accessor: (row) =>
                row.effectiveFrom
                    ? new Date(row.effectiveFrom).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                    })
                    : "—",
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    {t("note") || "Note"}
                </div>
            ),
            accessor: (row) => (
                <span className="text-sm text-gray-600 line-clamp-1 max-w-45">
                    {row.note || "—"}
                </span>
            ),
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center justify-end">
                    {t("actions") || "Actions"}
                </div>
            ),
            className: "text-right",
            accessor: (row) => {
                // Only show Cancel for EFFECTIVE rates
                if (row.state === "UPCOMING") {
                    return <Button
                        variant="ghost"
                        size="sm"
                        disabled={cancellingId === row._id}
                        onClick={() => handleCancelRate(row._id)}
                        className="h-8 gap-1.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                        {cancellingId === row._id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <XCircle className="h-3.5 w-3.5" />
                        )}
                        {t("cancel") || "Cancel"}
                    </Button>
                }
                else {
                    return <span className="text-gray-300 text-xs">—</span>;
                }
            },
        },
    ];

};