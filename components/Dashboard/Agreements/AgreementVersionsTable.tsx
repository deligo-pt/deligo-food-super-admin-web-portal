"use client";

import ReusableTable from "@/components/common/ReusableTable";
import { useTranslation } from "@/hooks/use-translation";
import { IAgreementVersion } from "@/types/agreement.type";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { getAgreementVersionColumns } from "./AgreementVersionsColumns";

interface IProps {
    agreements: IAgreementVersion[];
}

export default function AgreementVersionsTable({ agreements }: IProps) {
    const { t } = useTranslation();
    const router = useRouter();

    const columns = getAgreementVersionColumns({
        t,
        router,
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white shadow-md rounded-2xl p-4 md:p-6 mb-2 overflow-x-auto"
        >
            <ReusableTable
                data={agreements}
                columns={columns}
                getRowKey={(row) => row._id}
                emptyMessage={t("no_agreements_found")}
            />
        </motion.div>
    );
}