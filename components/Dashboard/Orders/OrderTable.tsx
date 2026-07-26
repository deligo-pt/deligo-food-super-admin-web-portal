"use client";


import { useTranslation } from "@/hooks/use-translation";
import { TOrder } from "@/types/order.type";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { getOrderColumns } from "./OrderColumns";
import ReusableTable from "@/components/common/ReusableTable";
import { refundOrderReq } from "@/services/dashboard/order/order.service";
import { toast } from "sonner";
import { useState } from "react";
import RefundModal from "./RefundModal";

interface IProps {
  orders: TOrder[];
}

export default function OrderTable({ orders }: IProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [orderId, setOrderId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRefundOrder = async () => {
    if (!orderId) return;

    const toastId = toast.loading("Refunding! Please wait....");
    setIsSubmitting(true);
    const res = await refundOrderReq(orderId);

    if (res.success) {
      toast.success(res?.message || "Refunded successfully!", { id: toastId });
      router.refresh();
      setIsSubmitting(false);
      setOrderId("");
    } else {
      toast.error(res?.message || "Refunded failed!", { id: toastId });
      setIsSubmitting(false);
    }
  }

  const columns = getOrderColumns({
    t,
    router,
    setOrderId
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
        getRowKey={(row) => row._id as string}
        emptyMessage={t("no_orders_found")}
      />

      <RefundModal
        open={!!orderId}
        onOpenChange={() => setOrderId("")}
        onConfirm={handleRefundOrder}
        isSubmitting={isSubmitting}
      />
    </motion.div>
  );
}