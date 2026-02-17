"use client";

import CustomerFeedbackDetails from "@/components/Dashboard/Ratings/CustomerFeedback/CustomerFeedbackDetails";
import CustomerFeedbackTable from "@/components/Dashboard/Ratings/CustomerFeedback/CustomerFeedbackTable";
import AllFilters from "@/components/Filtering/AllFilters";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { useTranslation } from "@/hooks/use-translation";
import { TMeta } from "@/types";
import { TRating } from "@/types/rating.type";
import { motion } from "framer-motion";
import { useState } from "react";

interface IProps {
  feedbackResult: { data: TRating[]; meta?: TMeta };
}

const sortOptions = [
  { label: "Newest First", value: "-createdAt" },
  { label: "Oldest First", value: "createdAt" },
];

export default function CustomerFeedback({ feedbackResult }: IProps) {
  const { t } = useTranslation();
  const [selectedFeedback, setSelectedFeedback] = useState<TRating | null>(
    null,
  );

  console.log(feedbackResult);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-full">
      {/* Page Title */}
      <TitleHeader
        title={t("customer_feedback")}
        subtitle="Feedbacks from the customers"
      />

      {/* Filters */}
      <AllFilters sortOptions={sortOptions} />

      {/* Feedback Table */}
      <CustomerFeedbackTable
        feedback={feedbackResult?.data || []}
        openDetailsSheet={(feedback: TRating) => setSelectedFeedback(feedback)}
      />

      {/* Pagination */}
      {!!feedbackResult?.meta?.totalPage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 md:px-6"
        >
          <PaginationComponent
            totalPages={feedbackResult?.meta?.totalPage as number}
          />
        </motion.div>
      )}

      {/* Feedback Details Sheet */}
      <CustomerFeedbackDetails
        open={!!selectedFeedback}
        onOpenChange={(open) =>
          setSelectedFeedback(open ? selectedFeedback : null)
        }
        feedback={selectedFeedback}
      />
    </div>
  );
}
