"use client";

import OrderItemsTable from "@/components/Dashboard/Orders/OrderDetails/OrderItemsTable";
import OrderPricingSummary from "@/components/Dashboard/Orders/OrderDetails/OrderPricingSummary";
import { TOrder } from "@/types/order.type";
import { format } from "date-fns";
import { motion, Variants } from "framer-motion";
import {
  ArrowLeftIcon,
  BikeIcon,
  CalendarIcon,
  MapPinIcon,
  StoreIcon,
  UserIcon,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface IProps {
  order: TOrder;
}

export default function OrderDetails({ order }: IProps) {
  const router = useRouter();

  console.log(order);

  const containerVariants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: {
      y: 20,
      opacity: 0,
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  return (
    <div className="p-6">
      <motion.div
        className="bg-white rounded-xl shadow-xl overflow-hidden min-h-screen md:min-h-0"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <div className="bg-linear-to-r from-[#DC3173] to-[#e45a92] p-6 text-white">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">Order #{order.orderId}</h1>
                {order.flash && (
                  <span className="px-2 py-0.5 bg-yellow-400 text-yellow-900 text-xs font-bold rounded uppercase">
                    Flash
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-white/80 text-sm mt-1">
                <CalendarIcon className="w-4 h-4" />
                <span>{format(order.createdAt, "dd MMM yyyy, hh:mm a")}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Items & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <motion.div variants={itemVariants as Variants}>
              <OrderItemsTable items={order.items} />
            </motion.div>

            {/* Locations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pickup Info */}
              <motion.div
                variants={itemVariants as Variants}
                className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-4 text-[#DC3173]">
                  <StoreIcon className="w-5 h-5" />
                  <h3 className="font-semibold text-gray-900">
                    Pickup Location
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="font-medium text-gray-900">
                    {order.vendorId.businessDetails?.businessName ||
                      `${order.vendorId.name?.firstName} ${order.vendorId.name?.lastName}`}
                  </div>
                  <div className="text-sm text-gray-600 flex items-start gap-2">
                    <MapPinIcon className="w-4 h-4 mt-0.5 shrink-0 text-gray-400" />
                    <span>
                      {order.pickupAddress?.street}, {order.pickupAddress?.city}
                      <br />
                      {order.pickupAddress?.postalCode}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 pt-2 border-t border-gray-100 mt-2">
                    Vendor Contact: {order.vendorId.contactNumber}
                  </div>
                </div>
              </motion.div>

              {/* Delivery Info */}
              <motion.div
                variants={itemVariants as Variants}
                className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-4 text-[#DC3173]">
                  <MapPinIcon className="w-5 h-5" />
                  <h3 className="font-semibold text-gray-900">
                    Delivery Address
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="font-medium text-gray-900">
                    {order.customerId.name?.firstName}{" "}
                    {order.customerId.name?.lastName}
                  </div>
                  <div className="text-sm text-gray-600 flex items-start gap-2">
                    <MapPinIcon className="w-4 h-4 mt-0.5 shrink-0 text-gray-400" />
                    <span>
                      {order.deliveryAddress.street},{" "}
                      {order.deliveryAddress.city}
                      <br />
                      {order.deliveryAddress.postalCode}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 pt-2 border-t border-gray-100 mt-2">
                    Customer Contact: {order.customerId.contactNumber}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Right Column: Summary & Actors */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <motion.div variants={itemVariants as Variants}>
              <OrderPricingSummary order={order} />
            </motion.div>

            {/* Customer Card */}
            <motion.div
              variants={itemVariants as Variants}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden"
            >
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-[#DC3173]" />
                <h3 className="font-semibold text-gray-900 text-sm">
                  Customer Details
                </h3>
              </div>
              <div className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                  {order.customerId.profilePhoto ? (
                    <Image
                      src={order.customerId.profilePhoto}
                      alt="Customer"
                      className="w-full h-full object-cover"
                      width={300}
                      height={300}
                    />
                  ) : (
                    <UserIcon className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {order.customerId.name?.firstName}{" "}
                    {order.customerId.name?.lastName}
                  </div>
                  <div className="text-xs text-gray-500">
                    {order.customerId.contactNumber}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Delivery Partner Card (if assigned) */}
            {order.deliveryPartnerId && (
              <motion.div
                variants={itemVariants as Variants}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden"
              >
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
                  <BikeIcon className="w-4 h-4 text-[#DC3173]" />
                  <h3 className="font-semibold text-gray-900 text-sm">
                    Delivery Partner
                  </h3>
                </div>
                <div className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                    {order.deliveryPartnerId.profilePhoto ? (
                      <Image
                        src={order.deliveryPartnerId.profilePhoto}
                        alt="Driver"
                        className="w-full h-full object-cover"
                        width={300}
                        height={300}
                      />
                    ) : (
                      <BikeIcon className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {order.deliveryPartnerId.name?.firstName}{" "}
                      {order.deliveryPartnerId.name?.lastName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {order.deliveryPartnerId.contactNumber}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
