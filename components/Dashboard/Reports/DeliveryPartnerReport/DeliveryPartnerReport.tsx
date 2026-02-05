"use client";

import AnalyticsChart from "@/components/Dashboard/Performance/AnalyticsChart/AnalyticsChart";
import StatsCard from "@/components/Dashboard/Performance/VendorPerformance/StatsCard";
import DeliveryPartnerReportTable from "@/components/Dashboard/Reports/DeliveryPartnerReport/DeliveryPartnerReportTable";
import ExportPopover from "@/components/ExportPopover/ExportPopover";
import AllFilters from "@/components/Filtering/AllFilters";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { TMeta } from "@/types";
import { TDeliveryPartner } from "@/types/delivery-partner.type";
import { exportDeliveryPartnerReportCSV } from "@/utils/exportDeliveryPartnerReportCSV ";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Bike, CheckCircle, EuroIcon, Package } from "lucide-react";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";

interface IProps {
  partnersData: { data: TDeliveryPartner[]; meta?: TMeta };
}

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

const vehicleDistribution = [
  {
    name: "Motorbike",
    value: 2,
  },
  {
    name: "E-Bike",
    value: 2,
  },
  {
    name: "Scooter",
    value: 2,
  },
  {
    name: "Bicycle",
    value: 1,
  },
  {
    name: "Car",
    value: 1,
  },
];

const monthlySignups = [
  {
    name: "Jan",
    partners: 12,
  },
  {
    name: "Feb",
    partners: 18,
  },
  {
    name: "Mar",
    partners: 15,
  },
  {
    name: "Apr",
    partners: 22,
  },
  {
    name: "May",
    partners: 28,
  },
  {
    name: "Jun",
    partners: 25,
  },
];

export default function DeliveryPartnerReport({ partnersData }: IProps) {
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 print:pt-4">
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
                  monthlySignups,
                  vehicleDistribution,
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
            value={stats.total}
            icon={Bike}
            delay={0}
          />
          <StatsCard
            title="Active Partners"
            value={stats.approved}
            icon={CheckCircle}
            delay={0.1}
          />
          <StatsCard
            title="Total Deliveries"
            value={stats.totalDeliveries.toLocaleString()}
            icon={Package}
            delay={0.2}
          />
          <StatsCard
            title="Total Earnings"
            value={`€${stats.totalEarnings.toLocaleString()}`}
            icon={EuroIcon}
            delay={0.3}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 print:mb-4">
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
            className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Partner Growth
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              New partner registrations over time
            </p>
            <AnalyticsChart
              data={monthlySignups}
              type="area"
              dataKey="partners"
              height={200}
            />
          </motion.div>

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
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Vehicle Types
            </h3>
            <div className="space-y-3">
              {vehicleDistribution.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm text-gray-600">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#DC3173] rounded-full"
                        style={{
                          width: !!partnersData?.meta?.total
                            ? `${(item.value / (partnersData?.meta?.total || 1)) * 100}%`
                            : 0,
                        }}
                      />
                    </div>
                    <span className="font-bold text-gray-900 w-6 text-right">
                      {item.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

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
