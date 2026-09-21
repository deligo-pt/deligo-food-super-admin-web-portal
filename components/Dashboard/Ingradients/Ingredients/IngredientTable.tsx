"use client";

import ReusableTable from "@/components/common/ReusableTable";
import { useTranslation } from "@/hooks/use-translation";
import { TIngredient } from "@/types/ingredient.type";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { getIngredientColumns } from "./IngredientColumns";
import { TMeta } from "@/types";

interface IProps {
  ingredients: TIngredient[];
  meta: TMeta;
  onEdit: (ingredient: TIngredient) => void;
  onDelete: (id: string, type: "soft" | "permanent") => void;
}

export default function IngredientTable({
  ingredients,
  meta,
  onEdit,
  onDelete,
}: IProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const columns = getIngredientColumns({
    onDelete,
    onEdit,
    router,
    t,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white shadow-md rounded-2xl p-4 md:p-6 mb-2 overflow-x-auto"
    >
      <ReusableTable
        data={ingredients}
        meta={meta}
        columns={columns}
        getRowKey={(row) => row._id}
        emptyMessage={t("no_ingredients_found")}
      />
    </motion.div>
  );
}