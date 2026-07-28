"use client";

import React from "react";
import Link from "next/link";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { useTranslation } from "@/hooks/use-translation";
import { TLoginHistory } from "@/types/login-history.type";
import {
    ArrowLeft,
    User,
    Mail,
    MapPin,
    Clock,
    Laptop,
    Chrome,
    Cpu,
    Terminal,
    CheckCircle2,
    XCircle
} from "lucide-react";

interface IProps {
    loginHistoryDetail: TLoginHistory;
}

export default function LoginHistoryDetail({ loginHistoryDetail }: IProps) {
    const { t } = useTranslation();
    const detail = loginHistoryDetail;

    if (!detail) {
        return (
            <div className="min-h-screen bg-rose-50/10 px-4 py-8 md:px-8 flex flex-col items-center justify-center">
                <p className="text-gray-500 text-sm mb-4">{t("record_not_found")}</p>
                <Link
                    href="/admin/login-history"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-rose-600 hover:underline"
                >
                    <ArrowLeft size={14} /> {t("back_to_list")}
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="">

                {/* Navigation & Header Strip */}
                <div className="flex flex-col gap-2">
                    <Link
                        href="/admin/login-history"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 transition-colors hover:text-rose-700 w-fit"
                    >
                        <ArrowLeft size={14} />
                        {t("back_to_login_history")}
                    </Link>
                    <TitleHeader
                        title={t("login_history_details")}
                        subtitle={`${t("reviewing_session_log_for")} ${detail.email}`}
                    />
                </div>

                {/* Core Layout Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Main Context Card (Left/Span 2) */}
                    <div className="md:col-span-2 space-y-6">

                        {/* Primary Details Block */}
                        <div className="rounded-xl border border-rose-100 bg-white p-6 shadow-xs space-y-4">
                            <h3 className="text-sm font-semibold text-rose-600 border-b border-rose-50 pb-2 flex items-center gap-2">
                                <User size={16} />
                                {t("identity_authentication")}
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-xs text-gray-400 block">{t("email_address")}</span>
                                    <div className="flex items-center gap-1.5 font-medium text-gray-900 mt-0.5">
                                        <Mail size={14} className="text-rose-400" />
                                        {detail.email}
                                    </div>
                                </div>

                                <div>
                                    <span className="text-xs text-gray-400 block">{t("user_id")}</span>
                                    <span className="font-mono text-xs font-medium text-gray-700 block mt-1 bg-gray-50 px-2 py-0.5 rounded w-fit border border-gray-100">
                                        {detail.userId}
                                    </span>
                                </div>

                                <div>
                                    <span className="text-xs text-gray-400 block">{t("assigned_role")}</span>
                                    <span className="inline-block text-xs font-semibold tracking-wide text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full uppercase mt-1">
                                        {detail.userRole}
                                    </span>
                                </div>

                                <div>
                                    <span className="text-xs text-gray-400 block">{t("session_id")}</span>
                                    <span className="font-mono text-xs text-gray-500 block mt-1 truncate" title={detail.sessionId}>
                                        {detail.sessionId || "—"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Network Infrastructure Block */}
                        <div className="rounded-xl border border-rose-100 bg-white p-6 shadow-xs space-y-4">
                            <h3 className="text-sm font-semibold text-rose-600 border-b border-rose-50 pb-2 flex items-center gap-2">
                                <MapPin size={16} />
                                {t("network_location")}
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-xs text-gray-400 block">{t("ip_address")}</span>
                                    <span className="font-mono font-medium text-gray-900 block mt-0.5">{detail.ipAddress || "—"}</span>
                                </div>

                                <div>
                                    <span className="text-xs text-gray-400 block">{t("geographic_location")}</span>
                                    <span className="font-medium text-gray-900 block mt-0.5">
                                        {detail.city || detail.country ? `${detail.city}, ${detail.country}` : "—"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Full User Agent String Panel */}
                        <div className="rounded-xl border border-rose-100 bg-white p-6 shadow-xs space-y-3">
                            <h3 className="text-sm font-semibold text-rose-600 border-b border-rose-50 pb-2 flex items-center gap-2">
                                <Terminal size={16} />
                                {t("raw_user_agent")}
                            </h3>
                            <p className="font-mono text-xs text-gray-500 bg-rose-50/20 rounded-lg p-3 border border-rose-50/50 wrap-break-word leading-relaxed">
                                {detail.userAgent || "—"}
                            </p>
                        </div>

                    </div>

                    {/* Metadata Analytics Sidebar (Right/Span 1) */}
                    <div className="space-y-6">

                        {/* Status & Timing Widget */}
                        <div className="rounded-xl border border-rose-100 bg-white p-6 shadow-xs space-y-5">

                            <div>
                                <span className="text-xs text-gray-400 block mb-2">{t("session_status")}</span>
                                {detail.status === "SUCCESS" ? (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200 uppercase">
                                        <CheckCircle2 size={14} /> {t("verification_success")}
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 border border-rose-200 uppercase">
                                        <XCircle size={14} /> {t("verification_failed")}
                                    </span>
                                )}
                            </div>

                            <div className="border-t border-rose-50 pt-4">
                                <div className="flex items-center gap-2 text-gray-400 mb-1">
                                    <Clock size={14} />
                                    <span className="text-xs">{t("authenticated_at")}</span>
                                </div>
                                <p className="text-sm font-medium text-gray-900 font-mono">
                                    {detail.loginAt || "—"}
                                </p>
                            </div>

                            <div className="border-t border-rose-50 pt-4">
                                <span className="text-xs text-gray-400 block mb-1">{t("active_duration")}</span>
                                <p className="text-sm font-semibold text-gray-800">
                                    {detail.durationSec ? `${Math.floor(detail.durationSec / 60)}m ${detail.durationSec % 60}s` : "—"}
                                </p>
                            </div>
                        </div>

                        {/* Hardware & Environment Specifications */}
                        <div className="rounded-xl border border-rose-100 bg-white p-6 shadow-xs space-y-4">
                            <h3 className="text-sm font-semibold text-rose-600 border-b border-rose-50 pb-2 flex items-center gap-2">
                                <Laptop size={16} />
                                {t("environment")}
                            </h3>

                            <div className="space-y-3 text-sm">
                                <div>
                                    <span className="text-xs text-gray-400 block">{t("device_type")}</span>
                                    <span className="font-medium text-gray-800 capitalize">{detail.deviceType || "—"}</span>
                                </div>

                                <div className="border-t border-rose-50 pt-2.5">
                                    <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-0.5">
                                        <Chrome size={13} />
                                        <span>{t("browser")}</span>
                                    </div>
                                    <span className="font-medium text-gray-800">{detail.browser || "—"}</span>
                                </div>

                                <div className="border-t border-rose-50 pt-2.5">
                                    <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-0.5">
                                        <Cpu size={13} />
                                        <span>{t("operating_system")}</span>
                                    </div>
                                    <span className="font-medium text-gray-800">{detail.os || "—"}</span>
                                </div>
                            </div>

                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}