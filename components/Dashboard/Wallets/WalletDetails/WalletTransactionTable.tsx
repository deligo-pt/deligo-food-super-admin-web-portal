"use client";

import { useTranslation } from "@/hooks/use-translation";
import { motion } from "framer-motion";
import ReusableTable from "@/components/common/ReusableTable";
import { TMeta } from "@/types";
import { getWalletTransactionColumns } from "./WalletTransactionColumns";
import { TTransaction } from "@/types/transaction.type";

interface IProps {
    transactions: TTransaction[];
    meta: TMeta;
}

const WalletTransactionTable = ({ transactions, meta }: IProps) => {
    const { t } = useTranslation();

    const columns = getWalletTransactionColumns({
        t,
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-2 overflow-x-auto"
        >
            <ReusableTable
                data={transactions}
                meta={meta}
                columns={columns}
                getRowKey={(row) => row._id}
                emptyMessage={t("no_payouts_found")}
            />
        </motion.div>
    );
};

export default WalletTransactionTable;