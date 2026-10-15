
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
}

export function getVendorBranchColumns({
    t,
    router
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
                    <Mail className="w-4" />
                    {t("type")}
                </div>
            ),
            accessor: (row) => row.businessDetails?.businessTypeSlug === 'store' ? t("store") : row.businessDetails?.businessTypeSlug === 'restaurant' ? t("restaurant") : "N/A",
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <Phone className="w-4" />
                    {t("phone")}
                </div>
            ),
            accessor: (row) => row.contactNumber || "N/A",
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
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];
}