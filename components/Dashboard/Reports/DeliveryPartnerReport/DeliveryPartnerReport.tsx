"use client";

import CustomizedCharts from "@/components/common/CustomizedChart/CustomizedChart";
import StatusDistributionCard from "@/components/common/StatusDistributionCard";
import StatsCard from "@/components/Dashboard/Performance/StatsCard/StatsCard";
import ExportPopover from "@/components/ExportPopover/ExportPopover";
import {
  SelectCustomDateFilter,
  SelectDateRangeFilter,
} from "@/components/Filtering/SelectDateRangeFilter";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { useTranslation } from "@/hooks/use-translation";
import { IDeliveryPartnerReportAnalytics } from "@/types/report.type";
import { generateDeliveryPartnerReportCSV } from "@/utils/csv/deliveryPartnerReportCSV ";
import { formatPrice } from "@/utils/formatPrice";
import { generateDeliveryPartnerReportPDF } from "@/utils/pdf/deliveryPartnerReportPdf";
import { motion } from "framer-motion";
import { Bike, CheckCircle, EuroIcon, Package } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

interface IProps {
  deliveryPartnerReportAnalytics: IDeliveryPartnerReportAnalytics;
}

export default function DeliveryPartnerReport({
  deliveryPartnerReportAnalytics,
}: IProps) {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const currentTimeframe = searchParams.get("timeframe") || "";
  const [isCustomDate, setIsCustomDate] = useState(
    currentTimeframe === "custom",
  );

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <div className="print:pt-4">
        {/* Header */}
        <TitleHeader
          title={t("delivery_partner_report")}
          subtitle={t("overview_of_all_delivery_partners_performance")}
          extraComponent={
            <div className="flex items-center gap-3">
              {/* Date Filter */}
              <SelectDateRangeFilter
                placeholder={t("select_date_range")}
                onCustomRangeSelect={() => setIsCustomDate(true)}
              />

              <ExportPopover
                onPDFClick={() =>
                  generateDeliveryPartnerReportPDF(
                    deliveryPartnerReportAnalytics,
                  )
                }
                onCSVClick={() =>
                  generateDeliveryPartnerReportCSV(
                    deliveryPartnerReportAnalytics,
                  )
                }
              />
            </div>
          }
        />

        {/* Custom Date Filter */}
        {isCustomDate && (
          <SelectCustomDateFilter onClear={() => setIsCustomDate(false)} />
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 print:mb-4">
          <StatsCard
            title={t("total_partners")}
            value={deliveryPartnerReportAnalytics.stats?.totalPartners || 0}
            icon={Bike}
          />
          <StatsCard
            title={t("active_partners")}
            value={deliveryPartnerReportAnalytics.stats?.approvedPartners || 0}
            icon={CheckCircle}
            delay={0.1}
          />
          <StatsCard
            title={t("total_deliveries")}
            value={deliveryPartnerReportAnalytics.stats?.totalDeliveries || 0}
            icon={Package}
            delay={0.2}
          />
          <StatsCard
            title={t("total_earnings")}
            value={`€${formatPrice(deliveryPartnerReportAnalytics.stats?.totalEarnings || 0)}`}
            icon={EuroIcon}
            delay={0.3}
          />
        </div>

        {/* Charts */}
        <CustomizedCharts
          type="area"
          title={t("partner_growth")}
          description={t("new_partner_registration_over_time")}
          data={deliveryPartnerReportAnalytics?.partnerGrowths || []}
          xLabel={t("time")}
          yLabel={t("no_of_partners")}
          xKey="time"
          yKey="managers"
          delay={0.2}
        />

        {/* vehicle types */}
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
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 my-8"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            {t("vehicle_distribution")}
          </h3>
          <div className="space-y-3">
            <StatusDistributionCard
              name="Motorbike"
              value={
                deliveryPartnerReportAnalytics?.vehicleDistribution
                  ?.MOTORBIKE || 0
              }
              color="#DC3173"
            />
            <StatusDistributionCard
              name="E-Bike"
              value={
                deliveryPartnerReportAnalytics?.vehicleDistribution?.[
                "E-BIKE"
                ] || 0
              }
              color="#f59e0b"
            />
            <StatusDistributionCard
              name="Car"
              value={
                deliveryPartnerReportAnalytics?.vehicleDistribution?.CAR || 0
              }
              color="#3b82f6"
            />
            <StatusDistributionCard
              name="Scooter"
              value={
                deliveryPartnerReportAnalytics?.vehicleDistribution?.SCOOTER ||
                0
              }
              color="#6b7280"
            />
            <StatusDistributionCard
              name="Bicycle"
              value={
                deliveryPartnerReportAnalytics?.vehicleDistribution?.BICYCLE ||
                0
              }
              color="#ef4444"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
