"use client";

import IngredientTable from "@/components/Dashboard/Ingradients/Ingredients/IngredientTable";
import AllFilters from "@/components/Filtering/AllFilters";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import DeleteModal from "@/components/Modals/DeleteModal";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { TMeta } from "@/types";
import { TIngredient } from "@/types/ingredient.type";
import { motion } from "framer-motion";
import { useState } from "react";

interface IProps {
  ingredientsData: { data: TIngredient[]; meta?: TMeta };
}

const sortOptions = [
  { label: "Newest First", value: "-createdAt" },
  { label: "Oldest First", value: "createdAt" },
];

export default function Ingredients({ ingredientsData }: IProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDeleteIngredient = async () => {
    console.log(deleteId);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {/* Header */}
        <TitleHeader
          title="All Ingredients"
          subtitle="Inventory management for packaging and supplies"
        />

        {/* Filters */}
        <AllFilters sortOptions={sortOptions} />

        {/* Ingredients Table */}
        <IngredientTable
          ingredients={ingredientsData.data || []}
          onDelete={(id: string) => setDeleteId(id)}
        />

        {/* Pagination */}
        {!!ingredientsData.meta?.total && ingredientsData.meta?.total > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 md:px-6"
          >
            <PaginationComponent
              totalPages={ingredientsData?.meta?.totalPage as number}
            />
          </motion.div>
        )}

        {/* Delete Modal */}
        <DeleteModal
          open={!!deleteId}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDeleteIngredient}
        />
      </div>
    </div>
  );
}
