"use client";

import OrderTable from "@/components/Dashboard/Orders/OrderTable";
import ExportPopover from "@/components/ExportPopover/ExportPopover";
import AllFilters from "@/components/Filtering/AllFilters";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { useTranslation } from "@/hooks/use-translation";
import { TMeta } from "@/types";
import { TOrder } from "@/types/order.type";
import { generateOrderCSV } from "@/utils/csv/orderCSV";
import { generateOrderPDF } from "@/utils/pdf/orderPdf";
import { getSortOptions, SortOptionKey } from "@/utils/sortOptions";
import { motion } from "framer-motion";

interface IProps {
  ordersResult: { data: TOrder[]; meta?: TMeta };
  showFilters?: boolean;
  title: string;
  subtitle?: string;
}
const sortFields = ["newest", "oldest"] as SortOptionKey[];

export default function Orders({ ordersResult, title, subtitle }: IProps) {
  const { t } = useTranslation();
  const sortOptions = getSortOptions(t, sortFields);

  const orders = ordersResult?.data || [];
  const meta = ordersResult?.meta;

  return (
    <div className="space-y-6 max-w-full">
      {/* Page Title */}
      <TitleHeader
        title={t(`${title}`)}
        subtitle={t(`${subtitle}`)}
        extraComponent={
          <>
            <ExportPopover
              onPDFClick={() => generateOrderPDF(orders, meta)}
              onCSVClick={() => generateOrderCSV(orders, meta)}
            />
          </>
        }
      />

      {/* Filters */}
      <AllFilters sortOptions={sortOptions} />

      {/* Order Table */}
      <OrderTable orders={ordersResult?.data || []} meta={ordersResult?.meta as TMeta} />

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
    </div>
  );
}
