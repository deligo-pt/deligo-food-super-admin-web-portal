import { Column } from "@/components/common/ReusableTable";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { TSdrDeposit } from "@/types/sdr-deposits.type";
import { format } from "date-fns";
import {
    CircleCheckBig,
    Cog,
    ListIcon,
    MoreVertical,
    Banknote,
    Calendar,
} from "lucide-react";

type TFunction = (key: string) => string;

interface GetSdrDepositColumnsParams {
    t: TFunction;
    setCancelId: (id: string) => void;
}

export function getSdrDepositColumns({
    t,
    setCancelId,
}: GetSdrDepositColumnsParams): Column<TSdrDeposit>[] {
    return [
        // Amount
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <Banknote className="w-4" />
                    {t("deposit_amount") || "Amount"}
                </div>
            ),
            accessor: (row) => (
                <div className="font-medium">
                    {row.depositAmount.toFixed(2)} {row.currency}
                </div>
            ),
        },

        // Effective From
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <Calendar className="w-4" />
                    {t("effective_from") || "Effective From"}
                </div>
            ),
            accessor: (row) => (
                <span className="text-sm">
                    {format(new Date(row.effectiveFrom), "dd MMM yyyy, HH:mm")}
                </span>
            ),
        },

        // Status / State
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <CircleCheckBig className="w-4" />
                    {t("status") || "Status"}
                </div>
            ),
            accessor: (row) => {
                const stateColors: Record<string, string> = {
                    EFFECTIVE: "text-green-600",
                    SCHEDULED: "text-blue-600",
                    SUPERSEDED: "text-yellow-600",
                    CANCELLED: "text-red-500",
                };

                return (
                    <div className="flex flex-col gap-0.5">
                        <span className={cn("font-medium", stateColors[row.state] || "text-gray-600")}>
                            {row.state}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {row.isActive ? t("active") || "Active" : t("inactive") || "Inactive"}
                        </span>
                    </div>
                );
            },
        },

        // Note
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <ListIcon className="w-4" />
                    {t("note") || "Note"}
                </div>
            ),
            accessor: (row) => (
                <span className="text-sm text-muted-foreground line-clamp-2 max-w-50">
                    {row.note || "—"}
                </span>
            ),
        },

        // Actions
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center justify-end">
                    <Cog className="w-4" />
                    {t("actions") || "Actions"}
                </div>
            ),
            className: "text-right",
            accessor: (row) => {
                // Only allow cancel when the row has NOT started yet
                const canCancel = !row.isCancelled && row.state !== "EFFECTIVE" && row.state !== "SUPERSEDED";

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {canCancel ? (
                                <DropdownMenuItem
                                    className="text-red-600 focus:text-red-700 font-medium"
                                    onClick={() => setCancelId(row._id)}
                                >
                                    {t("cancel") || "Cancel / Remove"}
                                </DropdownMenuItem>
                            ) : (
                                <DropdownMenuItem disabled className="text-foreground">
                                    {row.isCancelled
                                        ? t("already_cancelled") || "Already cancelled"
                                        : t("cannot_cancel_effective") || "Cannot cancel (already started)"}
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];
}