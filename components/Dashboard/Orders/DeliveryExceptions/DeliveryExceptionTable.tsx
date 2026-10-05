"use client";

import { useTranslation } from "@/hooks/use-translation";
import { TDeliveryException } from "@/types/delivery-exception.type";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { getDeliveryExceptionColumns } from "./DeliveryExceptionColumns";
import ReusableTable from "@/components/common/ReusableTable";
import { TMeta } from "@/types";

interface IProps {
    exceptions: TDeliveryException[];
    meta: TMeta;
}

export default function DeliveryExceptionTable({ exceptions, meta }: IProps) {
    const { t } = useTranslation();
    const router = useRouter();

    const columns = getDeliveryExceptionColumns({
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
                data={exceptions}
                meta={meta}
                columns={columns}
                getRowKey={(row) => row.orderId}
                emptyMessage={t("no_delivery_exceptions_found")}
            />
        </motion.div>
    );
}