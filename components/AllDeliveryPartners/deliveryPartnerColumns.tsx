
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TDeliveryPartner } from "@/types/delivery-partner.type";
import {
    CircleCheckBig,
    Cog,
    IdCard,
    Mail,
    MoreVertical,
    Phone,
} from "lucide-react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { Column } from "../common/ReusableTable";

type TFunction = (key: string) => string;

interface GetDeliveryPartnerColumnsParams {
    t: TFunction;
    router: AppRouterInstance;
    setStatusInfo: (info: {
        deliveryPartnerId: string;
        deliveryPartnerName: string;
        status: string;
    }) => void;
    setDeleteId: (id: string) => void;
}

export function getDeliveryPartnerColumns({
    t,
    router,
    setStatusInfo,
    setDeleteId,
}: GetDeliveryPartnerColumnsParams): Column<TDeliveryPartner>[] {
    return [
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <IdCard className="w-4" />
                    {t("name")}
                </div>
            ),
            accessor: (dp) =>
                `${dp?.name?.firstName || ""} ${dp?.name?.lastName || ""}`.trim(),
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
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <Phone className="w-4" />
                    {t("phone")}
                </div>
            ),
            accessor: "contactNumber",
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <CircleCheckBig className="w-4" />
                    {t("status")}
                </div>
            ),
            accessor: (dp) => (dp?.isDeleted ? "DELETED" : dp?.status),
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center justify-end">
                    <Cog className="w-4" />
                    {t("actions")}
                </div>
            ),
            className: "text-right",
            accessor: (dp) => {
                if (dp?.isDeleted) return null;

                const fullName = `${dp?.name?.firstName || ""} ${dp?.name?.lastName || ""}`.trim();

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <MoreVertical className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={() =>
                                    router.push(
                                        "/admin/all-delivery-partners/" + dp.userId,
                                    )
                                }
                            >
                                {t("view")}
                            </DropdownMenuItem>

                            {dp.status === "SUBMITTED" && (
                                <>
                                    <DropdownMenuItem
                                        onClick={() =>
                                            setStatusInfo({
                                                deliveryPartnerId: dp.userId as string,
                                                deliveryPartnerName: fullName,
                                                status: "APPROVED",
                                            })
                                        }
                                    >
                                        {t("approve")}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() =>
                                            setStatusInfo({
                                                deliveryPartnerId: dp.userId as string,
                                                deliveryPartnerName: fullName,
                                                status: "REJECTED",
                                            })
                                        }
                                    >
                                        {t("reject")}
                                    </DropdownMenuItem>
                                </>
                            )}

                            {dp.status === "APPROVED" && (
                                <DropdownMenuItem
                                    onClick={() =>
                                        setStatusInfo({
                                            deliveryPartnerId: dp.userId as string,
                                            deliveryPartnerName: fullName,
                                            status: "BLOCKED",
                                        })
                                    }
                                >
                                    {t("block")}
                                </DropdownMenuItem>
                            )}

                            {dp.status === "BLOCKED" && (
                                <DropdownMenuItem
                                    onClick={() =>
                                        setStatusInfo({
                                            deliveryPartnerId: dp.userId as string,
                                            deliveryPartnerName: fullName,
                                            status: "UNBLOCKED",
                                        })
                                    }
                                >
                                    {t("unblock")}
                                </DropdownMenuItem>
                            )}

                            <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => setDeleteId(dp.userId as string)}
                            >
                                {t("delete")}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];
}