"use client";

import LoyaltyPointTable from "@/components/Dashboard/LoyaltyPoints/LoyaltyPointTable";
import AllFilters from "@/components/Filtering/AllFilters";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { TMeta } from "@/types";
import { TLoyaltyPoint } from "@/types/loyalty-point.type";

interface IProps {
  pointsResult: { data: TLoyaltyPoint[]; meta?: TMeta };
}

const sortOptions = [
  { label: "Newest First", value: "-createdAt" },
  { label: "Oldest First", value: "createdAt" },
];

export default function LoyaltyPoints({ pointsResult }: IProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <TitleHeader
        title="All Loyalty Points"
        subtitle="The points earned and spent by users"
      />

      <AllFilters sortOptions={sortOptions} />

      {/* Loyalty Points Table */}
      <LoyaltyPointTable points={pointsResult?.data} />
    </div>
  );
}
