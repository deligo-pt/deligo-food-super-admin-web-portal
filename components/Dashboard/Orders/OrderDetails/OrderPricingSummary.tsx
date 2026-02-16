import { TOrder } from "@/types/order.type";
import { motion } from "framer-motion";
import { CreditCardIcon, EuroIcon, SmartphoneIcon } from "lucide-react";

interface IProps {
  order: TOrder;
}

export default function OrderPricingSummary({ order }: IProps) {
  const { totalPrice, paymentMethod, paymentStatus } = order;

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800 border-green-200";
      case "PENDING":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "FAILED":
        return "bg-red-100 text-red-800 border-red-200";
      case "REFUNDED":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        delay: 0.3,
      }}
      className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm"
    >
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-2">
        <EuroIcon className="w-5 h-5 text-[#DC3173]" />
        <h3 className="font-semibold text-gray-900">Payment Summary</h3>
      </div>

      <div className="p-6 space-y-4">
        {/* Payment Method & Status */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-gray-700">
            {paymentMethod === "CARD" ? (
              <CreditCardIcon className="w-5 h-5 text-gray-500" />
            ) : (
              <SmartphoneIcon className="w-5 h-5 text-gray-500" />
            )}
            <span className="font-medium">
              {paymentMethod === "CARD" ? "Credit Card" : "Mobile Payment"}
            </span>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border ${getPaymentStatusColor(paymentStatus)}`}
          >
            {paymentStatus}
          </span>
        </div>

        <div className="border-t border-gray-100 pt-4 mt-4">
          <div className="flex justify-between items-end">
            <span className="text-gray-900 font-semibold">Total Amount</span>
            <span className="text-3xl font-bold text-[#DC3173]">
              €
              {new Intl.NumberFormat("de-DE", {
                minimumFractionDigits: 2,
              }).format(totalPrice)}
            </span>
          </div>
          <p className="text-xs text-gray-400 text-right mt-1">
            Includes all taxes
          </p>
        </div>
      </div>
    </motion.div>
  );
}
