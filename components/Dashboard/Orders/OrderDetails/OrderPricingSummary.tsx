"use client";

import { useTranslation } from "@/hooks/use-translation";
import { TOrder } from "@/types/order.type";
import { formatPrice } from "@/utils/formatPrice";
import { motion } from "framer-motion";
import { CreditCardIcon, EuroIcon, SmartphoneIcon } from "lucide-react";
import { Row } from "./OrderRow";

interface IProps {
  order: TOrder;
}

export default function OrderPricingSummary({ order }: IProps) {
  const { t } = useTranslation();
  const {
    payoutSummary,
    paymentMethod,
    paymentStatus,
    orderCalculation,
    delivery,
    isPaid,
    transactionId,
  } = order;

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
      case "COMPLETED":
        return "bg-green-100 text-green-800 border-green-200";
      case "PENDING":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "FAILED":
        return "bg-red-100 text-red-800 border-red-200";
      case "REFUNDED":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm"
    >
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-2">
        <EuroIcon className="w-5 h-5 text-[#DC3173]" />
        <h3 className="font-semibold text-gray-900">
          {t("payment_summary") || "Payment Summary"}
        </h3>
      </div>

      <div className="p-6 space-y-5">
        {/* Payment Method & Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-700">
            {paymentMethod === "CARD" ? (
              <CreditCardIcon className="w-5 h-5 text-gray-500" />
            ) : (
              <SmartphoneIcon className="w-5 h-5 text-gray-500" />
            )}
            <span className="font-medium text-sm">{paymentMethod || "N/A"}</span>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border ${getPaymentStatusColor(
              paymentStatus
            )}`}
          >
            {paymentStatus || "UNKNOWN"}
          </span>
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <div>{t("is_paid")}: <span className="font-medium text-gray-800">{isPaid ? "Yes" : "No"}</span></div>
          <div>
            {t("transaction_id")}:{" "}
            <span className="font-medium text-gray-800 break-all">{transactionId || "N/A"}</span>
          </div>
        </div>

        {/* ORDER CALCULATION */}
        <div className="space-y-2 text-sm text-gray-600 border-t border-gray-100 pt-3">
          <div className="font-semibold text-gray-800 mb-1">{t("order_calculation")}</div>
          <Row label={t("total_original_price")} value={orderCalculation?.totalOriginalPrice || 0} />
          <Row
            label={t("total_product_discount")}
            value={orderCalculation?.totalProductDiscount || 0}
            negative
          />
          <Row
            label={t("total_offer_discount")}
            value={orderCalculation?.totalOfferDiscount || 0}
            negative
          />
          <Row label={t("items_subtotal")} value={orderCalculation?.itemsSubtotal || 0} />
          <Row label={t("service_charge")} value={orderCalculation?.serviceCharge || 0} />
          <Row
            label={t("service_charge_vat_rate")}
            value={`${orderCalculation?.serviceChargeVatRate ?? 0}%`}
          />
          <Row
            label={t("service_charge_vat_amount")}
            value={orderCalculation?.serviceChargeVatAmount || 0}
          />
          <Row label={t("total_tax_amount")} value={orderCalculation?.totalTaxAmount || 0} />
        </div>

        {/* DELIVERY */}
        <div className="space-y-2 text-sm text-gray-600 border-t border-gray-100 pt-3">
          <div className="font-semibold text-gray-800 mb-1">{t("delivery")}</div>
          <Row label={t("delivery_charge")} value={delivery?.charge || 0} />
          <Row label={t("delivery_vat_rate")} value={`${delivery?.vatRate ?? 0}%`} />
          <Row label={t("delivery_vat_amount")} value={delivery?.vatAmount || 0} />
          <Row label={t("total_delivery_charge")} value={delivery?.totalDeliveryCharge || 0} />
          <Row label={t("distance")} value={`${delivery?.distance ?? 0} km`} />
          <Row label={t("estimated_time")} value={`${delivery?.estimatedTime ?? 0} min`} />
          {delivery?.notes && (
            <div className="text-xs text-gray-500 mt-1">
              {t("notes")}: {delivery.notes}
            </div>
          )}
        </div>

        {/* PAYOUT SUMMARY */}
        {payoutSummary && (
          <div className="space-y-3 text-sm border-t border-gray-100 pt-3">
            <div className="font-semibold text-gray-800">{t("payout_summary")}</div>

            {/* Platform / DeliGo */}
            <div className="bg-gray-50 rounded-lg p-3 space-y-1.5">
              <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                {t("platform_deligo")}
              </div>
              <Row
                label={t("commission_rate")}
                value={`${payoutSummary.deliGoCommission?.rate ?? 0}%`}
              />
              <Row
                label={t("commission_amount")}
                value={payoutSummary.deliGoCommission?.amount || 0}
              />
              <Row
                label={t("commission_vat_amount")}
                value={payoutSummary.deliGoCommission?.vatAmount || 0}
              />
              <Row
                label={t("total_deduction")}
                value={payoutSummary.deliGoCommission?.totalDeduction || 0}
              />
              <Row
                label={t("earned_service_charge")}
                value={payoutSummary.deliGoCommission?.earnedServiceCharge || 0}
              />
              <Row
                label={t("service_charge_vat_amount")}
                value={payoutSummary.deliGoCommission?.serviceChargeVatAmount || 0}
              />
              <Row
                label={t("delivery_vat_amount")}
                value={payoutSummary.deliGoCommission?.deliveryVatAmount || 0}
              />
              <Row
                label={t("total_platform_net_revenue")}
                value={payoutSummary.deliGoCommission?.totalPlatformNetRevenue || 0}
              />
              <Row
                label={t("total_platform_payable_tax")}
                value={payoutSummary.deliGoCommission?.totalPlatformPayableTax || 0}
              />
              <Row
                label={t("total_platform_gross_holding")}
                value={payoutSummary.deliGoCommission?.totalPlatformGrossHolding || 0}
              />
            </div>

            {/* Fleet */}
            <div className="bg-gray-50 rounded-lg p-3 space-y-1.5">
              <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                {t("fleet")}
              </div>
              <Row label={t("rate")} value={`${payoutSummary.fleet?.rate ?? 0}%`} />
              <Row label={t("fee")} value={payoutSummary.fleet?.fee || 0} />
            </div>

            {/* Vendor */}
            <div className="bg-gray-50 rounded-lg p-3 space-y-1.5">
              <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                {t("vendor")}
              </div>
              <Row
                label={t("earnings_without_tax")}
                value={payoutSummary.vendor?.earningsWithoutTax || 0}
              />
              <Row label={t("payable_tax")} value={payoutSummary.vendor?.payableTax || 0} />
              <Row
                label={t("vendor_net_payout")}
                value={payoutSummary.vendor?.vendorNetPayout || 0}
                highlight
              />
            </div>

            {/* Rider */}
            <div className="bg-gray-50 rounded-lg p-3 space-y-1.5">
              <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                {t("rider")}
              </div>
              <Row
                label={t("rider_net_earnings")}
                value={payoutSummary.rider?.riderNetEarnings || 0}
                highlight
              />
            </div>
          </div>
        )}

        {/* Grand Total */}
        <div className="border-t border-gray-100 pt-4 mt-2">
          <div className="flex justify-between items-end">
            <span className="text-gray-900 font-semibold">
              {t("total_amount") || "Total Amount"}
            </span>
            <span className="text-3xl font-bold text-[#DC3173]">
              €{formatPrice(payoutSummary?.grandTotal || 0)}
            </span>
          </div>
          <p className="text-xs text-gray-400 text-right mt-1">
            {t("includes_all_taxes") || "Includes applicable taxes & fees"}
          </p>
        </div>
      </div>
    </motion.div>
  );
}