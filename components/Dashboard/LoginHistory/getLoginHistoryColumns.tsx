import { Column } from "@/components/common/ReusableTable";
import { TLoginHistory } from "@/types/login-history.type";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { CheckCircle2, XCircle, Mail, User, ShieldCheck, Activity, MapPin, Clock, Settings, Eye } from "lucide-react";

type TFunction = (key: string) => string;

interface GetLoginHistoryColumnsParams {
    t: TFunction;
    router: AppRouterInstance;
}

export function getLoginHistoryColumns({
    t,
    router,
}: GetLoginHistoryColumnsParams): Column<TLoginHistory>[] {
    return [
        {
            header: (
                <div className="text-[#DC3173] flex gap-1.5 items-center font-bold text-xs uppercase tracking-wider">
                    <User size={14} />
                    {t("user")}
                </div>
            ),
            accessor: (item) => (
                <div className="flex items-center gap-2">
                    <Mail size={14} className="text-[#DC3173] shrink-0" />
                    <div>
                        <div className="font-medium text-gray-900">{item.email}</div>
                        <div className="text-xs text-gray-400">ID: {item.userId}</div>
                    </div>
                </div>
            ),
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-1.5 items-center font-bold text-xs uppercase tracking-wider">
                    <ShieldCheck size={14} />
                    {t("role")}
                </div>
            ),
            accessor: (item) => (
                <span className="inline-block text-xs font-semibold tracking-wide text-[#DC3173] bg-rose-50 px-2.5 py-1 rounded-full uppercase">
                    {item.userRole}
                </span>
            ),
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-1.5 items-center font-bold text-xs uppercase tracking-wider">
                    <Activity size={14} />
                    {t("status")}
                </div>
            ),
            accessor: (item) =>
                item.status === "SUCCESS" ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 uppercase">
                        <CheckCircle2 size={13} /> {t("success")}
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-[#DC3173] uppercase">
                        <XCircle size={13} /> {t("failed")}
                    </span>
                ),
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-1.5 items-center font-bold text-xs uppercase tracking-wider">
                    <MapPin size={14} />
                    {t("ip_location")}
                </div>
            ),
            accessor: (item) => (
                <div>
                    <div className="flex items-center gap-1.5 text-gray-700 font-mono text-xs">
                        {item.ipAddress || "—"}
                    </div>
                    {(item.city || item.country) && (
                        <div className="text-xs text-gray-400 mt-0.5">
                            {item.city}, {item.country}
                        </div>
                    )}
                </div>
            ),
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-1.5 items-center font-bold text-xs uppercase tracking-wider">
                    <Clock size={14} />
                    {t("time")}
                </div>
            ),
            accessor: (item) => (
                <span className="text-gray-500 text-xs whitespace-nowrap">
                    {item.loginAt || "—"}
                </span>
            ),
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-1.5 items-center justify-end font-bold text-xs uppercase tracking-wider">
                    <Settings size={14} />
                    {t("actions")}
                </div>
            ),
            className: "text-right",
            accessor: (item) => (
                <div className="flex justify-end">
                    <button
                        onClick={() => router.push(`/admin/login-history/${item._id}`)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-medium text-[#DC3173] hover:bg-rose-50 shadow-xs transition-all active:scale-98 cursor-pointer"
                    >
                        <Eye size={14} />
                        {t("view_details")}
                    </button>
                </div>
            ),
        },
    ];
}