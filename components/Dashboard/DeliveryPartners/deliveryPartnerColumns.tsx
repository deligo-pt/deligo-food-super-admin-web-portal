"use client";

import { Column } from "@/components/common/ReusableTable";
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
    ListIcon,
    Mail,
    MoreVertical,
    Phone,
} from "lucide-react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import Link from "next/link";

type TFunction = (key: string) => string;

interface GetDeliveryPartnerColumnsParams {
    t: TFunction;
    router: AppRouterInstance;
    handleStatusInfo: (
        partnerId: string,
        partnerName: string,
        status: string,
    ) => void;
    handleApproveInfo: (
        partnerId: string,
        partnerName: string,
        city: string,
        status: string,
    ) => void;
    handleDeleteId: (id: string) => void;
}

export function getDeliveryPartnerColumns({
    t,
    router,
    handleStatusInfo,
    handleApproveInfo,
    handleDeleteId,
}: GetDeliveryPartnerColumnsParams): Column<TDeliveryPartner>[] {
    return [
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <IdCard className="w-4 h-4" />
                    <span>{t("name")}</span>
                </div>
            ),
            accessor: (dp) =>
                `${dp?.name?.firstName || ""} ${dp?.name?.lastName || ""}`.trim() || "N/A",
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <ListIcon className="w-4 h-4" />
                    <span>{t("associated_fleet")}</span>
                </div>
            ),
            accessor: (dp) => {
                const fleetBName = dp?.currentFleetManagerId?.businessDetails?.businessName;
                const userId = dp?.currentFleetManagerId?.userId;

                if (!fleetBName) return "N/A";

                return userId ? (
                    <Link
                        href={`/admin/agent/${userId}`}
                        className="hover:underline text-blue-600 font-medium"
                    >
                        {fleetBName}
                    </Link>
                ) : (
                    fleetBName
                );
            },
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <Mail className="w-4 h-4" />
                    <span>{t("email")}</span>
                </div>
            ),
            accessor: (dp) => dp?.email || "-",
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <Phone className="w-4 h-4" />
                    <span>{t("phone")}</span>
                </div>
            ),
            accessor: (dp) => dp?.contactNumber || "-",
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <CircleCheckBig className="w-4 h-4" />
                    <span>{t("status")}</span>
                </div>
            ),
            accessor: (dp) => (dp?.isDeleted ? "Deleted" : dp?.status || "-"),
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center justify-end">
                    <Cog className="w-4 h-4" />
                    <span>{t("actions")}</span>
                </div>
            ),
            className: "text-right",
            accessor: (dp) => {
                if (dp?.isDeleted) return null;

                const fullName = `${dp?.name?.firstName || ""} ${dp?.name?.lastName || ""
                    }`.trim();

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <MoreVertical className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={() =>
                                    router.push(`/admin/all-delivery-partners/${dp.userId}`)
                                }
                            >
                                {t("view")}
                            </DropdownMenuItem>

                            {dp.status === "SUBMITTED" && (
                                <>
                                    <DropdownMenuItem
                                        onClick={() => {
                                            if (dp?.registeredBy?.id?.userId) {
                                                handleStatusInfo(
                                                    dp.userId as string,
                                                    fullName,
                                                    "APPROVED",
                                                );
                                            } else {
                                                handleApproveInfo(
                                                    dp.userId as string,
                                                    fullName,
                                                    dp?.address?.city as string,
                                                    "APPROVED",
                                                );
                                            }
                                        }}
                                    >
                                        {t("approve")}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() =>
                                            handleStatusInfo(
                                                dp.userId as string,
                                                fullName,
                                                "REJECTED",
                                            )
                                        }
                                    >
                                        {t("reject")}
                                    </DropdownMenuItem>
                                </>
                            )}

                            {dp.status === "APPROVED" && (
                                <DropdownMenuItem
                                    onClick={() =>
                                        handleStatusInfo(
                                            dp.userId as string,
                                            fullName,
                                            "BLOCKED",
                                        )
                                    }
                                >
                                    {t("block")}
                                </DropdownMenuItem>
                            )}

                            {dp.status === "BLOCKED" && (
                                <DropdownMenuItem
                                    onClick={() => {
                                        if (dp?.registeredBy?.id?.userId) {
                                            handleStatusInfo(
                                                dp.userId as string,
                                                fullName,
                                                "UNBLOCKED",
                                            );
                                        } else {
                                            handleApproveInfo(
                                                dp.userId as string,
                                                fullName,
                                                dp?.address?.city as string,
                                                "UNBLOCKED",
                                            );
                                        }
                                    }}
                                >
                                    {t("unblock")}
                                </DropdownMenuItem>
                            )}

                            <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDeleteId(dp.userId as string)}
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