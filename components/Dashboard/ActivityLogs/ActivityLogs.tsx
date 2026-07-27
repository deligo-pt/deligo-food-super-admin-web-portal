"use client";


import AllFilters from "@/components/Filtering/AllFilters";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { useTranslation } from "@/hooks/use-translation";
import { ActivityLogResponse } from "@/types/activity-logs.type";
import { getSortOptions, SortOptionKey } from "@/utils/sortOptions";
import { motion } from "framer-motion";
import { getActivityLogColumns } from "./activityLogsColumns";
import ReusableTable from "@/components/common/ReusableTable";

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

    const columns = getActivityLogColumns({ t });
    const logsList = logsData?.data || [];

    return (
        <div className="min-h-screen space-y-6">
            <TitleHeader
                title={t("activity_logs")}
                subtitle={t("track_every_important_action_inside")}
            />

            <AllFilters sortOptions={sortOptions} filterOptions={filterOptions} />

            <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
                <ReusableTable
                    data={logsList}
                    columns={columns}
                    getRowKey={(row) => row._id}
                    emptyMessage={t("no_logs_found")}
                />
            </motion.div>

            {!!logsData?.meta?.total && logsData.meta.total > 0 && (
                <div className="pt-2">
                    <PaginationComponent totalPages={logsData?.meta?.totalPage || 0} />
                </div>
            )}
        </div>
    );
}