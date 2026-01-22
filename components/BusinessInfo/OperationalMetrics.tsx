"use client";

import MetricItem from "@/components/BusinessInfo/MetricItem";
import { useTranslation } from "@/hooks/use-translation";
import { Bike, Store, Users } from "lucide-react";


export default function OperationalMetrics() {
  const { t } = useTranslation();
  const metrics = [
    {
      label: t("active_customers"),
      count: 12453,
      icon: Users,
      color: "bg-blue-500",
      status: "active" as const,
    },
    {
      label: t("active_vendors"),
      count: 842,
      icon: Store,
      color: "bg-purple-500",
      status: "active" as const,
    },
    {
      label: t("online_delivery_partners"),
      count: 156,
      icon: Bike,
      color: "bg-primary-500",
      status: "online" as const,
    },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {metrics.map((metric, index) => (
        <MetricItem key={metric.label} {...metric} delay={0.4 + index * 0.1} />
      ))}
    </div>
  );
}
