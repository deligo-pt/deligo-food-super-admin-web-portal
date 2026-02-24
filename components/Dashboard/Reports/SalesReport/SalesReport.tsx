"use client";
import Image from "next/image";
import ExportPopover from "@/components/ExportPopover/ExportPopover";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { useTranslation } from "@/hooks/use-translation";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
    BarChart2,
    CheckCircle,
    FileText,
    X,
} from "lucide-react";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ISalesReportAnalytics } from "@/types/report.type";
import StatsCard from "../../Performance/StatsCard/StatsCard";
import SelectFilter from "@/components/Filtering/SelectFilter";
import { exportSalesReportCSV } from "@/utils/exportSalesReportCSV";

const DELIGO = "#DC3173";

const daysOption = [
    { label: "Last 7 days", value: "last7days" },
    { label: "Last 14 days", value: "last14days" },
    { label: "Last 30 days", value: "last30days" },
];

interface IProps {
    salesReportAnalytics: ISalesReportAnalytics
};

const SalesReport = ({ salesReportAnalytics }: IProps) => {
    const { t } = useTranslation();
    const reportRef = useRef<HTMLDivElement>(null);
    const handlePrint = useReactToPrint({
        contentRef: reportRef,
        documentTitle: `customer_report_${format(new Date(), "yyyy-MM-dd_hh_mm_ss_a")}`,
    });

    return (
        <div
            ref={reportRef}
            className="print-container min-h-screen bg-gray-50/50 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 print:pt-4">
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
                    title={t("sales_report")}
                    subtitle={t("overview_revenue_orders_metrics")}
                    extraComponent={
                        <ExportPopover
                            onPDFClick={() => handlePrint()}
                            onCSVClick={() =>
                                exportSalesReportCSV(salesReportAnalytics)
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

                {/* Metrics cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <StatsCard
                        title={t("total_revenue")}
                        value={salesReportAnalytics.summary.totalRevenue || 0}
                        icon={BarChart2}
                        delay={0.1}
                    />
                    <StatsCard
                        title={t("completed_orders")}
                        value={salesReportAnalytics.summary.completedOrders || 0}
                        icon={CheckCircle}
                        delay={0.1}
                    />
                    <StatsCard
                        title={t("cancelled")}
                        value={salesReportAnalytics.summary.cancelledOrders || 0}
                        icon={X}
                        delay={0.1}
                    />
                    <StatsCard
                        title={t("avg_order")}
                        value={salesReportAnalytics.summary.avgOrderValue || 0}
                        icon={FileText}
                        delay={0.1}
                    />
                </div>

                {/* Chart area */}
                <div className="">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-medium">{t("revenue")}</h2>
                        </div>

                        <div style={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart
                                    data={salesReportAnalytics?.charts?.revenueTrend || []}
                                    margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
                                >
                                    <defs>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={DELIGO} stopOpacity={0.6} />
                                            <stop
                                                offset="95%"
                                                stopColor={DELIGO}
                                                stopOpacity={0.05}
                                            />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e6e6e6" />
                                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                    <YAxis />
                                    <Tooltip />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke={DELIGO}
                                        fillOpacity={1}
                                        fill="url(#colorRev)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/40">
                                <p className="text-xs text-gray-500">{t("this_week")}</p>
                                <p className="font-semibold mt-1">
                                    €{salesReportAnalytics.revenueCards.thisWeek || 0}
                                </p>
                            </div>

                            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/40">
                                <p className="text-xs text-gray-500">{t("this_month")}</p>
                                <p className="font-semibold mt-1">
                                    €{salesReportAnalytics.revenueCards.thisMonth || 0}
                                </p>
                            </div>

                            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/40">
                                <p className="text-xs text-gray-500">{t("top_earning_day")}</p>
                                <p className="font-semibold mt-1">
                                    {salesReportAnalytics?.revenueCards?.topEarningDay || "N/A"}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Bottom analytics area: example bar chart for categories or zones */}
                <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl p-5 shadow">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium">{t("earnings_by_day")}</h3>
                        <div className="text-sm text-gray-500">{t("last_7_days")}</div>
                    </div>

                    <div style={{ height: 220 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={salesReportAnalytics?.charts?.earningsByDay || []}
                                margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="revenue" fill={DELIGO} />
                                <Legend />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}


export default SalesReport;