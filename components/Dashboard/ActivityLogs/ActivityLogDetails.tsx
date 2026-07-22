"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    User,
    Mail,
    ShieldCheck,
    Activity,
    Target,
    Info,
    Clock,
    Calendar,
    Database,
    Hash
} from "lucide-react";

import { useTranslation } from "@/hooks/use-translation";
import { IActivityLog, ActivityLogType } from "@/types/activity-logs.type";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface IProps {
    log: IActivityLog;
}

export default function ActivityLogDetails({ log }: IProps) {
    const { t } = useTranslation();

    // Helper for rendering Type Badges
    const renderTypeBadge = (type: ActivityLogType) => {
        switch (type?.toUpperCase()) {
            case "INFO":
                return (
                    <Badge className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200">
                        INFO
                    </Badge>
                );
            case "WARNING":
            case "WARN":
                return (
                    <Badge className="bg-amber-50 text-amber-600 hover:bg-amber-100 border-amber-200">
                        WARNING
                    </Badge>
                );
            case "DANGER":
            case "ERROR":
                return (
                    <Badge className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200">
                        DANGER
                    </Badge>
                );
            default:
                return <Badge variant="outline">{type}</Badge>;
        }
    };

    // Helper to format ISO dates cleanly
    const formatDate = (isoString?: string) => {
        if (!isoString) return "—";
        return new Date(isoString).toLocaleString(undefined, {
            dateStyle: "full",
            timeStyle: "medium",
        });
    };

    // Get Avatar Initials
    const getInitials = (name?: string) => {
        if (!name) return "U";
        return name.trim().split(" ")[0]?.charAt(0).toUpperCase() || "U";
    };

    if (!log) {
        return (
            <div className="flex flex-col items-center justify-center min-h-100 space-y-4">
                <p className="text-gray-500">{t("no_log_details_found")}</p>
                <Link href="/activity-logs">
                    <Button className="bg-[#DC3173] hover:bg-[#b8265e] text-white">
                        <ArrowLeft size={16} className="mr-2" />
                        {t("back_to_logs")}
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen space-y-6">
            {/* NAVIGATION / TOP BAR */}
            <div className="flex items-center justify-between">
                <Link href="/admin/activity-logs">
                    <Button
                        variant="ghost"
                        className="text-gray-600 hover:text-[#DC3173] hover:bg-[#DC3173]/10 gap-2"
                    >
                        <ArrowLeft size={18} />
                        <span>{t("back_to_activity_logs")}</span>
                    </Button>
                </Link>

                {renderTypeBadge(log.type)}
            </div>

            {/* HEADER CARD */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <Card className="border-gray-100 shadow-sm overflow-hidden">
                    <div className="bg-[#DC3173] h-3 w-full" />
                    <CardHeader className="pb-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <CardTitle className="text-xl font-bold text-gray-900">
                                    {log.action}
                                </CardTitle>
                                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                                    <Clock size={14} className="text-gray-400" />
                                    {formatDate(log.createdAt)}
                                </p>
                            </div>

                            <div className="text-xs text-gray-400 font-mono bg-gray-50 px-3 py-1.5 rounded-md border border-gray-100 flex items-center gap-1">
                                <Hash size={12} />
                                <span>ID: {log._id}</span>
                            </div>
                        </div>
                    </CardHeader>
                </Card>
            </motion.div>

            {/* MAIN DETAILS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* LEFT COLUMN: USER INFO */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.05 }}
                >
                    <Card className="border-gray-100 shadow-sm h-full">
                        <CardHeader className="border-b border-gray-50 pb-3">
                            <CardTitle className="text-base font-semibold text-[#DC3173] flex items-center gap-2">
                                <User size={18} />
                                {t("user_information")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-full bg-[#DC3173]/10 text-[#DC3173] flex items-center justify-center font-bold text-xl shrink-0">
                                    {getInitials(log.userName)}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 text-lg">
                                        {log.userName || t("unknown_user")}
                                    </h3>
                                    <Badge variant="outline" className="mt-1 capitalize text-xs font-semibold bg-gray-50 text-gray-700">
                                        {log.role || "N/A"}
                                    </Badge>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500 flex items-center gap-2">
                                        <Mail size={16} className="text-gray-400" />
                                        {t("email")}
                                    </span>
                                    <span className="font-medium text-gray-800">{log.email || "—"}</span>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500 flex items-center gap-2">
                                        <ShieldCheck size={16} className="text-gray-400" />
                                        {t("auth_user_id")}
                                    </span>
                                    <span className="font-mono text-xs text-gray-600 bg-gray-50 px-2 py-0.5 rounded border">
                                        {log.authUserId || "—"}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* RIGHT COLUMN: ACTION & TARGET DETAILS */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.1 }}
                >
                    <Card className="border-gray-100 shadow-sm h-full">
                        <CardHeader className="border-b border-gray-50 pb-3">
                            <CardTitle className="text-base font-semibold text-[#DC3173] flex items-center gap-2">
                                <Activity size={18} />
                                {t("action_details")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            <div className="space-y-3">
                                <div className="flex flex-col space-y-1">
                                    <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                                        <Activity size={14} />
                                        {t("action_performed")}
                                    </span>
                                    <p className="text-base font-medium text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        {log.action}
                                    </p>
                                </div>

                                <div className="flex flex-col space-y-1">
                                    <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                                        <Target size={14} />
                                        {t("target_entity")}
                                    </span>
                                    <p className="text-base font-medium text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        {log.target || "—"}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between text-sm pt-2">
                                    <span className="text-gray-500 flex items-center gap-2">
                                        <Info size={16} className="text-gray-400" />
                                        {t("log_type")}
                                    </span>
                                    <div>{renderTypeBadge(log.type)}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* SYSTEM METADATA CARD */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.15 }}
            >
                <Card className="border-gray-100 shadow-sm">
                    <CardHeader className="border-b border-gray-50 pb-3">
                        <CardTitle className="text-base font-semibold text-gray-700 flex items-center gap-2">
                            <Database size={18} />
                            {t("system_timestamps")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-1">
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                    <Calendar size={13} />
                                    {t("created_at")}
                                </span>
                                <p className="font-medium text-gray-800 text-xs sm:text-sm">
                                    {formatDate(log.createdAt)}
                                </p>
                            </div>

                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-1">
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                    <Calendar size={13} />
                                    {t("updated_at")}
                                </span>
                                <p className="font-medium text-gray-800 text-xs sm:text-sm">
                                    {formatDate(log.updatedAt)}
                                </p>
                            </div>

                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-1">
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                    <Hash size={13} />
                                    {t("schema_version")}
                                </span>
                                <p className="font-medium text-gray-800 text-xs sm:text-sm">
                                    __v: {log.__v ?? 0}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}