import { Column } from "@/components/common/ReusableTable";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TVendorWallet } from "@/types/wallet.type";
import { formatPrice } from "@/utils/formatPrice";
import { format } from "date-fns";
import {
    CalendarIcon,
    Cog,
    EuroIcon,
    HashIcon,
    MoreVertical,
    StoreIcon,
} from "lucide-react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

type TFunction = (key: string) => string;

interface GetVendorWalletColumnsParams {
    t: TFunction;
    router: AppRouterInstance;
}

export function getVendorWalletColumns({
    t,
    router,
}: GetVendorWalletColumnsParams): Column<TVendorWallet>[] {
    return [
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <HashIcon className="w-4" />
                    {t("wallet_id")}
                </div>
            ),
            accessor: "walletId",
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <StoreIcon className="w-4" />
                    {t("vendor")}
                </div>
            ),
            accessor: (w) => (
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage src={w.userId?.profilePhoto} />
                        <AvatarFallback>
                            {w.userId?.name?.firstName?.charAt(0)}
                            {w.userId?.name?.lastName?.charAt(0)}
                        </AvatarFallback>
                    </Avatar>

                    <div>
                        <div className="font-medium">
                            {w.userId?.name?.firstName} {w.userId?.name?.lastName}
                        </div>
                        <div className="text-xs text-slate-500">
                            {w.userId?.email || "N/A"}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <EuroIcon className="w-4" />
                    {t("current_balance")}
                </div>
            ),
            accessor: (w) => `€${formatPrice(w.currentBalance || 0)}`,
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <CalendarIcon className="w-4" />
                    {t("last_settlement")}
                </div>
            ),
            accessor: (w) =>
                w.lastSettlementDate
                    ? format(w.lastSettlementDate, "do MMM yyyy")
                    : "N/A",
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center justify-end">
                    <Cog className="w-4" />
                    {t("actions")}
                </div>
            ),
            className: "text-right",
            accessor: (w) => (
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <MoreVertical className="h-4 w-4" />
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            onClick={() => router.push(`/admin/vendor-wallets/${w.walletId}`)}
                        >
                            {t("view")}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];
}