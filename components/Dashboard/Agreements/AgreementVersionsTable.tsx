"use client";

import ReusableTable from "@/components/common/ReusableTable";
import { useTranslation } from "@/hooks/use-translation";
import { IAgreementVersion } from "@/types/agreement.type";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { getAgreementVersionColumns } from "./AgreementVersionsColumns";
import { TMeta } from "@/types";

interface IProps {
    agreements: {
        data: IAgreementVersion[];
        meta: TMeta;
    };
}

export default function AgreementVersionsTable({ agreements }: IProps) {
    const { t } = useTranslation();
    const router = useRouter();

    const columns = getAgreementVersionColumns({
        t,
        router,
    });

    const currentPage = agreements?.meta?.page || 1;
    const pageSize = agreements?.meta?.limit || 10;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white shadow-md rounded-2xl p-4 md:p-6 mb-2 overflow-x-auto"
        >
            <ReusableTable
                data={agreements?.data}
                columns={columns}
                getRowKey={(row) => row._id}
                emptyMessage={t("no_agreements_found")}
                serialStart={(currentPage - 1) * pageSize + 1}
            />
        </motion.div>
    );
}