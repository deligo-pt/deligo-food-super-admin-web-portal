"use client";


import AllFilters from "@/components/Filtering/AllFilters";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { TMeta } from "@/types";
import { IAgreement } from "@/types/agreement.type";
import { motion } from "framer-motion";
import AgreementsTable from "./AgreementTable";

interface IProps {
    agreementsResult: { data: IAgreement[]; meta?: TMeta };
}

const sortOptions = [
    { label: "Newest First", value: "-createdAt" },
    { label: "Oldest First", value: "createdAt" },
    { label: "Establishment (A-Z)", value: "establishmentName" },
];

const filterOptions = [
    {
        label: "Status",
        key: "status",
        placeholder: "Select Status",
        type: "select",
        items: [
            { label: "Pending Verification", value: "pending_verification" },
            { label: "Verified", value: "verified" },
            { label: "Draft", value: "draft" },
            { label: "Emailed", value: "emailed" },
            { label: "Signed", value: "signed" },
        ],
    },
];

export default function Agreements({
    agreementsResult,
}: IProps) {
    console.log("Agreements", agreementsResult);
    return (
        <div className="space-y-6 max-w-full">
            {/* Page Title */}
            <TitleHeader
                title={"Vendor Agreements"}
                subtitle={"Manage and view all vendor agreements"}
            />

            {/* Filters */}
            <AllFilters
                sortOptions={sortOptions}
                filterOptions={filterOptions}
            />

            {/* Agreements Table */}
            <AgreementsTable agreements={agreementsResult?.data || []} />

            {/* Pagination */}
            {!!agreementsResult?.meta?.totalPage && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="px-4 md:px-6"
                >
                    <PaginationComponent
                        totalPages={agreementsResult?.meta?.totalPage as number}
                    />
                </motion.div>
            )}
        </div>
    );
}