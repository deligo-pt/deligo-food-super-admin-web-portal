"use client";

import AllFilters from "@/components/Filtering/AllFilters";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import ReusableTable from "@/components/common/ReusableTable";
import { useTranslation } from "@/hooks/use-translation";
import { useStore } from "@/store/store";
import { TMeta } from "@/types";
import { TCuisine } from "@/types/cuisine.type";
import { getSortOptions, SortOptionKey } from "@/utils/sortOptions";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";

import DeleteCuisineModal, { IStatusInfo } from "./DeleteCuisineModal";
import EditCuisineModal from "./EditCuisineModal";
import { getCuisineColumns } from "./cuisineColumns";

interface IProps {
    cuisineResult: {
        data: TCuisine[];
        meta?: TMeta;
    };
}

const sortFields = ["newest", "oldest", "nameAZ", "nameZA"] as SortOptionKey[];

const AllCuisine = ({ cuisineResult }: IProps) => {
    const { t } = useTranslation();
    const { lang } = useStore();
    const sortOptions = getSortOptions(t, sortFields);
    const router = useRouter();

    // Modal Control States
    const [selectedEditCuisine, setSelectedEditCuisine] = useState<TCuisine | null>(null);
    const [statusInfo, setStatusInfo] = useState<IStatusInfo>({ cuisineId: "", field: "" });

    // Table Columns Configuration
    const columns = getCuisineColumns({
        t,
        lang,
        router,
        setSelectedEditCuisine,
        setStatusInfo,
    });

    return (
        <>
            <TitleHeader
                title={t("all_cuisine")}
                subtitle={t("explore_all_different_type_cuisines")}
            />
            <AllFilters sortOptions={sortOptions} />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white shadow-md rounded-2xl p-4 md:p-6 mb-2 overflow-x-auto"
            >
                <ReusableTable
                    data={cuisineResult?.data || []}
                    columns={columns}
                    getRowKey={(row) => row._id}
                    emptyMessage={t("no_cuisine_available_to_show")}
                />
            </motion.div>

            {!!cuisineResult?.meta?.total && cuisineResult?.meta?.total > 0 && (
                <div className="px-6 mt-4">
                    <PaginationComponent totalPages={cuisineResult?.meta?.totalPage || 0} />
                </div>
            )}

            {/* Edit Modal */}
            <EditCuisineModal
                isOpen={selectedEditCuisine !== null}
                onClose={() => setSelectedEditCuisine(null)}
                cuisine={selectedEditCuisine}
                t={t}
            />

            {/* Delete Modal */}
            <DeleteCuisineModal
                statusInfo={statusInfo}
                onClose={() => setStatusInfo({ cuisineId: "", field: "" })}
                t={t}
            />
        </>
    );
};

export default AllCuisine;