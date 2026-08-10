import { Column } from "@/components/common/ReusableTable";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TDeliveryPartner } from "@/types/delivery-partner.type";
import {
    Cog,
    IdCard,
    Mail,
    MoreVertical,
    Phone,
} from "lucide-react";
import Image from "next/image";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

type TFunction = (key: string) => string;

interface GetFleetRidersColumnsParams {
    t: TFunction;
    router: AppRouterInstance;
}

export function getFleetRidersColumns({
    t,
    router,
}: GetFleetRidersColumnsParams): Column<Partial<TDeliveryPartner>>[] {
    return [
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <IdCard className="w-4" />
                    {t("name")}
                </div>
            ),
            accessor: (rider) => (
                <div className="flex items-center gap-3">
                    {rider.profilePhoto && (
                        <Image
                            className="w-8 h-8 rounded-full object-cover"
                            src={rider.profilePhoto}
                            alt={rider.name?.firstName || ""}
                            width={32}
                            height={32}
                        />
                    )}

                    <p>
                        {rider.name?.firstName || "N/A"} {rider.name?.lastName}
                    </p>
                </div>
            ),
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <Phone className="w-4" />
                    {t("userId")}
                </div>
            ),
            accessor: "userId",
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <Mail className="w-4" />
                    {t("email")}
                </div>
            ),
            accessor: "email",
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center justify-end">
                    <Cog className="w-4" />
                    {t("actions")}
                </div>
            ),
            className: "text-right",
            accessor: (rider) => (
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <MoreVertical className="h-4 w-4" />
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            onClick={() =>
                                router.push("/admin/all-delivery-partners/" + rider.userId)
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