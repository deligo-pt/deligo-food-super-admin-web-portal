"use client";

import React from "react";
import Link from "next/link";
import AllFilters from "@/components/Filtering/AllFilters";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { useTranslation } from "@/hooks/use-translation";
import { TLoginHistory } from "@/types/login-history.type";
import { getSortOptions, SortOptionKey } from "@/utils/sortOptions";
import {
    CheckCircle2,
    XCircle,
    MapPin,
    Eye,
    ShieldAlert,
    User,
    Mail,
    ShieldCheck,
    Activity,
    Clock,
    Settings
} from "lucide-react";
import PaginationComponent from "@/components/Filtering/PaginationComponent";

interface IProps {
    loginHistories: {
        data: TLoginHistory[];
        meta: {
            total: number;
            totalPage: number;
            page: number;
            limit: number;
        };
    };
}

const sortFields = ["newest", "oldest"] as SortOptionKey[];

export default function LoginHistory({ loginHistories }: IProps) {
    const { t } = useTranslation();

    const sortOptions = getSortOptions(t, sortFields);
    const filterOptions = [
        {
            label: t("status"),
            key: "status",
            placeholder: t("select_status"),
            type: "select",
            items: [
                { label: "Success", value: "SUCCESS" },
                { label: "Failed", value: "FAILED" },
            ],
        },
    ];

    const histories = loginHistories?.data || [];

    return (
        <div className="min-h-screen bg-rose-50/10">
            <div className="mx-auto max-w-7xl space-y-6">

                {/* Header Block matching visual tone */}
                <TitleHeader
                    title={t("login_history")}
                    subtitle={t("see_recent_sign_ins_failed_attempts")}
                />

                {/* Filters Panel */}
                <AllFilters sortOptions={sortOptions} filterOptions={filterOptions} />

                {/* Branded Tabular Presentation */}
                <div className="overflow-hidden rounded-xl border border-rose-100 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-sm text-gray-600">
                            <thead className="bg-white text-xs font-semibold tracking-wider border-b border-rose-100">
                                <tr>
                                    <th className="p-4 font-medium text-[#DC3173]">
                                        <div className="flex items-center gap-1.5">
                                            <User size={14} />
                                            {t("user")}
                                        </div>
                                    </th>
                                    <th className="p-4 font-medium text-[#DC3173]">
                                        <div className="flex items-center gap-1.5">
                                            <ShieldCheck size={14} />
                                            {t("role")}
                                        </div>
                                    </th>
                                    <th className="p-4 font-medium text-[#DC3173]">
                                        <div className="flex items-center gap-1.5">
                                            <Activity size={14} />
                                            {t("status")}
                                        </div>
                                    </th>
                                    <th className="p-4 font-medium text-[#DC3173]">
                                        <div className="flex items-center gap-1.5">
                                            <MapPin size={14} />
                                            {t("ip_location")}
                                        </div>
                                    </th>
                                    <th className="p-4 font-medium text-[#DC3173]">
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={14} />
                                            {t("time")}
                                        </div>
                                    </th>
                                    {/* <th className="p-4 text-right font-medium text-[#DC3173]">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <Settings size={14} />
                                            {t("actions")}
                                        </div>
                                    </th> */}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-rose-50">
                                {histories.map((item) => (
                                    <tr key={item._id} className="hover:bg-rose-50/30 transition-colors">

                                        {/* User Identity Column */}
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <Mail size={14} className="text-[#DC3173] shrink-0" />
                                                <div>
                                                    <div className="font-medium text-gray-900">{item.email}</div>
                                                    <div className="text-xs text-gray-400">ID: {item.userId}</div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* User Role (Pill style matching screenshot) */}
                                        <td className="p-4">
                                            <span className="inline-block text-xs font-semibold tracking-wide text-[#DC3173] bg-rose-50 px-2.5 py-1 rounded-full uppercase">
                                                {item.userRole}
                                            </span>
                                        </td>

                                        {/* Status Pill */}
                                        <td className="p-4">
                                            {item.status === "SUCCESS" ? (
                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 uppercase">
                                                    <CheckCircle2 size={13} /> {t("success")}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-[#DC3173]uppercase">
                                                    <XCircle size={13} /> {t("failed")}
                                                </span>
                                            )}
                                        </td>

                                        {/* Location Indicators */}
                                        <td className="p-4">
                                            <div className="flex items-center gap-1.5 text-gray-700">
                                                <span className="font-mono text-xs">{item.ipAddress || "—"}</span>
                                            </div>
                                            {(item.city || item.country) && (
                                                <div className="text-xs text-gray-400 mt-0.5">
                                                    {item.city}, {item.country}
                                                </div>
                                            )}
                                        </td>

                                        {/* Timestamps */}
                                        <td className="p-4 text-gray-500 text-xs whitespace-nowrap">
                                            {item.loginAt || "—"}
                                        </td>

                                        {/* Action button redirecting to details page */}
                                        {/* <td className="p-4 text-right">
                                            <Link
                                                href={`/login-history/${item._id}`}
                                                className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-medium text-[#DC3173] hover:bg-rose-50 shadow-xs transition-all active:scale-98"
                                            >
                                                <Eye size={14} />
                                                {t("view_details")}
                                            </Link>
                                        </td> */}
                                    </tr>
                                ))}

                                {histories.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="p-12 text-center text-gray-400">
                                            <ShieldAlert className="mx-auto mb-2 text-[#DC3173]" size={32} />
                                            {t("no_login_records_found")}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Component Block */}
                    {!!loginHistories?.meta?.total && loginHistories?.meta?.total > 0 && (
                        <div className="px-6 pb-4 pt-4 border-t border-rose-100 bg-white">
                            <PaginationComponent
                                totalPages={loginHistories?.meta?.totalPage || 0}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}