"use client";

import ReusableTable from "@/components/common/ReusableTable";
import { useTranslation } from "@/hooks/use-translation";
import { TDeliveryPartner } from "@/types/delivery-partner.type";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { getFleetRidersColumns } from "./FleetRidersColumns";

interface IProps {
    riders: Partial<TDeliveryPartner>[];
}

export default function FleetRidersTable({ riders }: IProps) {
    const { t } = useTranslation();
    const router = useRouter();

    const columns = getFleetRidersColumns({
        t,
        router,
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-2 overflow-x-auto"
        >
            <ReusableTable
                data={riders}
                columns={columns}
                getRowKey={(row) => row.userId as string}
                emptyMessage={t("no_riders_registered_yet")}
            />
        </motion.div>
    );
}