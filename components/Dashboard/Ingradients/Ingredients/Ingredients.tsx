"use client";

import EditIngredientModal from "@/components/Dashboard/Ingradients/Ingredients/EditIngredientModal";
import IngredientTable from "@/components/Dashboard/Ingradients/Ingredients/IngredientTable";
import AllFilters from "@/components/Filtering/AllFilters";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import DeleteModal from "@/components/Modals/DeleteModal";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { TMeta } from "@/types";
import { TIngredient } from "@/types/ingredient.type";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface IProps {
  ingredientsData: { data: TIngredient[]; meta?: TMeta };
}

const sortOptions = [
  { label: "Newest First", value: "-createdAt" },
  { label: "Oldest First", value: "createdAt" },
];

export default function Ingredients({ ingredientsData }: IProps) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIngredient, setSelectedIngredient] =
    useState<TIngredient | null>(null);

  const handleDeleteIngredient = async () => {
    console.log(deleteId);
  };

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <TitleHeader
        title="All Ingredients"
        subtitle="Inventory management for packaging and supplies"
        buttonInfo={{
          text: "Add Ingredient",
          onClick: () => router.push("/admin/add-ingredient"),
        }}
      />

      {/* Filters */}
      <AllFilters sortOptions={sortOptions} />

      {/* Ingredients Table */}
      <IngredientTable
        ingredients={ingredientsData.data || []}
        onEdit={(ingredient: TIngredient) => setSelectedIngredient(ingredient)}
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

      {/* Edit Modal */}
      {selectedIngredient && (
        <EditIngredientModal
          open={!!selectedIngredient}
          onOpenChange={() => setSelectedIngredient(null)}
          prevValues={selectedIngredient}
        />
      )}

      {/* Delete Modal */}
      <DeleteModal
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDeleteIngredient}
      />
    </div>
  );
}
