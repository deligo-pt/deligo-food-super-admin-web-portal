'use client';

import AllFilters from '@/components/Filtering/AllFilters';
import TitleHeader from '@/components/TitleHeader/TitleHeader';
import { useTranslation } from '@/hooks/use-translation';
import { IAgreementVersionResponse } from '@/types/agreement.type';
import { getSortOptions, SortOptionKey } from '@/utils/sortOptions';
import AgreementVersionsTable from './AgreementVersionsTable';
import { motion } from 'framer-motion';
import PaginationComponent from '@/components/Filtering/PaginationComponent';

interface IProps {
    agreeVersionsData: IAgreementVersionResponse;
};

const sortFields = ["newest", "oldest", "nameAZ", "nameZA"] as SortOptionKey[];

const AllAgreementVersions = ({ agreeVersionsData }: IProps) => {
    const { t } = useTranslation();
    const sortOptions = getSortOptions(t, sortFields);

    return (
        <div className="space-y-6 max-w-full">
            {/* Page Title */}
            <TitleHeader
                title={t("all_agreements_versions")}
                subtitle={t("manage_all_agreements_versions")}
            />

            {/* Filters */}
            <AllFilters
                sortOptions={sortOptions}
            // {...(showFilters && { filterOptions })}
            />

            {/* Agreement Versions Table */}
            <AgreementVersionsTable
                agreements={agreeVersionsData?.data}
            />

            {/* Pagination */}
            {!!agreeVersionsData?.meta?.totalPage && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="px-4 md:px-6"
                >
                    <PaginationComponent
                        totalPages={agreeVersionsData?.meta?.totalPage as number}
                    />
                </motion.div>
            )}
        </div>
    );
};

export default AllAgreementVersions;