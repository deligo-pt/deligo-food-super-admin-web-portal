"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { User, ShieldCheck, Activity, Info, Eye } from "lucide-react";

import AllFilters from "@/components/Filtering/AllFilters";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { useTranslation } from "@/hooks/use-translation";
import { ActivityLogResponse, ActivityLogType } from "@/types/activity-logs.type";
import { getSortOptions, SortOptionKey } from "@/utils/sortOptions";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface IProps {
    logsData: ActivityLogResponse;
}

const sortFields = ["newest", "oldest", "nameAZ", "nameZA"] as SortOptionKey[];

export default function ActivityLogsPage({ logsData }: IProps) {
    const { t } = useTranslation();

    const sortOptions = getSortOptions(t, sortFields);

    const filterOptions = [
        {
            label: t("type"),
            key: "type",
            placeholder: t("select_type"),
            type: "select",
            items: [
                { label: t("info"), value: "INFO" },
                { label: t("warning"), value: "WARNING" },
                { label: t("danger"), value: "DANGER" },
            ],
        },
    ];

    // Type badge styling using brand accents
    const renderTypeBadge = (type: ActivityLogType) => {
        switch (type) {
            case "INFO":
                return (
                    <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-blue-200">
                        INFO
                    </Badge>
                );
            case "WARNING":
                return (
                    <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
                        WARNING
                    </Badge>
                );
            case "DANGER":
                return (
                    <Badge variant="destructive" className="bg-red-50 text-red-600 border-red-200">
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

    const logsList = logsData?.data || [];

    return (
        <div className="min-h-screen space-y-6">
            {/* HEADER SECTION */}
            <TitleHeader
                title={t("activity_logs")}
                subtitle={t("track_every_important_action_inside")}
            />

            {/* SEARCH + FILTERS */}
            <AllFilters sortOptions={sortOptions} filterOptions={filterOptions} />

            {/* LOGS TABLE CONTAINER */}
            <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
                <Table>
                    <TableHeader className="bg-white border-b border-gray-100">
                        <TableRow className="hover:bg-transparent">
                            {/* 1. USER */}
                            <TableHead className="py-4 text-[#DC3173] font-medium">
                                <div className="flex items-center gap-2">
                                    <User size={16} className="text-[#DC3173]" />
                                    <span>{t("user")}</span>
                                </div>
                            </TableHead>

                            {/* 2. ROLE */}
                            <TableHead className="py-4 text-[#DC3173] font-medium">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck size={16} className="text-[#DC3173]" />
                                    <span>{t("role")}</span>
                                </div>
                            </TableHead>

                            {/* 3. ACTION */}
                            <TableHead className="py-4 text-[#DC3173] font-medium">
                                <div className="flex items-center gap-2">
                                    <Activity size={16} className="text-[#DC3173]" />
                                    <span>{t("action")}</span>
                                </div>
                            </TableHead>

                            {/* 4. TYPE */}
                            <TableHead className="py-4 text-[#DC3173] font-medium text-center">
                                <div className="flex items-center justify-center gap-2">
                                    <Info size={16} className="text-[#DC3173]" />
                                    <span>{t("type")}</span>
                                </div>
                            </TableHead>

                            {/* 5. DETAILS / ACTIONS */}
                            <TableHead className="py-4 text-[#DC3173] font-medium text-right pr-6">
                                <span>{t("actions")}</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {logsList.length > 0 ? (
                            logsList.map((log) => (
                                <TableRow
                                    key={log._id}
                                    className="hover:bg-gray-50/80 transition-colors border-b border-gray-100"
                                >
                                    {/* 1. USER */}
                                    <TableCell className="py-3">
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
                                    </TableCell>

                                    {/* 2. ROLE */}
                                    <TableCell className="py-3">
                                        <span className="text-xs font-semibold tracking-wider text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md uppercase">
                                            {log.role || "N/A"}
                                        </span>
                                    </TableCell>

                                    {/* 3. ACTION */}
                                    <TableCell className="py-3 whitespace-nowrap font-medium text-gray-700 text-sm">
                                        {log.action}
                                    </TableCell>

                                    {/* 4. TYPE */}
                                    <TableCell className="py-3 text-center">
                                        {renderTypeBadge(log.type)}
                                    </TableCell>

                                    {/* 5. DETAILS BUTTON */}
                                    <TableCell className="py-3 text-right pr-6">
                                        <Link href={`/activity-logs/${log._id}`}>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-gray-500 hover:text-[#DC3173] hover:bg-[#DC3173]/10 rounded-full"
                                                title={t("view_details")}
                                            >
                                                <Eye size={18} />
                                            </Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center text-gray-400">
                                    {t("no_logs_found")}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </motion.div>

            {/* PAGINATION */}
            {!!logsData?.meta?.total && logsData?.meta?.total > 0 && (
                <div className="pt-2">
                    <PaginationComponent totalPages={logsData?.meta?.totalPage || 0} />
                </div>
            )}
        </div>
    );
}