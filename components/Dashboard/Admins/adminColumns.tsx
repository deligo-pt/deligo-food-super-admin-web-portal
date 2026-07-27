import { Column } from "@/components/common/ReusableTable";
import RoleBadge from "@/components/Dashboard/Admins/RoleBadge";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TAdmin } from "@/types/admin.type";
import {
    CircleCheckBig,
    Cog,
    IdCard,
    Mail,
    MoreVertical,
    ShieldUser,
} from "lucide-react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

type TFunction = (key: string) => string;

interface GetAdminColumnsParams {
    t: TFunction;
    router: AppRouterInstance;
    handleStatusInfo: (
        adminId: string,
        adminName: string,
        status: string,
    ) => void;
    handleDeleteId: (id: string) => void;
}

export function getAdminColumns({
    t,
    router,
    handleStatusInfo,
    handleDeleteId,
}: GetAdminColumnsParams): Column<TAdmin>[] {
    return [
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <IdCard className="w-4" />
                    {t("name")}
                </div>
            ),
            accessor: (admin) =>
                `${admin.name?.firstName || ""} ${admin.name?.lastName || ""}`.trim(),
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
                    <ShieldUser className="w-4" />
                    {t("role")}
                </div>
            ),
            accessor: (admin) => <RoleBadge role={admin.role} />,
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <CircleCheckBig className="w-4" />
                    {t("status")}
                </div>
            ),
            accessor: (admin) => (admin.isDeleted ? "Deleted" : admin.status),
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center justify-end">
                    <Cog className="w-4" />
                    {t("actions")}
                </div>
            ),
            className: "text-right",
            accessor: (admin) => {
                if (admin.isDeleted) return null;

                const fullName = `${admin.name?.firstName || ""} ${admin.name?.lastName || ""}`.trim();

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <MoreVertical className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={() =>
                                    router.push("/admin/all-admins/" + admin.userId)
                                }
                            >
                                {t("view")}
                            </DropdownMenuItem>

                            {admin.status === "APPROVED" && (
                                <DropdownMenuItem
                                    onClick={() =>
                                        handleStatusInfo(admin.userId as string, fullName, "BLOCKED")
                                    }
                                >
                                    {t("block")}
                                </DropdownMenuItem>
                            )}

                            {admin.status === "BLOCKED" && (
                                <DropdownMenuItem
                                    onClick={() =>
                                        handleStatusInfo(
                                            admin.userId as string,
                                            fullName,
                                            "UNBLOCKED",
                                        )
                                    }
                                >
                                    {t("unblock")}
                                </DropdownMenuItem>
                            )}

                            <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDeleteId(admin.userId)}
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