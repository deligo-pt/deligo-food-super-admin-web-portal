
import { Column } from "@/components/common/ReusableTable";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TVendor } from "@/types/user.type";
import {
    CircleCheckBig,
    Cog,
    IdCard,
    Mail,
    MoreVertical,
    Phone,
} from "lucide-react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

type TFunction = (key: string) => string;

interface GetVendorColumnsParams {
    t: TFunction;
    router: AppRouterInstance;
    handleStatusInfo: (
        vendorId: string,
        vendorName: string,
        status: string,
    ) => void;
    handleDeleteId: (id: string) => void;
}

export function getVendorColumns({
    t,
    router,
    handleStatusInfo,
    handleDeleteId,
}: GetVendorColumnsParams): Column<TVendor>[] {
    return [
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <IdCard className="w-4" />
                    {t("name")}
                </div>
            ),
            accessor: (row) => row.businessDetails?.businessName || "N/A",
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
            accessor: (row) => (row.isDeleted ? "Deleted" : row.status),
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center justify-end">
                    <Cog className="w-4" />
                    {t("actions")}
                </div>
            ),
            className: "text-right",
            accessor: (vendor) => {
                if (vendor.isDeleted) return null;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <MoreVertical className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={() => router.push("/admin/vendor/" + vendor.userId)}
                            >
                                {t("view")}
                            </DropdownMenuItem>

                            {vendor.status === "SUBMITTED" && (
                                <DropdownMenuItem
                                    onClick={() =>
                                        handleStatusInfo(
                                            vendor.userId as string,
                                            vendor.businessDetails?.businessName as string,
                                            "APPROVED",
                                        )
                                    }
                                >
                                    {t("approve")}
                                </DropdownMenuItem>
                            )}

                            {vendor.status === "SUBMITTED" && (
                                <DropdownMenuItem
                                    onClick={() =>
                                        handleStatusInfo(
                                            vendor.userId as string,
                                            vendor.businessDetails?.businessName as string,
                                            "REJECTED",
                                        )
                                    }
                                >
                                    {t("reject")}
                                </DropdownMenuItem>
                            )}

                            {vendor.status === "APPROVED" && (
                                <DropdownMenuItem
                                    onClick={() =>
                                        handleStatusInfo(
                                            vendor.userId as string,
                                            vendor.businessDetails?.businessName as string,
                                            "BLOCKED",
                                        )
                                    }
                                >
                                    {t("block")}
                                </DropdownMenuItem>
                            )}

                            {vendor.status === "BLOCKED" && (
                                <DropdownMenuItem
                                    onClick={() =>
                                        handleStatusInfo(
                                            vendor.userId as string,
                                            vendor.businessDetails?.businessName as string,
                                            "UNBLOCKED",
                                        )
                                    }
                                >
                                    {t("unblock")}
                                </DropdownMenuItem>
                            )}

                            <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDeleteId(vendor.userId)}
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