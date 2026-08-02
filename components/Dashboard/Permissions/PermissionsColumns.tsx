import { Column } from "@/components/common/ReusableTable";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TSystemPermission } from "@/types/permission.type";
import {
    Cog,
    Edit,
    Eye,
    FileText,
    MoreVertical,
    Shield,
    ShieldAlert,
} from "lucide-react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

type TFunction = (key: string) => string;

interface GetPermissionsColumnsParams {
    t: TFunction;
    router: AppRouterInstance;
    onOpenEditModal?: (permission: TSystemPermission) => void;
}

export function getPermissionsColumns({
    t,
    router,
    onOpenEditModal,
}: GetPermissionsColumnsParams): Column<TSystemPermission>[] {
    return [
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center font-bold text-xs uppercase tracking-wider">
                    <FileText className="w-3.5 h-3.5" />
                    {t("permission_name")}
                </div>
            ),
            accessor: "name",
        },

        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center font-bold text-xs uppercase tracking-wider">
                    <Shield className="w-3.5 h-3.5" />
                    {t("system_action_key")}
                </div>
            ),
            accessor: (permission) => (
                <span className="font-mono text-xs text-gray-600 bg-gray-50/60 rounded-md py-1 px-2 inline-block">
                    {permission.action}
                </span>
            ),
        },

        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center font-bold text-xs uppercase tracking-wider">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    {t("status")}
                </div>
            ),
            accessor: (permission) => (
                <Badge
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold border shadow-none ${permission.isActive
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-red-50 text-red-600 border-red-100"
                        }`}
                >
                    {permission.isActive ? "Active" : "Inactive"}
                </Badge>
            ),
        },

        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center justify-end font-bold text-xs uppercase tracking-wider">
                    <Cog className="w-3.5 h-3.5" />
                    {t("actions")}
                </div>
            ),
            className: "text-right",
            accessor: (permission) => (
                <DropdownMenu>
                    <DropdownMenuTrigger className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none">
                        <MoreVertical className="h-4 w-4 text-gray-500" />
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        align="end"
                        className="rounded-xl p-1 shadow-md border-gray-100"
                    >
                        <DropdownMenuItem
                            className="cursor-pointer flex gap-2 items-center rounded-lg font-medium text-gray-700 text-xs py-2 focus:text-[#DC3173] focus:bg-[#FFF1F7]"
                            onClick={() =>
                                router.push(`/admin/permissions/${permission._id}`)
                            }
                        >
                            <Eye className="w-3.5 h-3.5" />
                            {t("view")}
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            className="cursor-pointer flex gap-2 items-center rounded-lg font-medium text-gray-700 text-xs py-2 focus:text-[#DC3173] focus:bg-[#FFF1F7]"
                            onClick={() => onOpenEditModal?.(permission)}
                        >
                            <Edit className="w-3.5 h-3.5" />
                            {t("edit")}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];
}