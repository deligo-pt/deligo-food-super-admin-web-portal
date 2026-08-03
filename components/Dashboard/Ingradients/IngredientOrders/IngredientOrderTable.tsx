"use client";

import { useTranslation } from "@/hooks/use-translation";
import { updatedIngredientOrderStatusReq } from "@/services/dashboard/ingredient/ingredient.service";
import { TIngredientOrder } from "@/types/ingredient.type";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getIngredientOrderColumns } from "./IngredientOrdersColumns";
import ReusableTable from "@/components/common/ReusableTable";

interface IProps {
  orders: TIngredientOrder[];
  // onDeleteClick: (id: string) => void;
}

export default function IngredientOrderTable({ orders }: IProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const updateStatus = async (id: string, status: "SHIPPED" | "DELIVERED") => {
    const toastId = toast.loading(
      status === "SHIPPED"
        ? "Updating order status to SHIPPED..."
        : "Updating order status to DELIVERED...",
    );

    const result = await updatedIngredientOrderStatusReq(id, { status });

    if (result?.success) {
      toast.success(
        result?.message ||
        (status === "SHIPPED"
          ? "Order status updated to SHIPPED"
          : "Order status updated to DELIVERED"),
        { id: toastId },
      );
      router.refresh();
      return;
    }

    toast.error(
      result?.message ||
      (status === "SHIPPED"
        ? "Failed to update order status to SHIPPED"
        : "Failed to update order status to DELIVERED"),
      { id: toastId },
    );
  };

  const columns = getIngredientOrderColumns({
    t,
    router,
    updateStatus,
  });


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white shadow-md rounded-2xl p-4 md:p-6 mb-2 overflow-x-auto"
    >
      <ReusableTable
        data={orders}
        columns={columns}
        getRowKey={(row) => row._id}
        emptyMessage={t("no_orders_found")}
      />
    </motion.div>
  );
}
