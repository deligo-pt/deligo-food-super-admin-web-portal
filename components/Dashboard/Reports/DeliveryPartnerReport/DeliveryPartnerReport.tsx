"use client";

import StatusDistributionCard from "@/components/common/StatusDistributionCard";
import AnalyticsChart from "@/components/Dashboard/Performance/AnalyticsChart/AnalyticsChart";
import StatsCard from "@/components/Dashboard/Performance/StatsCard/StatsCard";
import ExportPopover from "@/components/ExportPopover/ExportPopover";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { IDeliveryPartnerReportAnalytics } from "@/types/report.type";
import { generateDeliveryPartnerReportCSV } from "@/utils/csv/deliveryPartnerReportCSV ";
import { formatPrice } from "@/utils/formatPrice";
import { generateDeliveryPartnerReportPDF } from "@/utils/pdf/deliveryPartnerReportPdf";
import { motion } from "framer-motion";
import { Bike, CheckCircle, EuroIcon, Package } from "lucide-react";

interface IProps {
  deliveryPartnerReportAnalytics: IDeliveryPartnerReportAnalytics;
}

export default function DeliveryPartnerReport({
  deliveryPartnerReportAnalytics,
}: IProps) {
  const data = {
    stats: deliveryPartnerReportAnalytics.cards,
    monthlySignups: deliveryPartnerReportAnalytics.partnerGrowth || [],
    vehicleDistribution: deliveryPartnerReportAnalytics.vehicleTypes || {},
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <div className="print:pt-4">
        {/* Header */}
        <TitleHeader
          title="Delivery Partner Report"
          subtitle="Overview of all delivery partners and their performance"
          extraComponent={
            <ExportPopover
              onPDFClick={() => generateDeliveryPartnerReportPDF(data)}
              onCSVClick={() => generateDeliveryPartnerReportCSV(data)}
            />
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 print:mb-4">
          <StatsCard
            title="Total Partners"
            value={deliveryPartnerReportAnalytics.cards.totalPartners || 0}
            icon={Bike}
            delay={0}
          />
          <StatsCard
            title="Active Partners"
            value={deliveryPartnerReportAnalytics.cards.activePartners || 0}
            icon={CheckCircle}
            delay={0.1}
          />
          <StatsCard
            title="Total Deliveries"
            value={deliveryPartnerReportAnalytics.cards.totalDeliveries || 0}
            icon={Package}
            delay={0.2}
          />
          <StatsCard
            title="Total Earnings"
            value={`€${formatPrice(Number(deliveryPartnerReportAnalytics.cards.totalEarnings?.replace("€", "")) || 0)}`}
            icon={EuroIcon}
            delay={0.3}
          />
        </div>

        {/* Charts */}
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
          className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 my-8"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Partner Growth
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            New partner registrations over time
          </p>
          <AnalyticsChart
            data={deliveryPartnerReportAnalytics?.partnerGrowth || []}
            type="area"
            dataKey="value"
            xKey="label"
            height={200}
          />
        </motion.div>

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
            Vehicle Distribution
          </h3>
          <div className="space-y-3">
            <StatusDistributionCard
              name="Motorbike"
              value={
                deliveryPartnerReportAnalytics?.vehicleTypes?.motorbike || 0
              }
              color="#DC3173"
            />
            <StatusDistributionCard
              name="E-Bike"
              value={deliveryPartnerReportAnalytics?.vehicleTypes?.eBike || 0}
              color="#f59e0b"
            />
            <StatusDistributionCard
              name="Car"
              value={deliveryPartnerReportAnalytics?.vehicleTypes?.car || 0}
              color="#3b82f6"
            />
            <StatusDistributionCard
              name="Scooter"
              value={deliveryPartnerReportAnalytics?.vehicleTypes?.scooter || 0}
              color="#6b7280"
            />
            <StatusDistributionCard
              name="Bicycle"
              value={deliveryPartnerReportAnalytics?.vehicleTypes?.bicycle || 0}
              color="#ef4444"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
