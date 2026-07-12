"use client";

import LoyaltyPointTable from "@/components/Dashboard/LoyaltyPoints/LoyaltyPointTable";
import AllFilters from "@/components/Filtering/AllFilters";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { useTranslation } from "@/hooks/use-translation";
import { TMeta } from "@/types";
import { TLoyaltyPoint } from "@/types/loyalty-point.type";
import { getSortOptions, SortOptionKey } from "@/utils/sortOptions";

interface IProps {
  pointsResult: { data: TLoyaltyPoint[]; meta?: TMeta };
}

const sortFields = ["newest", "oldest"] as SortOptionKey[];

export default function LoyaltyPoints({ pointsResult }: IProps) {
  const { t } = useTranslation();
  const sortOptions = getSortOptions(t, sortFields);

  return (
    <div className="min-h-screen bg-slate-50">
      <TitleHeader
        title={t("all_loyalty_points")}
        subtitle={t("the_points_earned_spent_users")}
      />

      <AllFilters sortOptions={sortOptions} />

      {/* Loyalty Points Table */}
      <LoyaltyPointTable points={pointsResult?.data} />
    </div>
  );
}
