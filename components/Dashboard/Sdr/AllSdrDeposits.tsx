"use client";

import AllFilters from "@/components/Filtering/AllFilters";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import ReusableTable from "@/components/common/ReusableTable";
import { useTranslation } from "@/hooks/use-translation";
import { TMeta } from "@/types";
import { getSortOptions, SortOptionKey } from "@/utils/sortOptions";
import { motion } from "framer-motion";
import { useState } from "react";
import CancelSdrDepositModal from "./CancelSdrDepositModal";
import { getSdrDepositColumns } from "./sdrDepositColumns";
import { TSdrDeposit } from "@/types/sdr-deposits.type";

interface IProps {
    sdrResults: {
        data: TSdrDeposit[];
        meta?: TMeta;
    };
}

const sortFields = ["newest", "oldest"] as SortOptionKey[];

const AllSdrDeposits = ({ sdrResults }: IProps) => {
    const { t } = useTranslation();
    const sortOptions = getSortOptions(t, sortFields);

    const [cancelId, setCancelId] = useState("");

    const columns = getSdrDepositColumns({
        t,
        setCancelId,
    });

    return (
        <>
            <TitleHeader
                title={t("all_sdr_deposits") || "All SDR Deposits"}
                subtitle={
                    t("manage_sdr_deposit_configurations") ||
                    "Manage SDR deposit configurations"
                }
            />

            <AllFilters sortOptions={sortOptions} />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white shadow-md rounded-2xl p-4 md:p-6 mb-2 overflow-x-auto"
            >
                <ReusableTable
                    data={sdrResults?.data || []}
                    meta={sdrResults?.meta as TMeta}
                    columns={columns}
                    getRowKey={(row) => row._id}
                    emptyMessage={t("no_sdr_deposits_available") || "No SDR deposits found"}
                />
            </motion.div>

            {!!sdrResults?.meta?.total && sdrResults.meta.total > 0 && (
                <div className="px-6 mt-4">
                    <PaginationComponent totalPages={sdrResults?.meta?.totalPage || 0} />
                </div>
            )}

            {/* Cancel Modal */}
            <CancelSdrDepositModal
                cancelId={cancelId}
                onClose={() => setCancelId("")}
                t={t}
            />
        </>
    );
};

export default AllSdrDeposits;