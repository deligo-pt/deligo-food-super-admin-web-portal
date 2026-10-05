"use client";

import AllFilters from "@/components/Filtering/AllFilters";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { useTranslation } from "@/hooks/use-translation";
import { TMeta } from "@/types";
import { TDeliveryException } from "@/types/delivery-exception.type";
import { getSortOptions, SortOptionKey } from "@/utils/sortOptions";
import { motion } from "framer-motion";
import DeliveryExceptionTable from "./DeliveryExceptionTable";

interface IProps {
    exceptionsData: {
        data: TDeliveryException[];
        meta?: TMeta;
    };
    showFilters?: boolean;
}

const sortFields = ["newest", "oldest"] as SortOptionKey[];

export default function DeliveryExceptions({
    exceptionsData,
}: IProps) {
    const { t } = useTranslation();
    const sortOptions = getSortOptions(t, sortFields);

    return (
        <div className="space-y-6 max-w-full">
            <TitleHeader title={t("delivery_exceptions")} subtitle={t("delivery_exceptions_subtitle")} />

            <AllFilters sortOptions={sortOptions} />

            <DeliveryExceptionTable
                exceptions={exceptionsData?.data || []}
                meta={exceptionsData?.meta as TMeta}
            />

            {!!exceptionsData?.meta?.totalPage && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="px-4 md:px-6"
                >
                    <PaginationComponent
                        totalPages={exceptionsData?.meta?.totalPage as number}
                    />
                </motion.div>
            )}
        </div>
    );
}