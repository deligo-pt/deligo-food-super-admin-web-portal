"use client";

import AnalyticsChart from "@/components/Dashboard/Performance/AnalyticsChart/AnalyticsChart";
import StatsCard from "@/components/Dashboard/Performance/StatsCard/StatsCard";
import DeliveryPartnerReportTable from "@/components/Dashboard/Reports/DeliveryPartnerReport/DeliveryPartnerReportTable";
import ExportPopover from "@/components/ExportPopover/ExportPopover";
import AllFilters from "@/components/Filtering/AllFilters";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { TMeta } from "@/types";
import { TDeliveryPartner } from "@/types/delivery-partner.type";
import { IDeliveryPartnerReportAnalytics } from "@/types/report.type";
import { exportDeliveryPartnerReportCSV } from "@/utils/exportDeliveryPartnerReportCSV ";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Bike, CheckCircle, EuroIcon, Package } from "lucide-react";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";

interface IProps {
  partnersData: { data: TDeliveryPartner[]; meta?: TMeta };
  deliveryPartnerReportAnalytics: IDeliveryPartnerReportAnalytics;
};

const sortOptions = [
  { label: "Newest First", value: "-createdAt" },
  { label: "Oldest First", value: "createdAt" },
  { label: "Name (A-Z)", value: "name.firstName" },
  { label: "Name (Z-A)", value: "-name.lastName" },
];

const filterOptions = [
  {
    label: "Status",
    key: "status",
    placeholder: "Select Status",
    type: "select",
    items: [
      {
        label: "Pending",
        value: "PENDING",
      },
      {
        label: "Submitted",
        value: "SUBMITTED",
      },
      {
        label: "Approved",
        value: "APPROVED",
      },
      {
        label: "Rejected",
        value: "REJECTED",
      },
      {
        label: "Blocked",
        value: "BLOCKED",
      },
    ],
  },
];

const VehicleTypes = ({ name, value, partnersData }: { name: string, value: number, partnersData: { data: TDeliveryPartner[]; meta?: TMeta }; }) => {
  return (
    <div
      key={name}
      className="flex items-center justify-between"
    >
      <span className="text-sm text-gray-600">{name}</span>
      <div className="flex items-center gap-2">
        <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#DC3173] rounded-full"
            style={{
              width: !!partnersData?.meta?.total
                ? `${(value / (partnersData?.meta?.total || 1)) * 100}%`
                : 0,
            }}
          />
        </div>
        <span className="font-bold text-gray-900 w-6 text-right">
          {value}
        </span>
      </div>
    </div>
  )
};

export default function DeliveryPartnerReport({ partnersData, deliveryPartnerReportAnalytics }: IProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: reportRef,
    documentTitle: `delivery_partner_report_${format(new Date(), "yyyy-MM-dd_hh_mm_ss_a")}`,
  });

  const stats = {
    total: partnersData.meta?.total || 0,
    approved: partnersData.data?.filter((p) => p.status === "APPROVED").length,
    totalDeliveries: partnersData.data?.reduce(
      (sum, p) => sum + (p.operationalData?.totalDeliveries || 0),
      0,
    ),
    totalEarnings: partnersData.data?.reduce(
      (sum, p) => sum + (p.earnings?.totalEarnings || 0),
      0,
    ),
  };

  return (
    <div ref={reportRef} className="min-h-screen bg-gray-50/50 pb-20">
      <div className="print:pt-4">
        {/* Logo for print */}
        <div className="hidden print:flex items-center gap-2 mb-4">
          <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#DC3173] overflow-hidden shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/deligoLogo.png"
              alt="DeliGo Logo"
              width={36}
              height={36}
              className="object-cover"
            />
          </div>
          <h1 className="font-bold text-xl text-[#DC3173]">DeliGo</h1>
        </div>

        {/* Header */}
        <TitleHeader
          title="Delivery Partner Report"
          subtitle="Overview of all delivery partners and their performance"
          extraComponent={
            <ExportPopover
              onPDFClick={() => handlePrint()}
              onCSVClick={() =>
                exportDeliveryPartnerReportCSV({
                  stats: stats,
                  monthlySignups: deliveryPartnerReportAnalytics.partnerGrowth || [],
                  vehicleDistribution: deliveryPartnerReportAnalytics.vehicleTypes || {},
                  deliveryPartners: partnersData.data,
                })
              }
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
            value={`${(deliveryPartnerReportAnalytics.cards.totalEarnings || "€0.00")}`}
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
            Vehicle Types
          </h3>
          <div className="space-y-3">
            <VehicleTypes
              name="Motorbike"
              value={deliveryPartnerReportAnalytics?.vehicleTypes?.motorbike || 0}
              partnersData={partnersData}
            />
            <VehicleTypes
              name="E-Bike"
              value={deliveryPartnerReportAnalytics?.vehicleTypes?.eBike || 0}
              partnersData={partnersData}
            />
            <VehicleTypes
              name="Car"
              value={deliveryPartnerReportAnalytics?.vehicleTypes?.car || 0}
              partnersData={partnersData}
            />
            <VehicleTypes
              name="Scooter"
              value={deliveryPartnerReportAnalytics?.vehicleTypes?.scooter || 0}
              partnersData={partnersData}
            />
            <VehicleTypes
              name="Bicycle"
              value={deliveryPartnerReportAnalytics?.vehicleTypes?.bicycle || 0}
              partnersData={partnersData}
            />
          </div>
        </motion.div>

        {/* Table */}
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
            delay: 0.4,
          }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#DC3173]/10 rounded-lg text-[#DC3173]">
                <Bike size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  All Delivery Partners
                </h2>
                <p className="text-sm text-gray-500">
                  {partnersData?.meta?.total || 0} partners
                </p>
              </div>
            </div>
          </div>

          <AllFilters sortOptions={sortOptions} filterOptions={filterOptions} />

          <DeliveryPartnerReportTable partners={partnersData?.data} />

          {!!partnersData?.meta?.totalPage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <PaginationComponent
                totalPages={partnersData?.meta?.totalPage as number}
              />
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
