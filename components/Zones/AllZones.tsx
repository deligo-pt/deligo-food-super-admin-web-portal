"use client";

import AllFilters from "@/components/Filtering/AllFilters";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import ReusableTable from "@/components/common/ReusableTable";
import { useTranslation } from "@/hooks/use-translation";
import { ZoneListResponse } from "@/types/zone.type";
import { TMeta } from "@/types";
import { getSortOptions, SortOptionKey } from "@/utils/sortOptions";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { getZoneColumns } from "./getZoneColumns";

interface IProps {
    zonesData: ZoneListResponse;
}

const sortFields = ["newest", "oldest", "nameAZ", "nameZA"] as SortOptionKey[];

export default function AllZones({ zonesData }: IProps) {
    const { t } = useTranslation();
    const router = useRouter();
    const sortOptions = getSortOptions(t, sortFields);

    const filterOptions = [
        {
            label: "Status",
            key: "isOperational",
            placeholder: "Select status",
            type: "select",
            items: [
                { label: "Operational", value: "true" },
                { label: "Inactive", value: "false" },
            ],
        }
    ];

    const columns = getZoneColumns({
        t,
        onRefresh: () => router.refresh(),
    });

    const zonesList = zonesData?.data || [];

    return (
        <div className="min-h-screen space-y-6">
            <TitleHeader
                title="Zones & Coverage Areas"
                subtitle="Manage delivery zones and their boundaries"
                buttonInfo={{
                    text: t("create_zone"),
                    icon: Plus,
                    onClick: () => router.push('/admin/zones/create')
                }}
            />

            <AllFilters
                sortOptions={sortOptions}
                {...(filterOptions && { filterOptions })}
            />

            <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="bg-white shadow-md rounded-2xl p-4 md:p-6 mb-2 overflow-x-auto"
            >
                <ReusableTable
                    data={zonesList}
                    meta={zonesData?.meta as TMeta}
                    columns={columns}
                    getRowKey={(row) => row._id}
                    emptyMessage="No zones found"
                />
            </motion.div>

            {!!zonesData?.meta?.total && zonesData.meta.total > 0 && (
                <div className="pt-2">
                    <PaginationComponent totalPages={zonesData?.meta?.totalPage || 0} />
                </div>
            )}
        </div>
    );
}