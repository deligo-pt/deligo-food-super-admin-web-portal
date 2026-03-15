import {
  TDeliveryPartnerActivity,
  TDeliveryPartnerActivityType,
} from "@/types/delivery-partner.type";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  Coffee,
  MapPin,
  Package,
  Wifi,
  WifiOff,
} from "lucide-react";
import React from "react";

const activityConfig: Record<
  TDeliveryPartnerActivityType,
  {
    icon: React.ElementType;
    color: string;
    bg: string;
  }
> = {
  pickup: {
    icon: Package,
    color: "text-blue-600",
    bg: "bg-blue-100",
  },
  delivery: {
    icon: CheckCircle2,
    color: "text-green-600",
    bg: "bg-green-100",
  },
  online: {
    icon: Wifi,
    color: "text-brand-600",
    bg: "bg-brand-100",
  },
  offline: {
    icon: WifiOff,
    color: "text-gray-500",
    bg: "bg-gray-100",
  },
  break: {
    icon: Coffee,
    color: "text-amber-600",
    bg: "bg-amber-100",
  },
  location: {
    icon: MapPin,
    color: "text-purple-600",
    bg: "bg-purple-100",
  },
};

interface IProps {
  activities: TDeliveryPartnerActivity[];
}

export default function ActivityTimeline({ activities }: IProps) {
  return (
    <div className="relative">
      <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-100" />

      <div className="space-y-4">
        {activities.map((activity, index) => {
          const config = activityConfig[activity.type];
          const Icon = config.icon;
          return (
            <motion.div
              key={activity._id}
              initial={{
                opacity: 0,
                x: -20,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                delay: index * 0.05,
              }}
              className="relative flex items-start gap-4 pl-2"
            >
              <div
                className={`relative z-10 p-2 rounded-full ${config.bg} ${config.color}`}
              >
                <Icon size={16} />
              </div>

              <div className="flex-1 bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-gray-900">
                      {activity.description}
                    </p>
                    {activity.location && (
                      <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                        <MapPin size={12} />
                        {activity.location}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 flex items-center gap-1 whitespace-nowrap">
                    <Clock size={12} />
                    {formatDistanceToNow(activity.timestamp, {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
