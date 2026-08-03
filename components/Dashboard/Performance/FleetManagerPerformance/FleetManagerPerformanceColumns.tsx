import { Column } from "@/components/common/ReusableTable";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TFleetManagerPerformance } from "@/types/performance.type";
import {
    Cog,
    EuroIcon,
    MoreVertical,
    PackageIcon,
    StoreIcon,
} from "lucide-react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

type TFunction = (key: string) => string;

interface GetFleetManagerPerformanceColumnsParams {
    t: TFunction;
    router: AppRouterInstance;
}

export function getFleetManagerPerformanceColumns({
    t,
    router,
}: GetFleetManagerPerformanceColumnsParams): Column<TFleetManagerPerformance>[] {
    return [
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <StoreIcon className="w-4" />
                    {t("manager")}
                </div>
            ),
            accessor: (fm) => (
                <div className="flex gap-4 items-center">
                    <Avatar className="w-8 h-8">
                        <AvatarImage src={fm.profilePhoto} />
                        <AvatarFallback>{fm.name || "N/A"}</AvatarFallback>
                    </Avatar>

                    <div>
                        <h3>{fm.name || "N/A"}</h3>
                        <p className="text-gray-700 text-sm">{fm.email}</p>
                    </div>
                </div>
            ),
        },

        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <PackageIcon className="w-4" />
                    {t("deliveries")}
                </div>
            ),
            accessor: (fm) => fm.totalDeliveries || 0,
        },

        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <EuroIcon className="w-4" />
                    {t("earnings")}
                </div>
            ),
            accessor: (fm) => `€${fm.totalEarnings || 0}`,
        },

        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center justify-end">
                    <Cog className="w-4" />
                    {t("actions")}
                </div>
            ),
            className: "text-right",
            accessor: (fm) => (
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <MoreVertical className="h-4 w-4" />
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            onClick={() =>
                                router.push("/admin/fleet-performance/" + fm.userId)
                            }
                        >
                            {t("view")}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];
}