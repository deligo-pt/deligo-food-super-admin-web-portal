
import { Column } from "@/components/common/ReusableTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IActivityLog, ActivityLogType } from "@/types/activity-logs.type";
import { Activity, Eye, Info, ShieldCheck, User } from "lucide-react";
import Link from "next/link";

type TFunction = (key: string) => string;

interface GetActivityLogColumnsParams {
    t: TFunction;
}

const renderTypeBadge = (type: ActivityLogType) => {
    switch (type) {
        case "INFO":
            return (
                <Badge
                    variant="secondary"
                    className="bg-blue-50 text-blue-600 border-blue-200"
                >
                    INFO
                </Badge>
            );
        case "WARNING":
            return (
                <Badge
                    variant="outline"
                    className="bg-amber-50 text-amber-600 border-amber-200"
                >
                    WARNING
                </Badge>
            );
        case "DANGER":
            return (
                <Badge
                    variant="destructive"
                    className="bg-red-50 text-red-600 border-red-200"
                >
                    DANGER
                </Badge>
            );
        default:
            return <Badge variant="outline">{type}</Badge>;
    }
};

const getInitials = (name?: string) => {
    if (!name) return "U";
    return name.trim().split(" ")[0]?.charAt(0).toUpperCase() || "U";
};

export function getActivityLogColumns({
    t,
}: GetActivityLogColumnsParams): Column<IActivityLog>[] {
    return [
        {
            header: (
                <div className="flex items-center gap-2 text-[#DC3173] font-medium">
                    <User size={16} />
                    <span>{t("user")}</span>
                </div>
            ),
            accessor: (log) => (
                <div className="flex items-center gap-3 whitespace-nowrap">
                    <div className="w-9 h-9 rounded-full bg-[#DC3173]/10 text-[#DC3173] flex items-center justify-center font-semibold text-sm shrink-0">
                        {getInitials(log.userName)}
                    </div>
                    <div>
                        <div className="font-medium text-gray-900 text-sm">
                            {log.userName || t("unknown_user")}
                        </div>
                        <div className="text-xs text-gray-400">{log.email}</div>
                    </div>
                </div>
            ),
        },
        {
            header: (
                <div className="flex items-center gap-2 text-[#DC3173] font-medium">
                    <ShieldCheck size={16} />
                    <span>{t("role")}</span>
                </div>
            ),
            accessor: (log) => (
                <span className="text-xs font-semibold tracking-wider text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md uppercase">
                    {log.role || "N/A"}
                </span>
            ),
        },
        {
            header: (
                <div className="flex items-center gap-2 text-[#DC3173] font-medium">
                    <Activity size={16} />
                    <span>{t("action")}</span>
                </div>
            ),
            accessor: (log) => (
                <span className="whitespace-nowrap font-medium text-gray-700 text-sm">
                    {log.action}
                </span>
            ),
        },
        {
            header: (
                <div className="flex items-center justify-center gap-2 text-[#DC3173] font-medium">
                    <Info size={16} />
                    <span>{t("type")}</span>
                </div>
            ),
            className: "text-center",
            accessor: (log) => renderTypeBadge(log.type),
        },
        {
            header: (
                <div className="text-[#DC3173] font-medium text-right pr-6">
                    {t("actions")}
                </div>
            ),
            className: "text-right pr-6",
            accessor: (log) => (
                <Link href={`/admin/activity-logs/${log._id}`}>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-[#DC3173] hover:bg-[#DC3173]/10 rounded-full"
                        title={t("view_details")}
                    >
                        <Eye size={18} />
                    </Button>
                </Link>
            ),
        },
    ];
}