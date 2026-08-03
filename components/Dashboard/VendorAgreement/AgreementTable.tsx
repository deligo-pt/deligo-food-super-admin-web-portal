"use client";

import ReusableTable from "@/components/common/ReusableTable";
import { useTranslation } from "@/hooks/use-translation";
import { IAgreement } from "@/types/agreement.type";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { getAgreementColumns } from "./AgreementColumns";

interface IProps {
    agreements: IAgreement[];
}

export default function AgreementsTable({ agreements }: IProps) {
    const { t } = useTranslation();
    const router = useRouter();

    const columns = getAgreementColumns({
        t,
        router,
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white shadow-md rounded-2xl p-4 md:p-6 mb-5 overflow-x-auto"
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