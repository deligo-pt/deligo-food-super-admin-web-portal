"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import AllFilters from "@/components/Filtering/AllFilters";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { useTranslation } from "@/hooks/use-translation";
import { TLoginHistory } from "@/types/login-history.type";
import { getSortOptions, SortOptionKey } from "@/utils/sortOptions";
import ReusableTable from "@/components/common/ReusableTable";
import { TMeta } from "@/types";
import { getLoginHistoryColumns } from "./getLoginHistoryColumns";
import PaginationComponent from "@/components/Filtering/PaginationComponent";

interface IProps {
    loginHistories: {
        data: TLoginHistory[];
        meta: TMeta;
    };
}

const sortFields = ["newest", "oldest"] as SortOptionKey[];

export default function LoginHistory({ loginHistories }: IProps) {
    const { t } = useTranslation();
    const router = useRouter();

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
    const meta = loginHistories?.meta || { total: 0, totalPage: 0, page: 1, limit: 10 };

    const columns = getLoginHistoryColumns({
        t,
        router,
    });

    return (
        <div className="min-h-screen bg-rose-50/10">
            <div className="space-y-6">
                {/* Header Block matching visual tone */}
                <TitleHeader
                    title={t("login_history")}
                    subtitle={t("see_recent_sign_ins_failed_attempts")}
                />

                {/* Filters Panel */}
                <AllFilters sortOptions={sortOptions} filterOptions={filterOptions} />

                {/* Branded Tabular Presentation wrapping ReusableTable */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white shadow-sm border border-rose-100 rounded-2xl p-4 md:p-6 mb-5 overflow-x-auto"
                >
                    <ReusableTable
                        data={histories}
                        meta={meta}
                        columns={columns}
                        getRowKey={(row) => row._id}
                        emptyMessage={t("no_login_records_found")}
                    />
                </motion.div>

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
    );
}