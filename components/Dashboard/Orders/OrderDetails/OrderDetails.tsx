"use client";

import OrderItemsTable from "@/components/Dashboard/Orders/OrderDetails/OrderItemsTable";
import OrderPricingSummary from "@/components/Dashboard/Orders/OrderDetails/OrderPricingSummary";
import { Badge } from "@/components/ui/badge";
import { ORDER_STATUS } from "@/consts/order.const";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";
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
  AlertTriangleIcon,
  FileTextIcon,
  ClockIcon,
  HashIcon,
  PackageIcon,
  TruckIcon,
  InfoIcon,
  StarIcon,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface IProps {
  order: TOrder;
}

const formatDate = (date?: string | null) => {
  if (!date) return "N/A";
  try {
    return format(new Date(date), "dd MMM yyyy, hh:mm a");
  } catch {
    return "Invalid date";
  }
};

const formatCoord = (coords?: number[]) => {
  if (!coords || coords.length < 2) return "N/A";
  return `${coords[1]?.toFixed(6)}, ${coords[0]?.toFixed(6)}`;
};

export default function OrderDetails({ order }: IProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  const statusColors: Record<string, string> = {
    [ORDER_STATUS.PENDING]: "text-amber-700 bg-amber-50",
    [ORDER_STATUS.ACCEPTED]: "text-emerald-700 bg-emerald-50",
    [ORDER_STATUS.PREPARING]: "text-blue-700 bg-blue-50",
    [ORDER_STATUS.READY_FOR_PICKUP]: "text-indigo-700 bg-indigo-50",
    [ORDER_STATUS.ASSIGNED]: "text-sky-700 bg-sky-50",
    [ORDER_STATUS.AWAITING_PARTNER]: "text-violet-700 bg-violet-50",
    [ORDER_STATUS.PICKED_UP]: "text-cyan-700 bg-cyan-50",
    [ORDER_STATUS.DISPATCHING]: "text-cyan-700 bg-cyan-50",
    [ORDER_STATUS.ON_THE_WAY]: "text-teal-700 bg-teal-50",
    [ORDER_STATUS.DELIVERED]: "text-[#DC3173] bg-pink-50",
    [ORDER_STATUS.CANCELED]: "text-red-700 bg-red-50",
    [ORDER_STATUS.REJECTED]: "text-rose-700 bg-rose-50",
    [ORDER_STATUS.REASSIGNMENT_NEEDED]: "text-orange-700 bg-orange-50",
  };

  return (
    <div className="">
      <motion.div
        className="bg-white rounded-xl shadow-xl overflow-hidden min-h-screen md:min-h-0"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* HEADER */}
        <div className="bg-linear-to-r from-[#DC3173] to-[#e45a92] p-6 text-white flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button
              onClick={() => router.back()}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold">
                  {t("order")} #{order?.orderId || "N/A"}
                </h1>
                <span className="text-xs px-2.5 py-0.5 bg-white/20 rounded-full font-medium">
                  {order?.fulfillmentType}
                </span>
                {order?.isDeleted && (
                  <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded uppercase">
                    DELETED
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-white/80 text-sm mt-1">
                <CalendarIcon className="w-4 h-4" />
                <span>{t("created")}: {formatDate(order?.createdAt)}</span>
              </div>
              <div className="text-white/60 text-xs mt-0.5">
                {t("updated")}: {formatDate(order?.updatedAt)} • _id: {order?._id || "N/A"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              className={cn(
                "px-3 py-1 font-semibold border-0",
                statusColors[order?.orderStatus] ?? "bg-white text-slate-600"
              )}
            >
              {order?.orderStatus?.replace(/_/g, " ") || "UNKNOWN"}
            </Badge>
          </div>
        </div>

        {/* Invoice Sync Warning */}
        {order?.invoiceSync && !order.invoiceSync.isSynced && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-center gap-3 text-amber-800 text-sm">
            <AlertTriangleIcon className="w-5 h-5 shrink-0 text-amber-600" />
            <div>
              <span className="font-semibold">{t("invoice_sync_warning")}: </span>
              {order.invoiceSync.syncError || "Failed to synchronize invoice."}
              {order.invoiceSync.syncedAt && (
                <span className="ml-2 text-xs">({t("last_attempt")}: {formatDate(order.invoiceSync.syncedAt)})</span>
              )}
            </div>
          </div>
        )}

        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <motion.div variants={itemVariants as Variants}>
              <OrderItemsTable items={order?.items || []} />
            </motion.div>

            {/* Locations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* PICKUP / VENDOR */}
              <motion.div
                variants={itemVariants as Variants}
                className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-4 text-[#DC3173]">
                  <StoreIcon className="w-5 h-5" />
                  <h3 className="font-semibold text-gray-900">
                    {t("pickup_location") || "Pickup Location / Vendor"}
                  </h3>
                </div>

                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-500">{t("business_name")}:</span>
                    <div className="font-medium text-gray-900">
                      {order?.vendorId?.businessDetails?.businessName ||
                        (order?.vendorId?.name
                          ? `${order.vendorId.name.firstName} ${order.vendorId.name.lastName}`
                          : "N/A")}
                    </div>
                  </div>

                  <div>
                    <span className="text-gray-500">{t("vendor_name")}:</span>
                    <div className="font-medium">
                      {order?.vendorId?.name
                        ? `${order.vendorId.name.firstName} ${order.vendorId.name.lastName}`
                        : "N/A"}
                    </div>
                  </div>

                  <div>
                    <span className="text-gray-500">{t("contact")}:</span>
                    <div className="font-medium">{order?.vendorId?.contactNumber || "N/A"}</div>
                  </div>

                  <div>
                    <span className="text-gray-500">{t("role")}:</span>
                    <div>{order?.vendorId?.role || "N/A"}</div>
                  </div>

                  <div>
                    <span className="text-gray-500">{t("vendor_id")} / {t("user_id")}:</span>
                    <div className="text-xs text-gray-600 break-all">
                      {order?.vendorId?._id || "N/A"} / {order?.vendorId?.userId || "N/A"}
                    </div>
                  </div>

                  {/* Business Details */}
                  <div className="pt-2 border-t border-gray-100">
                    <div className="font-medium text-gray-800 mb-1">{t("business_details")}</div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                      <div>
                        <span className="text-gray-500">{t("opening")}:</span>{" "}
                        {order?.vendorId?.businessDetails?.openingHours || "N/A"}
                      </div>
                      <div>
                        <span className="text-gray-500">{t("closing")}:</span>{" "}
                        {order?.vendorId?.businessDetails?.closingHours || "N/A"}
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-500">{t("closing_days")}:</span>{" "}
                        {order?.vendorId?.businessDetails?.closingDays?.join(", ") || "None"}
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-500">{t("business_type")}:</span>{" "}
                        {order?.vendorId?.businessDetails?.businessType?.name?.en ||
                          order?.vendorId?.businessDetails?.businessType?.name?.pt ||
                          "N/A"}{" "}
                        ({order?.vendorId?.businessDetails?.businessType?._id || "—"})
                      </div>
                    </div>
                  </div>

                  {/* Store Photos */}
                  {order?.vendorId?.documents?.storePhoto?.length > 0 && (
                    <div className="pt-2">
                      <div className="text-gray-500 mb-1">{t("store_photos")}:</div>
                      <div className="flex flex-wrap gap-2">
                        {order.vendorId.documents.storePhoto.map((photo, i) => (
                          <div key={i} className="w-16 h-16 rounded border overflow-hidden relative">
                            <Image src={photo} alt={`Store ${i}`} fill className="object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pickup Address */}
                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex items-start gap-2">
                      <MapPinIcon className="w-4 h-4 mt-0.5 shrink-0 text-gray-400" />
                      <div>
                        <div className="font-medium">
                          {order?.pickupAddress?.street || "N/A"}, {order?.pickupAddress?.city || ""}
                        </div>
                        <div className="text-xs text-gray-500">
                          {order?.pickupAddress?.state || ""} {order?.pickupAddress?.postalCode || ""} •{" "}
                          {order?.pickupAddress?.country || ""}
                        </div>
                        {order?.pickupAddress?.detailedAddress && (
                          <div className="text-xs text-gray-500 mt-0.5">
                            {order.pickupAddress.detailedAddress}
                          </div>
                        )}
                        <div className="text-xs text-gray-400 mt-1">
                          {t("lat_long")}: {order?.pickupAddress?.latitude ?? "N/A"},{" "}
                          {order?.pickupAddress?.longitude ?? "N/A"} • {t("accuracy")}:{" "}
                          {order?.pickupAddress?.geoAccuracy ?? "N/A"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* DELIVERY ADDRESS / CUSTOMER */}
              <motion.div
                variants={itemVariants as Variants}
                className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-4 text-[#DC3173]">
                  <MapPinIcon className="w-5 h-5" />
                  <h3 className="font-semibold text-gray-900">
                    {t("delivery_address") || "Delivery Address / Customer"}
                  </h3>
                </div>

                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-500">{t("customer_name")}:</span>
                    <div className="font-medium text-gray-900">
                      {order?.customerId?.name
                        ? `${order.customerId.name.firstName} ${order.customerId.name.lastName}`
                        : "N/A"}
                    </div>
                  </div>

                  <div>
                    <span className="text-gray-500">{t("contact_nif")}:</span>
                    <div className="font-medium">
                      {order?.customerId?.contactNumber || "N/A"}
                      {order?.customerId?.NIF && (
                        <span className="ml-2 text-xs text-gray-500">{t("nif")}: {order.customerId.NIF}</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-gray-500">{t("role_userId")}:</span>
                    <div className="text-xs">
                      {order?.customerId?.role || "N/A"} • {order?.customerId?.userId || "N/A"}
                    </div>
                  </div>

                  <div>
                    <span className="text-gray-500">{t("customer_id")}:</span>
                    <div className="text-xs break-all">{order?.customerId?._id || "N/A"}</div>
                  </div>

                  {/* Current Session Location */}
                  {order?.customerId?.currentSessionLocation && (
                    <div className="pt-2 border-t border-gray-100 text-xs">
                      <div className="font-medium text-gray-800 mb-1">{t("customer_live_location")}</div>
                      <div>
                        {t("type")}: {order.customerId.currentSessionLocation.type || "N/A"} • {t("mocked")}:{" "}
                        {String(order.customerId.currentSessionLocation.isMocked ?? "N/A")}
                      </div>
                      <div>
                        {t("coords")}: {formatCoord(order.customerId.currentSessionLocation.coordinates)}
                      </div>
                      <div>
                        {t("last_update")}: {formatDate(order.customerId.currentSessionLocation.lastLocationUpdate)}
                      </div>
                    </div>
                  )}

                  {/* Delivery Address */}
                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex items-start gap-2">
                      <MapPinIcon className="w-4 h-4 mt-0.5 shrink-0 text-gray-400" />
                      <div>
                        <div className="font-medium">
                          {order?.deliveryAddress?.street || "N/A"}, {order?.deliveryAddress?.city || ""}
                        </div>
                        <div className="text-xs text-gray-500">
                          {order?.deliveryAddress?.state || ""} {order?.deliveryAddress?.postalCode || ""} •{" "}
                          {order?.deliveryAddress?.country || ""}
                        </div>
                        {order?.deliveryAddress?.detailedAddress && (
                          <div className="text-xs text-gray-500 mt-0.5">
                            {order.deliveryAddress.detailedAddress}
                          </div>
                        )}
                        <div className="text-xs text-gray-400 mt-1">
                          {t("lat_long")}: {order?.deliveryAddress?.latitude ?? "N/A"},{" "}
                          {order?.deliveryAddress?.longitude ?? "N/A"} • {t("accuracy")}:{" "}
                          {order?.deliveryAddress?.geoAccuracy ?? "N/A"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* TIMING & PREPARATION */}
            <motion.div
              variants={itemVariants as Variants}
              className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-4 text-[#DC3173]">
                <ClockIcon className="w-5 h-5" />
                <h3 className="font-semibold text-gray-900">{t("timing_preparation")}</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 block text-xs">{t("preparation_time")}</span>
                  <span className="font-medium">{order?.preparationTime ?? "N/A"} {t("min")}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-xs">{t("auto_accept_deadline")}</span>
                  <span className="font-medium">{formatDate(order?.autoAcceptDeadlineAt)}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-xs">{t("estimated_ready_at")}</span>
                  <span className="font-medium">{formatDate(order?.estimatedReadyAt)}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-xs">{t("food_ready_at")}</span>
                  <span className="font-medium">{formatDate(order?.foodReadyAt)}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-xs">Vendor Responded At</span>
                  <span className="font-medium">{formatDate(order?.vendorRespondedAt)}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-xs">{t("need_more_time_count")}</span>
                  <span className="font-medium">{order?.needMoreTimeCount ?? 0}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-xs">{t("dispatch_expires_at")}</span>
                  <span className="font-medium">{formatDate(order?.dispatchExpiresAt)}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-xs">{t("dispatch_escalated_at")}</span>
                  <span className="font-medium">{formatDate(order?.dispatchEscalatedAt)}</span>
                </div>
              </div>
            </motion.div>

            {/* DISPATCH POOLS */}
            <motion.div
              variants={itemVariants as Variants}
              className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-4 text-[#DC3173]">
                <TruckIcon className="w-5 h-5" />
                <h3 className="font-semibold text-gray-900">{t("dispatch_information")}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 block text-xs mb-1">{t("dispatch_partner_pool")}</span>
                  {order?.dispatchPartnerPool?.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {order.dispatchPartnerPool.map((id, i) => (
                        <span key={i} className="px-2 py-0.5 bg-gray-100 rounded text-xs break-all">
                          {id}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400">{t("empty")}</span>
                  )}
                </div>
                <div>
                  <span className="text-gray-500 block text-xs mb-1">{t("dispatch_rejected_partner_pool")}</span>
                  {order?.dispatchRejectedPartnerPool?.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {order.dispatchRejectedPartnerPool.map((id, i) => (
                        <span key={i} className="px-2 py-0.5 bg-red-50 text-red-700 rounded text-xs break-all">
                          {id}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400">{t("empty")}</span>
                  )}
                </div>
              </div>
            </motion.div>

            {/* STATUS HISTORY */}
            {order?.statusHistory && order.statusHistory.length > 0 && (
              <motion.div
                variants={itemVariants as Variants}
                className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-4 text-gray-800">
                  <FileTextIcon className="w-5 h-5 text-[#DC3173]" />
                  <h3 className="font-semibold text-gray-900">
                    {t("status_history_activity") || "Status History & Activity"}
                  </h3>
                </div>
                <div className="space-y-3 pl-2 border-l-2 border-gray-100 ml-2">
                  {order.statusHistory.map((history, idx) => (
                    <div key={idx} className="relative pl-4 text-sm">
                      <div className="absolute left-[-1.4rem] top-1.5 w-2.5 h-2.5 rounded-full bg-[#DC3173] ring-4 ring-white" />
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-gray-900">
                          {history.status?.replace(/_/g, " ")}
                        </span>
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          {formatDate(history.timestamp)}
                        </span>
                      </div>
                      {history.updatedBy && (
                        <div className="text-xs text-gray-500">By: {history.updatedBy}</div>
                      )}
                      {history.note && (
                        <p className="text-xs text-gray-600 mt-0.5">{history.note}</p>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* REMARKS / INSTRUCTIONS */}
            <motion.div
              variants={itemVariants as Variants}
              className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-4 text-[#DC3173]">
                <InfoIcon className="w-5 h-5" />
                <h3 className="font-semibold text-gray-900">{t("notes_instructions")}</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-500 block text-xs">{t("remarks")}</span>
                  <p className="font-medium">{order?.remarks || "—"}</p>
                </div>
                <div>
                  <span className="text-gray-500 block text-xs">{t("vendor_instructions")}</span>
                  <p className="font-medium">{order?.vendorInstructions || "—"}</p>
                </div>
                <div>
                  <span className="text-gray-500 block text-xs">{t("email_thread_message_id")}</span>
                  <p className="text-xs break-all">{order?.emailThreadMessageId || "N/A"}</p>
                </div>
                <div>
                  <span className="text-gray-500 block text-xs">{t("delivery_partner_cancel_reason")}</span>
                  <p className="font-medium text-red-600">
                    {order?.deliveryPartnerCancelReason || "—"}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <motion.div variants={itemVariants as Variants}>
              <OrderPricingSummary order={order} />
            </motion.div>

            {/* CUSTOMER CARD */}
            <motion.div
              variants={itemVariants as Variants}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm"
            >
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-[#DC3173]" />
                <h3 className="font-semibold text-gray-900 text-sm">
                  {t("customer_details") || "Customer Details"}
                </h3>
              </div>
              <div className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                  {order?.customerId?.profilePhoto ? (
                    <Image
                      src={order.customerId.profilePhoto}
                      alt="Customer"
                      className="w-full h-full object-cover"
                      width={48}
                      height={48}
                    />
                  ) : (
                    <UserIcon className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div className="overflow-hidden">
                  <div className="font-medium text-gray-900 truncate">
                    {order?.customerId?.name
                      ? `${order.customerId.name.firstName} ${order.customerId.name.lastName}`
                      : "N/A"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {order?.customerId?.contactNumber || "N/A"}
                  </div>
                  {order?.customerId?.NIF && (
                    <div className="text-xs text-gray-400 mt-0.5">{t("nif")}: {order.customerId.NIF}</div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* DELIVERY PARTNER CARD */}
            <motion.div
              variants={itemVariants as Variants}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm"
            >
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
                <BikeIcon className="w-4 h-4 text-[#DC3173]" />
                <h3 className="font-semibold text-gray-900 text-sm">
                  {t("delivery_partner") || "Delivery Partner"}
                </h3>
              </div>
              <div className="p-4">
                {order?.deliveryPartnerId ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                        {order.deliveryPartnerId.profilePhoto ? (
                          <Image
                            src={order.deliveryPartnerId.profilePhoto}
                            alt="Driver"
                            className="w-full h-full object-cover"
                            width={48}
                            height={48}
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
                          {order.deliveryPartnerId.contactNumber || "N/A"}
                        </div>
                      </div>
                    </div>

                    <div className="text-xs space-y-1 border-t pt-2">
                      <div>
                        <span className="text-gray-500">{t("role")}:</span>{" "}
                        {order.deliveryPartnerId.role || "N/A"}
                      </div>
                      <div>
                        <span className="text-gray-500">{t("user_id")}:</span>
                        <div className="break-all">
                          {order.deliveryPartnerId._id} / {order.deliveryPartnerId.userId}
                        </div>
                      </div>
                      {order.deliveryPartnerId.currentSessionLocation && (
                        <div className="mt-1">
                          <div className="text-gray-500">{t("live_location")}:</div>
                          <div>
                            {t("coords")}:{" "}
                            {formatCoord(
                              order.deliveryPartnerId.currentSessionLocation.coordinates
                            )}
                          </div>
                          <div>
                            {t("type")}: {order.deliveryPartnerId.currentSessionLocation.type || "N/A"} •
                            {t("accuracy")}:{" "}
                            {order.deliveryPartnerId.currentSessionLocation.geoAccuracy ?? "N/A"}
                          </div>
                          <div>
                            {t("last_update")}:{" "}
                            {formatDate(
                              order.deliveryPartnerId.currentSessionLocation.lastLocationUpdate
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-gray-500 italic py-2">
                    {order?.deliveryPartnerCancelReason
                      ? `${t("partner_cancelled")}: ${order.deliveryPartnerCancelReason}`
                      : t("no_delivery_partner_assigned")}
                  </div>
                )}
              </div>
            </motion.div>

            {/* DELIVERY OTP */}
            {order?.deliveryOtp && (
              <motion.div
                variants={itemVariants as Variants}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm"
              >
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
                  <HashIcon className="w-4 h-4 text-[#DC3173]" />
                  <h3 className="font-semibold text-gray-900 text-sm">{t("delivery_otp")}</h3>
                </div>
                <div className="p-4 text-sm space-y-2">
                  <div>
                    <span className="text-gray-500 text-xs">{t("generated_at")}:</span>
                    <div>{formatDate(order.deliveryOtp.generatedAt)}</div>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">{t("verified_at")}:</span>
                    <div>{formatDate(order.deliveryOtp.verifiedAt)}</div>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">{t("verified_by")}:</span>
                    <div>{order.deliveryOtp.verifiedBy || "N/A"}</div>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">{t("attempts")}:</span>
                    <div className="font-medium">{order.deliveryOtp.attempts ?? 0}</div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* RATING STATUS */}
            <motion.div
              variants={itemVariants as Variants}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm"
            >
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
                <StarIcon className="w-4 h-4 text-[#DC3173]" />
                <h3 className="font-semibold text-gray-900 text-sm">{t("rating_status")}</h3>
              </div>
              <div className="p-4 text-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span>{t("is_rated")}</span>
                  <span className="font-medium">{order?.isRated ? "Yes" : "No"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{t("product_rated")}</span>
                  <span className="font-medium">
                    {order?.ratingStatus?.isProductRated ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{t("delivery_rated")}</span>
                  <span className="font-medium">
                    {order?.ratingStatus?.isDeliveryRated ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* OTHER META */}
            <motion.div
              variants={itemVariants as Variants}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm"
            >
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
                <PackageIcon className="w-4 h-4 text-[#DC3173]" />
                <h3 className="font-semibold text-gray-900 text-sm">{t("order_meta")}</h3>
              </div>
              <div className="p-4 text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">{t("total_items")}</span>
                  <span className="font-medium">{order?.totalItems ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{t("total_quantity")}</span>
                  <span className="font-medium">{order?.totalQuantity ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{t("refund_status")}</span>
                  <span className="font-medium">{order?.refundStatus || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{t("is_deleted")}</span>
                  <span className="font-medium">{order?.isDeleted ? "Yes" : "No"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{t("is_paid")}</span>
                  <span className="font-medium">{order?.isPaid ? "Yes" : "No"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{t("transaction_id")}</span>
                  <span className="font-medium text-xs break-all">
                    {order?.transactionId || "N/A"}
                  </span>
                </div>
                {/* OFFER */}
                <div className="pt-2 border-t">
                  <span className="text-gray-500 text-xs block mb-1">
                    {t("offer_applied") || "Offer Applied"}
                  </span>

                  {!order?.offer ? (
                    <div className="text-sm text-gray-400 italic">{t("no_offer_data")}</div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {order.offer.isApplied ? "Yes" : "No"}
                        </span>
                        {order.offer.isApplied && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full">
                            {t("active")}
                          </span>
                        )}
                      </div>

                      {order.offer.isApplied && order.offer.offerApplied ? (
                        <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1.5 border border-gray-100">
                          <div className="font-medium text-gray-900">
                            {order.offer.offerApplied.title || "Untitled Offer"}
                          </div>

                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600">
                            <div>
                              <span className="text-gray-500">{t("promo_id")}:</span>{" "}
                              <span className="font-mono break-all">
                                {order.offer.offerApplied.promoId || "N/A"}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">{t("discount_type")}:</span>{" "}
                              {order.offer.offerApplied.discountType || "N/A"}
                            </div>
                            <div>
                              <span className="text-gray-500">{t("discount_value")}:</span>{" "}
                              {order.offer.offerApplied.discountType === "PERCENT"
                                ? `${order.offer.offerApplied.discountValue}%`
                                : `€${order.offer.offerApplied.discountValue}`}
                            </div>
                            {order.offer.offerApplied.maxDiscountAmount != null && (
                              <div className="col-span-2">
                                <span className="text-gray-500">{t("max_discount")}:</span>{" "}
                                €{order.offer.offerApplied.maxDiscountAmount}
                              </div>
                            )}
                          </div>

                          {/* Optional: show rewardSnapshot if it has content */}
                          {order.offer.offerApplied.rewardSnapshot &&
                            Object.keys(order.offer.offerApplied.rewardSnapshot).length > 0 && (
                              <div className="pt-2 mt-2 border-t border-gray-200">
                                <div className="text-xs text-gray-500 mb-1">{t("reward_snapshot")}</div>
                                <pre className="text-[11px] bg-white p-2 rounded border overflow-auto max-h-32">
                                  {JSON.stringify(order.offer.offerApplied.rewardSnapshot, null, 2)}
                                </pre>
                              </div>
                            )}
                        </div>
                      ) : order.offer.isApplied ? (
                        <div className="text-xs text-amber-600 italic">
                          {t("offer_is_applied_but_no_details_found")}
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}