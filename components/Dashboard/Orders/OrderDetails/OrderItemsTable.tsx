"use client";

import { TOrder } from "@/types/order.type";
import { motion, Variants } from "framer-motion";
import { ShoppingBagIcon } from "lucide-react";

interface IProps {
  items: TOrder["items"];
}

export default function OrderItemsTable({ items }: IProps) {
  const containerVariants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const rowVariants = {
    hidden: {
      opacity: 0,
      x: -20,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-2">
        <ShoppingBagIcon className="w-5 h-5 text-[#DC3173]" />
        <h3 className="font-semibold text-gray-900">Order Items</h3>
        <span className="ml-auto text-sm text-gray-500">
          {items.length} items
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
            <tr>
              <th className="px-6 py-3">Product Details</th>
              <th className="px-6 py-3 text-center">Qty</th>
              <th className="px-6 py-3 text-right">Subtotal</th>
            </tr>
          </thead>
          <motion.tbody
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="divide-y divide-gray-100"
          >
            {items.map((item, index) => (
              <motion.tr
                key={item.productId._id || index}
                variants={rowVariants as Variants}
                className="hover:bg-gray-50/50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">
                      {item.productId.name}
                    </span>
                    <span className="text-xs text-gray-400">
                      ID: {item.productId.productId}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    x{item.quantity}
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-medium text-gray-900">
                  €
                  {new Intl.NumberFormat("de-DE", {
                    minimumFractionDigits: 2,
                  }).format(item.price)}
                </td>
              </motion.tr>
            ))}
          </motion.tbody>
        </table>
      </div>
    </div>
  );
}
