"use client";

import IngredientOrderTable from "@/components/Dashboard/Ingradients/IngredientOrders/IngredientOrderTable";
import AllFilters from "@/components/Filtering/AllFilters";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import DeleteModal from "@/components/Modals/DeleteModal";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { useTranslation } from "@/hooks/use-translation";
import { TMeta } from "@/types";
import { TIngredientOrder } from "@/types/ingredient.type";
import { motion } from "framer-motion";
import { useState } from "react";

interface IProps {
  ingredientOrdersData: { data: TIngredientOrder[]; meta?: TMeta };
}

export default function IngredientOrders({ ingredientOrdersData }: IProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { t } = useTranslation();

  const sortOptions = [
    { label: t("newest_first"), value: "-createdAt" },
    { label: t("oldest_first"), value: "createdAt" },
  ];

  const handleDeleteOrder = async () => {
    console.log(deleteId);
  };

  return (
    <div className="min-h-screen p-6">
      {/* Page Title */}
      <TitleHeader
        title="Ingredient Orders"
        subtitle="Manage and process vendor supply requests"
      />

      {/* Filters */}
      <AllFilters sortOptions={sortOptions} />

      {/* Order Table */}
      <IngredientOrderTable
        orders={ingredientOrdersData?.data || []}
        onDeleteClick={(id: string) => setDeleteId(id)}
      />

      {/* Pagination */}
      {!!ingredientOrdersData?.meta?.totalPage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 md:px-6"
        >
          <PaginationComponent
            totalPages={ingredientOrdersData?.meta?.totalPage as number}
          />
        </motion.div>
      )}

      {/* Delete Modal */}
      <DeleteModal
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDeleteOrder}
      />
    </div>
  );
}
