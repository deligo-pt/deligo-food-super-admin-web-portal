"use client";

import PaymentDisputeTable from "@/components/Dashboard/Payments/PaymentDisputes/PaymentDisputeTable";
import StatsCard from "@/components/Dashboard/Performance/StatsCard/StatsCard";
import AllFilters from "@/components/Filtering/AllFilters";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { formatPrice } from "@/utils/formatPrice";
import { motion, Variants } from "framer-motion";
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  FileTextIcon,
  XCircleIcon,
} from "lucide-react";

const disputes = [
  {
    _id: "DSP-2025-001",
    disputeId: "DSP-2025-001",
    desc: "Double charge on order #DG-9045",
    vendor: "Fresh Bites Cafe",
    customer: "Maria Santos",
    amount: 24.8,
    createdAt: "2025-11-10",
    updatedAt: "2025-11-10",
    status: "open",
  },
  {
    _id: "DSP-2025-002",
    disputeId: "DSP-2025-002",
    desc: "Refund not processed for cancelled order",
    vendor: "Pizza Palace",
    customer: "João Silva",
    amount: 18.5,
    createdAt: "2025-11-09",
    updatedAt: "2025-11-09",
    status: "under_review",
  },
  {
    _id: "DSP-2025-003",
    disputeId: "DSP-2025-003",
    desc: "Incorrect amount charged",
    vendor: "Sushi Express",
    customer: "Ana Costa",
    amount: 32.0,
    createdAt: "2025-11-08",
    updatedAt: "2025-11-08",
    status: "resolved",
  },
  {
    _id: "DSP-2025-004",
    disputeId: "DSP-2025-004",
    desc: "Payment failed but order delivered",
    vendor: "Burger Hub",
    customer: "Pedro Lima",
    amount: 15.9,
    createdAt: "2025-11-07",
    updatedAt: "2025-11-07",
    status: "open",
  },
  {
    _id: "DSP-2025-005",
    disputeId: "DSP-2025-005",
    desc: "Duplicate transaction detected",
    vendor: "Taco Town",
    customer: "Sofia Reis",
    amount: 22.4,
    createdAt: "2025-11-06",
    updatedAt: "2025-11-06",
    status: "rejected",
  },
  {
    _id: "DSP-2025-006",
    disputeId: "DSP-2025-006",
    desc: "Overcharge on delivery fee",
    vendor: "Noodle House",
    customer: "Carlos Mendes",
    amount: 8.5,
    createdAt: "2025-11-05",
    updatedAt: "2025-11-05",
    status: "resolved",
  },
];

const disputesData = {
  data: {
    stats: {
      totalDisputes: 31,
      openDisputes: 8,
      resolvedDisputes: 23,
      totalAmountDisputes: 1240.5,
    },
    disputes,
  },
  meta: {
    total: disputes.length,
    page: 1,
    limit: 10,
    totalPage: 1,
  },
};

const sortOptions = [
  { label: "Newest First", value: "-createdAt" },
  { label: "Oldest First", value: "createdAt" },
];

export default function PaymentDisputes() {
  const containerVariants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
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
        damping: 15,
      },
    },
  } as Variants;

  return (
    <div className="min-h-screen p-6">
      <motion.div
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <TitleHeader
          title="Payment Disputes"
          subtitle="Track and resolve payment disputes across the platform"
        />

        {/* Stat Cards */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <StatsCard
            title="Total Disputes"
            value={disputesData.data?.stats?.totalDisputes}
            icon={FileTextIcon}
            delay={0}
          />
          <StatsCard
            title="Open Disputes"
            value={disputesData.data?.stats?.openDisputes}
            icon={AlertCircleIcon}
            delay={0}
          />
          <StatsCard
            title="Resolved Disputes"
            value={disputesData.data?.stats?.resolvedDisputes}
            icon={CheckCircle2Icon}
            delay={0}
          />
          <StatsCard
            title="Total Amount Disputed"
            value={`€${formatPrice(disputesData.data?.stats?.totalAmountDisputes)}`}
            icon={XCircleIcon}
            delay={0}
          />
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-white shadow-md rounded-2xl p-4 md:p-6"
        >
          <h3 className="text-xl font-medium mb-4">All Disputes</h3>

          {/* Filters */}
          <AllFilters sortOptions={sortOptions} />

          {/* Dispute Table */}
          <PaymentDisputeTable disputes={disputesData?.data?.disputes || []} />

          {/* Pagination */}
          {!!disputesData?.meta?.totalPage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-4 md:px-6"
            >
              <PaginationComponent
                totalPages={disputesData?.meta?.totalPage as number}
              />
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
