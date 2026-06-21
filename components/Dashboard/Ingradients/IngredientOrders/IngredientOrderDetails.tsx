"use client";

import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { updatedIngredientOrderStatusReq } from "@/services/dashboard/ingredient/ingredient.service";
import { TIngredientOrder } from "@/types/ingredient.type";
import { formatPrice } from "@/utils/formatPrice";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Clock,
  Mail,
  MapPin,
  Package,
  Phone,
  Truck,
  TruckIcon,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface IProps {
  order: TIngredientOrder;
}

export default function IngredientOrderDetails({ order }: IProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  const updateStatus = async (status: "SHIPPED" | "DELIVERED") => {
    setIsUpdating(true);
    const toastId = toast.loading(
      status === "SHIPPED"
        ? "Updating order status to SHIPPED..."
        : "Updating order status to DELIVERED...",
    );

    const result = await updatedIngredientOrderStatusReq(order._id, { status });

    setIsUpdating(false);

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
    console.log(result);
  };

  const getStatusBadge = (status: TIngredientOrder["orderStatus"]) => {
    switch (status) {
      case "DELIVERED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-[#DC3173]/10 text-[#DC3173]">
            <CheckCircle size={14} /> Delivered
          </span>
        );
      case "SHIPPED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-indigo-100 text-indigo-700">
            <Truck size={14} /> Shipped
          </span>
        );
      case "CONFIRMED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-700">
            <Package size={14} /> Confirmed
          </span>
        );
      case "PENDING":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-amber-100 text-amber-700">
            <Clock size={14} /> Pending
          </span>
        );
    }
  };

  // Safe generation of fallback milestone dates using historical properties
  const orderTimeline = [
    { status: "Placed", date: order.createdAt, completed: true },
    { status: "Shipped", date: order.statusHistory?.shippedAt, completed: !!order.statusHistory?.shippedAt },
    { status: "Delivered", date: order.statusHistory?.deliveredAt, completed: !!order.statusHistory?.deliveredAt },
  ];

  return (
    <div className="min-h-screen">
      {/* Header Layout Component handling Badge layout cleanly without literal string errors */}
      <TitleHeader
        title={`Order #${order.orderId}`}
        subtitle={`Placed on ${format(new Date(order.createdAt), "do MMM yyyy, hh:mm a")}`}
        onBackClick={() => router.back()}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Items Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex flex-row justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Order Items</h2>
              <div className="mt-2 mb-6">
                {getStatusBadge(order.orderStatus)}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Item</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-center">Qty</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Unit Price</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {order.orderDetails?.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{item.name || item.ingredientId?.name}</div>
                        <div className="text-xs text-gray-400 mt-0.5">SKU: {item.sku}</div>
                        {/* Optional Bulk Discount Guard */}
                        {item.ingredientId?.bulkDiscount && item.ingredientId.bulkDiscount.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {item.ingredientId.bulkDiscount.map((discount, dIdx) => (
                              <span key={dIdx} className="inline-block text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                                {discount.minQty}+ units: €{formatPrice(discount.discountPrice)}/{item.unit}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center text-gray-600 font-medium">
                        {item.quantity} <span className="text-xs text-gray-400">{item.unit}</span>
                      </td>
                      <td className="px-6 py-4 text-right text-gray-600">
                        €{formatPrice(item.pricePerUnit)}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-gray-900">
                        €{formatPrice(item.totalAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tbody className="bg-gray-50/50 border-t border-gray-100 divide-y divide-gray-100">
                  <tr>
                    <td colSpan={3} className="px-6 py-3 text-right text-sm text-gray-500">Product Discount</td>
                    <td className="px-6 py-3 text-right text-sm font-medium text-gray-700">
                      -€{formatPrice(order.orderCalculation?.totalProductDiscount || 0)}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="px-6 py-3 text-right text-sm text-gray-500">Tax amount ({order.orderDetails?.[0]?.taxRate || 0}%)</td>
                    <td className="px-6 py-3 text-right text-sm font-medium text-gray-700">
                      €{formatPrice(order.orderCalculation?.totalTaxAmount || 0)}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="px-6 py-3 text-right text-sm text-gray-500">Delivery Charge</td>
                    <td className="px-6 py-3 text-right text-sm font-medium text-gray-700">
                      €{formatPrice(order.delivery?.charge || 0)}
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td colSpan={3} className="px-6 py-4 text-right font-bold text-lg text-gray-900">Total</td>
                    <td className="px-6 py-4 text-right font-extrabold text-lg text-[#DC3173]">
                      €{formatPrice(order.grandTotal)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Order Timeline</h2>
            <div className="space-y-6">
              {orderTimeline.map((step, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step.completed
                        ? "bg-[#DC3173] border-[#DC3173] text-white"
                        : "bg-white border-gray-200 text-gray-300"
                        }`}
                    >
                      {step.completed ? <CheckCircle size={16} /> : <Clock size={16} />}
                    </div>
                    {index < orderTimeline.length - 1 && (
                      <div className={`w-0.5 h-12 my-1 ${step.completed ? "bg-[#DC3173]" : "bg-gray-200"}`} />
                    )}
                  </div>
                  <div className="pt-0.5">
                    <h4 className={`font-bold ${step.completed ? "text-gray-900" : "text-gray-400"}`}>
                      {step.status}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {step.date ? format(new Date(step.date), "dd MMM yyyy, hh:mm a") : "Pending execution"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Vendor Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Vendor Details</h2>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full overflow-hidden shrink-0">
                {order.vendorId?.profilePhoto ? (
                  <Image
                    src={order.vendorId.profilePhoto}
                    alt={order.vendorId?.businessDetails?.businessName || "Vendor"}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#DC3173]/10 flex items-center justify-center text-[#DC3173] font-bold text-lg">
                    {order.vendorId?.businessDetails?.businessName?.charAt(0) || "V"}
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 line-clamp-1">
                  {order.vendorId?.businessDetails?.businessName || "N/A"}
                </h3>
                <p className="text-xs text-gray-400">
                  Manager: {order.vendorId?.name?.firstName} {order.vendorId?.name?.lastName}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-600">
                <div className="p-2 bg-gray-50 rounded-lg shrink-0">
                  <Mail size={16} />
                </div>
                <span className="text-sm break-all">{order.vendorId?.email || "N/A"}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <div className="p-2 bg-gray-50 rounded-lg shrink-0">
                  <Phone size={16} />
                </div>
                <span className="text-sm">{order.vendorId?.contactNumber || "N/A"}</span>
              </div>
              <div className="flex items-start gap-3 text-gray-600">
                <div className="p-2 bg-gray-50 rounded-lg shrink-0">
                  <MapPin size={16} />
                </div>
                <span className="text-sm">
                  {order.deliveryAddress?.street || order.vendorId?.businessLocation?.street},<br />
                  {order.deliveryAddress?.city || order.vendorId?.businessLocation?.city},<br />
                  {order.deliveryAddress?.country || order.vendorId?.businessLocation?.country}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Action Controls */}
      <div className="mt-8 mb-4">
        {order.orderStatus === "CONFIRMED" && (
          <button
            onClick={() => updateStatus("SHIPPED")}
            disabled={isUpdating}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-500 transition-all disabled:opacity-50"
          >
            <TruckIcon size={18} />
            Mark Shipped
          </button>
        )}
        {order.orderStatus === "SHIPPED" && (
          <button
            onClick={() => updateStatus("DELIVERED")}
            disabled={isUpdating}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#DC3173] text-white rounded-xl font-medium hover:bg-[#DC3173]/90 transition-all disabled:opacity-50"
          >
            <TruckIcon size={18} />
            Mark Delivered
          </button>
        )}
      </div>
    </div>
  );
}