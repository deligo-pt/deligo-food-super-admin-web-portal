"use client";

import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { TIngredientOrder } from "@/types/ingredient.type";
import { formatPrice } from "@/utils/formatPrice";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Mail,
  MapPin,
  Phone,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface IProps {
  order: TIngredientOrder;
}

export default function IngredientOrderDetails({ order }: IProps) {
  const handleStatusChange = (newStatus: TIngredientOrder["status"]) => {
    console.log("newStatus", newStatus);
  };

  const getStatusBadge = (status: TIngredientOrder["status"]) => {
    switch (status) {
      case "DELIVERED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-indigo-100 text-indigo-700">
            <CheckCircle size={14} /> Delivered
          </span>
        );
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-700">
            <CheckCircle size={14} /> Approved
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-red-100 text-red-700">
            <XCircle size={14} /> Rejected
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-amber-100 text-amber-700">
            <Clock size={14} /> Pending
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-gray-100 text-gray-700">
            <XCircle size={14} /> Cancelled
          </span>
        );
    }
  };
  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <div className="min-h-screen p-6">
        {/* Back Button */}
        <div className="mb-4">
          <Link
            href="/admin/ingredient-orders"
            className="inline-flex items-center gap-2 text-[#DC3173] hover:underline mb-4 transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Ingredient Orders
          </Link>
        </div>

        {/* Header */}
        <TitleHeader
          title="Ingredient Order Details"
          subtitle="Detailed information about the order"
        />

        <div className="mb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                Order #{order.orderId}
                {getStatusBadge(order.status)}
              </h1>
              <p className="text-gray-500 mt-1">
                Placed on {format(order.createdAt, "dd MMM, yyyy")}
              </p>
            </div>

            <div className="flex gap-3">
              {order.status === "PENDING" && (
                <>
                  <button
                    onClick={() => handleStatusChange("REJECTED")}
                    className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-xl font-medium hover:bg-red-100 transition-all"
                  >
                    <XCircle size={18} />
                    Reject
                  </button>
                  <button
                    onClick={() => handleStatusChange("APPROVED")}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#DC3173] text-white rounded-xl font-bold shadow-lg shadow-[#DC3173]/20 hover:bg-[#DC3173]/90 transition-all"
                  >
                    <CheckCircle size={18} />
                    Approve Order
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Items Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Order Items</h2>
              </div>
              <table className="w-full">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                      Item
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-center">
                      Qty
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">
                      Unit Price
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {order.ingredients?.map((item) => (
                    <tr key={item._id}>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 text-center text-gray-600">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-600">
                        €{formatPrice(item.price as number)}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-gray-900">
                        €{formatPrice((item.price as number) * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  {/* <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-4 text-right font-medium text-gray-600"
                    >
                      Subtotal
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900">
                      €{order.subtotal.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-4 text-right font-medium text-gray-600"
                    >
                      Tax (10%)
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900">
                      €{order.tax.toFixed(2)}
                    </td>
                  </tr> */}
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-4 text-right font-bold text-lg text-gray-900"
                    >
                      Total
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-lg text-[#DC3173]">
                      €{formatPrice(order.totalPrice)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">
                Order Timeline
              </h2>
              <div className="space-y-6">
                {order.timeline?.map((step, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step.completed ? "bg-[#DC3173] border-[#DC3173] text-white" : "bg-white border-gray-200 text-gray-300"}`}
                      >
                        {step.completed ? (
                          <CheckCircle size={16} />
                        ) : (
                          <Clock size={16} />
                        )}
                      </div>
                      {index < (order.timeline?.length || 0) - 1 && (
                        <div
                          className={`w-0.5 h-full my-2 ${step.completed ? "bg-[#DC3173]" : "bg-gray-200"}`}
                        />
                      )}
                    </div>
                    <div>
                      <h4
                        className={`font-bold ${step.completed ? "text-gray-900" : "text-gray-400"}`}
                      >
                        {step.status}
                      </h4>
                      <p className="text-sm text-gray-500">{step.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Sidebar */}
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
              delay: 0.2,
            }}
            className="space-y-6"
          >
            {/* Vendor Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Vendor Details
              </h2>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  {order.vendor.profilePhoto ? (
                    <Image
                      src={order.vendor.profilePhoto || ""}
                      alt={order.vendor?.businessDetails?.businessName || ""}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#DC3173]/10 flex items-center justify-center text-[#DC3173] font-bold text-lg">
                      {order.vendor?.businessDetails?.businessName?.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">
                    {order.vendor?.businessDetails?.businessName}
                  </h3>
                  <p className="text-sm text-gray-500">ID: #VEN-892</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <Mail size={16} />
                  </div>
                  <span className="text-sm">
                    {order.vendor?.email || "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <Phone size={16} />
                  </div>
                  <span className="text-sm">
                    {order.vendor?.contactNumber || "N/A"}
                  </span>
                </div>
                <div className="flex items-start gap-3 text-gray-600">
                  <div className="p-2 bg-gray-50 rounded-lg shrink-0">
                    <MapPin size={16} />
                  </div>
                  <span className="text-sm">
                    {order.vendor?.businessLocation?.street},{" "}
                    {order.vendor?.businessLocation?.city},{" "}
                    {order.vendor?.businessLocation?.country}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
