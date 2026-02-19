"use client";

import StatsCard from "@/components/Dashboard/Performance/StatsCard/StatsCard";
import ZoneCard from "@/components/Dashboard/Zones/ZoneCard/ZoneCard";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { USER_ROLE } from "@/consts/user.const";
import { useTranslation } from "@/hooks/use-translation";
import { TMeta } from "@/types";
import { TZone } from "@/types/zone.type";
import { CircleCheckBig, CircleOff, MapPin } from "lucide-react";

interface IProps {
  zonesData: { data: TZone[]; meta?: TMeta };
}

export default function FleetZones({ zonesData }: IProps) {
  const { t } = useTranslation();

  const operationalZones = zonesData.data?.filter(
    (z) => z.isOperational,
  ).length;

  const notOperationalZones = zonesData.data?.filter(
    (z) => !z.isOperational,
  ).length;

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <div className="absolute top-0 left-0 w-full h-64 bg-linear-to-b from-brand-50/80 to-transparent -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {/* Header */}
        <TitleHeader
          title={t("fleet_zones")}
          subtitle="Manage zones of fleet managers"
        />

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatsCard
            title="Total Zones"
            value={zonesData.data?.length}
            icon={MapPin}
            delay={0}
          />
          <StatsCard
            title="Operational Zones"
            value={operationalZones}
            icon={CircleCheckBig}
            delay={0.1}
          />
          <StatsCard
            title="Not Operational Zones"
            value={notOperationalZones}
            icon={CircleOff}
            delay={0.2}
          />
        </div>

        {/* Zones Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {zonesData.data?.map((zone, index) => (
            <ZoneCard
              key={zone._id}
              name={zone.zoneName}
              total={zone.totalUsers}
              userType={USER_ROLE.FLEET_MANAGER}
              isOperational={zone.isOperational}
              delay={index * 0.1}
            />
          ))}
        </div>
        {zonesData.data?.length === 0 && (
          <div className="text-center text-gray-500">No zones found</div>
        )}
      </div>
    </div>
  );
}
