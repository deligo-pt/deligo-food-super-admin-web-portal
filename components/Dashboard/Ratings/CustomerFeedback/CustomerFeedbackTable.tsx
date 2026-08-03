"use client";

import ReusableTable from "@/components/common/ReusableTable";
import { useTranslation } from "@/hooks/use-translation";
import { TRating } from "@/types/rating.type";
import { motion } from "framer-motion";
import { getCustomerFeedbackColumns } from "./CustomerFeedbackColumns";

interface IProps {
  feedback: TRating[];
  openDetailsSheet: (feedback: TRating) => void;
}

export default function CustomerFeedbackTable({
  feedback,
  openDetailsSheet,
}: IProps) {
  const { t } = useTranslation();

  const columns = getCustomerFeedbackColumns({
    t,
    openDetailsSheet,
  });


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white shadow-md rounded-2xl p-4 md:p-6 mb-2 overflow-x-auto"
    >
      <ReusableTable
        data={feedback}
        columns={columns}
        getRowKey={(row) => row._id}
        emptyMessage={t("no_feedback_found")}
      />
    </motion.div>
  );
}
