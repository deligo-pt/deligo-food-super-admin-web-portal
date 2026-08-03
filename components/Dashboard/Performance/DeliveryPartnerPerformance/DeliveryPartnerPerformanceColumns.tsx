import { Column } from "@/components/common/ReusableTable";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TDeliveryPartnerPerformance } from "@/types/performance.type";
import { formatPrice } from "@/utils/formatPrice";
import {
    BikeIcon,
    Cog,
    EuroIcon,
    MoreVertical,
    PackageIcon,
    StarIcon,
} from "lucide-react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

type TFunction = (key: string) => string;

interface GetDeliveryPartnerPerformanceColumnsParams {
    t: TFunction;
    router: AppRouterInstance;
}

export function getDeliveryPartnerPerformanceColumns({
    t,
    router,
}: GetDeliveryPartnerPerformanceColumnsParams): Column<TDeliveryPartnerPerformance>[] {
    return [
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <BikeIcon className="w-4" />
                    {t("partner")}
                </div>
            ),
            accessor: (partner) => (
                <div className="flex gap-4 items-center">
                    <Avatar className="w-8 h-8">
                        <AvatarImage src={partner.profilePhoto} />
                        <AvatarFallback>
                            {partner.name?.firstName?.charAt(0)}
                            {partner.name?.lastName?.charAt(0)}
                        </AvatarFallback>
                    </Avatar>

                    <div>
                        <h3>
                            {partner.name?.firstName} {partner.name?.lastName}
                        </h3>

                        <p className="text-gray-700 text-sm">
                            {partner.email}
                        </p>
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
            accessor: (partner) =>
                partner.operationalData?.totalDeliveries || 0,
        },

        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <EuroIcon className="w-4" />
                    {t("earnings")}
                </div>
            ),
            accessor: (partner) =>
                `€${formatPrice(partner.totalEarnings || 0)}`,
        },

        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <StarIcon className="w-4" />
                    {t("rating")}
                </div>
            ),
            accessor: (partner) =>
                partner.operationalData?.rating?.average || 0,
        },

        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center justify-end">
                    <Cog className="w-4" />
                    {t("actions")}
                </div>
            ),
            className: "text-right",
            accessor: (partner) => (
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <MoreVertical className="h-4 w-4" />
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            onClick={() =>
                                router.push(
                                    "/admin/delivery-partner-performance/" +
                                    partner.userId
                                )
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