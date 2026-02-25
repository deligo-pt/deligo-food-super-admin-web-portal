/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
    BarChart,
    PieChart,
    Search,
    Wallet,
} from "lucide-react";
import React, { useRef, } from "react";
import { motion } from "framer-motion";

import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { useTranslation } from "@/hooks/use-translation";
import {
    Area,
    AreaChart,
    Bar,
    CartesianGrid,
    BarChart as ReBarChart,
    ResponsiveContainer,
    Scatter,
    ScatterChart,
    Tooltip,
    XAxis,
    YAxis,
    ZAxis,
} from "recharts";
import StatsCard from "../../Performance/StatsCard/StatsCard";
import { IOrderReportAnalytics } from "@/types/report.type";
import Image from "next/image";
import ExportPopover from "@/components/ExportPopover/ExportPopover";
import { useReactToPrint } from "react-to-print";
import { format } from "date-fns";
import { exportOrderReportCSV } from "@/utils/exportOrderReportCSV";
import SelectFilter from "@/components/Filtering/SelectFilter";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import OrderReportTable from "./OrderReportTable";

const DELIGO = "#DC3173";

const daysOption = [
    { label: "Last 7 days", value: "last7days" },
    { label: "Last 14 days", value: "last14days" },
    { label: "Last 30 days", value: "last30days" },
];

interface IProps {
    orderReportAnalytics: IOrderReportAnalytics;
    ordersData: {
        meta: any;
        data: any[];
    };
}

const OrderReport = ({ orderReportAnalytics, ordersData }: IProps) => {
    const { t } = useTranslation();
    const reportRef = useRef<HTMLDivElement>(null);
    const handlePrint = useReactToPrint({
        contentRef: reportRef,
        documentTitle: `customer_report_${format(new Date(), "yyyy-MM-dd_hh_mm_ss_a")}`,
    });
    console.log(ordersData);
    const isMobile = window.innerWidth < 640;

    return (
        <div ref={reportRef}
            className="print-container min-h-screen bg-gray-50/50 pb-20">
            <div className="print:pt-4">
                {/* Logo for print */}
                <div className="hidden print:flex items-center gap-2 mb-4">
                    <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#DC3173] overflow-hidden shadow-md">
                        <Image
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
                    title={t("order_report")}
                    subtitle={t("full_analytics_performance_insights")}
                    extraComponent={
                        <ExportPopover
                            onPDFClick={() => handlePrint()}
                            onCSVClick={() =>
                                exportOrderReportCSV(orderReportAnalytics)
                            }
                        />
                    }
                />

                {/* filtering */}
                <div className="flex flex-row justify-end items-end mb-6">
                    <div>
                        <SelectFilter
                            paramName="timeframe"
                            options={daysOption}
                            placeholder="Timeframe"
                        />
                    </div>
                </div>

                {/* Metrics */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <StatsCard
                        title={t("total_revenue")}
                        value={`€${orderReportAnalytics.summary.totalRevenue || 0}`}
                        icon={BarChart}
                        delay={0.1}
                    />
                    <StatsCard
                        title={t("total_orders")}
                        value={`${orderReportAnalytics.summary.totalOrders || 0}`}
                        icon={PieChart}
                        delay={0.1}
                    />
                    <StatsCard
                        title={t("avg_order")}
                        value={`€${orderReportAnalytics.summary.avgOrderValue || 0}`}
                        icon={Search}
                        delay={0.1}
                    />
                </section>

                {/* Charts grid */}
                <section className="grid grid-cols-1 gap-6">
                    {/* Bar - Zone counts */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <BarChart className="w-4 h-4" /> {t("orders_by_zone")}
                        </h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <ReBarChart
                                    data={orderReportAnalytics.ordersByZone || []}
                                // data={zoneChart}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="zone" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="orders" fill={DELIGO} />
                                </ReBarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Area - Revenue trend */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <BarChart className="w-4 h-4" /> {t("revenue_trend")}
                        </h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={orderReportAnalytics.revenueTrend || []}>
                                    <defs>
                                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={DELIGO} stopOpacity={0.6} />
                                            <stop
                                                offset="95%"
                                                stopColor={DELIGO}
                                                stopOpacity={0.05}
                                            />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke={DELIGO}
                                        fill="url(#revGrad)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </section>

                {/* Table + right analytics */}
                <section className="grid grid-cols-1 gap-6">
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
                        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mt-6"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-[#DC3173]/10 rounded-lg text-[#DC3173]">
                                    <Wallet size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">
                                        All orders
                                    </h2>
                                    <p className="text-sm text-gray-500">
                                        {ordersData.meta?.total || 0} orders
                                    </p>
                                </div>
                            </div>
                        </div>

                        <OrderReportTable orders={ordersData?.data} />

                        {!!ordersData?.meta?.totalPage && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <PaginationComponent
                                    totalPages={ordersData?.meta?.totalPage as number}
                                />
                            </motion.div>
                        )}
                    </motion.div>

                    {/* zone heatmap */}
                    <aside className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-medium">{t("zone_analytics")}</h3>
                            <div className="text-sm text-gray-500">{t("last_30_days")}</div>
                        </div>


                        <ResponsiveContainer width="100%" height={320}>
                            <ScatterChart
                                margin={{ top: 20, right: 20, bottom: 20, left: isMobile ? -30 : 20 }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#f1f1f1"
                                />

                                <XAxis
                                    type="number"
                                    dataKey="hour"
                                    domain={[0, 23]}
                                    tickFormatter={(h) => `${h}:00`}
                                    tick={{ fontSize: 12 }}
                                    name="Hour"
                                />

                                <YAxis
                                    type="category"
                                    dataKey="zone"
                                    width={isMobile ? 80 : 120}
                                    tick={{ fontSize: isMobile ? 10 : 12 }}
                                    name="Zone"
                                />

                                <ZAxis
                                    type="number"
                                    dataKey="orderCount"
                                    range={[80, 420]} // 🔥 square size
                                    name="Orders"
                                />

                                <Tooltip
                                    content={({ payload }) => {
                                        if (!payload || !payload.length) return null;
                                        const d = payload[0].payload;
                                        return (
                                            <div
                                                style={{
                                                    background: "#fff",
                                                    padding: "10px 12px",
                                                    borderRadius: 8,
                                                    boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                                                    fontSize: 13
                                                }}
                                            >
                                                <strong>{d.zone}</strong>
                                                <div>🕒 {d.hour}:00 – {d.hour + 1}:00</div>
                                                <div>📦 {d.orderCount} orders</div>
                                            </div>
                                        );
                                    }}
                                />

                                <Scatter
                                    data={orderReportAnalytics.zoneHeatmap || []}
                                    shape="square"
                                    fill="#DC3173"
                                    fillOpacity={0.85}
                                />
                            </ScatterChart>
                        </ResponsiveContainer>
                    </aside>
                </section>
            </div>
        </div>
    );
}


export default OrderReport;