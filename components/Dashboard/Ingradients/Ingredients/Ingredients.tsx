"use client";

import EditIngredientModal from "@/components/Dashboard/Ingradients/Ingredients/EditIngredientModal";
import IngredientTable from "@/components/Dashboard/Ingradients/Ingredients/IngredientTable";
import AllFilters from "@/components/Filtering/AllFilters";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import DeleteModal from "@/components/Modals/DeleteModal";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { TMeta } from "@/types";
import { TIngredient } from "@/types/ingredient.type";
import { TTax } from "@/types/tax.type";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

// Import your deletion request services here
import {
  softDeleteIngredient,
  permanentDeleteIngredient
} from "@/services/dashboard/ingredient/ingredient.service";

interface IProps {
  ingredientsData: { data: TIngredient[]; meta?: TMeta };
  taxes: TTax[];
}

const sortOptions = [
  { label: "Newest First", value: "-createdAt" },
  { label: "Oldest First", value: "createdAt" },
];

export default function Ingredients({ ingredientsData, taxes }: IProps) {
  const router = useRouter();

  // Track both the ID and deletion strategy type together
  const [deleteConfig, setDeleteConfig] = useState<{
    id: string;
    type: "soft" | "permanent";
  } | null>(null);

  const [selectedIngredient, setSelectedIngredient] = useState<TIngredient | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteIngredient = async () => {
    if (!deleteConfig) return;

    setIsDeleting(true);
    const toastId = toast.loading(
      deleteConfig.type === "soft"
        ? "Moving ingredient to trash..."
        : "Permanently deleting ingredient..."
    );

    // Dynamically fire request based on configuration type
    const result = deleteConfig.type === "soft"
      ? await softDeleteIngredient(deleteConfig.id)
      : await permanentDeleteIngredient(deleteConfig.id);

    if (result?.success) {
      toast.success(
        result?.message || `Ingredient ${deleteConfig.type === "soft" ? "soft" : "permanently"} deleted successfully!`,
        { id: toastId }
      );
      router.refresh();
      setIsDeleting(false);
      setDeleteConfig(null);
      return;
    } else {
      setIsDeleting(false);
      toast.error(result?.message || "Failed to complete deletion setup", { id: toastId });
      return;
    }
  };

  return (
    <div className="min-h-screen">
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
        // Pass both parameters down to the table layout
        onDelete={(id: string, type: "soft" | "permanent") => setDeleteConfig({ id, type })}
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
          isOpen={!!selectedIngredient}
          onClose={() => setSelectedIngredient(null)}
          ingredientData={selectedIngredient}
          taxes={taxes}
          onSuccess={() => {
            router.refresh();
          }}
        />
      )}

      {/* Delete Modal Confirmation Box */}
      <DeleteModal
        open={!!deleteConfig}
        onOpenChange={(open) => !open && setDeleteConfig(null)}
        onConfirm={handleDeleteIngredient}
        isDeleting={isDeleting}
        title={deleteConfig?.type === "permanent" ? "Permanent Deletion Alert" : "Soft Delete Confirmation"}
        description={
          deleteConfig?.type === "permanent"
            ? "Are you absolutely sure? This action is irreversible and completely wipes the asset record from the cluster database."
            : "Are you sure you want to flag this item? This operation moves the ingredient item to archive contexts safely."
        }
      />
    </div>
  );
}