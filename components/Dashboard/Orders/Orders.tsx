"use client";

import OrderDetailsSheet from "@/components/Dashboard/Orders/OrderDetailsSheet";
import OrderTable from "@/components/Dashboard/Orders/OrderTable";
import AllFilters from "@/components/Filtering/AllFilters";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { useTranslation } from "@/hooks/use-translation";
import { TMeta } from "@/types";
import { TOrder } from "@/types/order.type";
import { motion } from "framer-motion";
import { useState } from "react";

interface IProps {
  ordersResult: { data: TOrder[]; meta?: TMeta };
  showFilters?: boolean;
  title: string;
  subtitle?: string;
}

export default function Orders({ ordersResult, title, subtitle }: IProps) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<TOrder | null>(null);
  const sortOptions = [
    { label: t("newest_first"), value: "-createdAt" },
    { label: t("oldest_first"), value: "createdAt" },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-full">
      {/* Page Title */}
      <TitleHeader title={title} subtitle={subtitle} />

      {/* Filters */}
      <AllFilters sortOptions={sortOptions} />

      {/* Order Table */}
      <OrderTable orders={ordersResult?.data || []} />

      {/* Pagination */}
      {!!ordersResult?.meta?.totalPage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 md:px-6"
        >
          <PaginationComponent
            totalPages={ordersResult?.meta?.totalPage as number}
          />
        </motion.div>
      )}

      {/* Order details sheet */}
      <OrderDetailsSheet
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
        selectedOrder={selected}
      />
    </div>
  );
}
