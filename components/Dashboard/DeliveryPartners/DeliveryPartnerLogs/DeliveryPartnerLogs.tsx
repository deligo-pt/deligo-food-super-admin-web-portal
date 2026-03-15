"use client";

import ActivityTimeline from "@/components/Dashboard/DeliveryPartners/DeliveryPartnerLogs/ActivityTimeline";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TDeliveryPartnerActivity } from "@/types/delivery-partner.type";
import { motion } from "framer-motion";
import { Bike, Clock, Package } from "lucide-react";
import { useState } from "react";

interface DeliveryPartner {
  id: string;
  name: string;
  avatar: string;
  fleetManager: string;
  status: "online" | "offline" | "delivering";
  todayDeliveries: number;
  todayEarnings: number;
}

const partners: DeliveryPartner[] = [
  {
    id: "1",
    name: "Alex Rivera",
    avatar: "AR",
    fleetManager: "John Smith",
    status: "online",
    todayDeliveries: 12,
    todayEarnings: 156,
  },
  {
    id: "2",
    name: "Maria Santos",
    avatar: "MS",
    fleetManager: "Sarah Johnson",
    status: "delivering",
    todayDeliveries: 15,
    todayEarnings: 195,
  },
  {
    id: "3",
    name: "James Lee",
    avatar: "JL",
    fleetManager: "Mike Chen",
    status: "offline",
    todayDeliveries: 8,
    todayEarnings: 104,
  },
  {
    id: "4",
    name: "Sofia Patel",
    avatar: "SP",
    fleetManager: "Emily Davis",
    status: "online",
    todayDeliveries: 10,
    todayEarnings: 130,
  },
];

const generateActivities = (): TDeliveryPartnerActivity[] => {
  const now = new Date();
  return [
    {
      _id: "1",
      type: "delivery",
      description: "Delivered order #4521 to customer",
      timestamp: new Date(now.getTime() - 15 * 60000),
      location: "123 Main St",
      createdAt: "2026-01-10T00:00:00.000Z",
      updatedAt: "2026-01-10T00:00:00.000Z",
    },
    {
      _id: "2",
      type: "pickup",
      description: "Picked up order from Pizza Palace",
      timestamp: new Date(now.getTime() - 35 * 60000),
      location: "Pizza Palace, Downtown",
      createdAt: "2026-01-10T00:00:00.000Z",
      updatedAt: "2026-01-10T00:00:00.000Z",
    },
    {
      _id: "3",
      type: "delivery",
      description: "Delivered order #4520 to customer",
      timestamp: new Date(now.getTime() - 55 * 60000),
      location: "456 Oak Ave",
      createdAt: "2026-01-10T00:00:00.000Z",
      updatedAt: "2026-01-10T00:00:00.000Z",
    },
    {
      _id: "4",
      type: "pickup",
      description: "Picked up order from Burger Barn",
      timestamp: new Date(now.getTime() - 75 * 60000),
      location: "Burger Barn, Mall",
      createdAt: "2026-01-10T00:00:00.000Z",
      updatedAt: "2026-01-10T00:00:00.000Z",
    },
    {
      _id: "5",
      type: "break",
      description: "Started 15 minute break",
      timestamp: new Date(now.getTime() - 120 * 60000),
      createdAt: "2026-01-10T00:00:00.000Z",
      updatedAt: "2026-01-10T00:00:00.000Z",
    },
    {
      _id: "6",
      type: "delivery",
      description: "Delivered order #4519 to customer",
      timestamp: new Date(now.getTime() - 150 * 60000),
      location: "789 Pine Rd",
      createdAt: "2026-01-10T00:00:00.000Z",
      updatedAt: "2026-01-10T00:00:00.000Z",
    },
    {
      _id: "7",
      type: "pickup",
      description: "Picked up order from Sushi Express",
      timestamp: new Date(now.getTime() - 170 * 60000),
      location: "Sushi Express",
      createdAt: "2026-01-10T00:00:00.000Z",
      updatedAt: "2026-01-10T00:00:00.000Z",
    },
    {
      _id: "8",
      type: "online",
      description: "Went online and started accepting orders",
      timestamp: new Date(now.getTime() - 240 * 60000),
      createdAt: "2026-01-10T00:00:00.000Z",
      updatedAt: "2026-01-10T00:00:00.000Z",
    },
  ];
};

export default function DeliveryPartnerLogs() {
  const [selectedPartner, setSelectedPartner] = useState<DeliveryPartner>(
    partners[0],
  );
  const [activities] =
    useState<TDeliveryPartnerActivity[]>(generateActivities());

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <TitleHeader
        title="Delivery Partner Activity"
        subtitle="Track driver activities and delivery history"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Partner Selector & Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Partner Selector */}
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
          >
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Delivery Partner
            </label>
            <Select
              value={selectedPartner.id}
              onValueChange={(value) =>
                setSelectedPartner(
                  partners.find((p) => p.id === value) || partners[0],
                )
              }
            >
              <SelectTrigger className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all">
                <SelectValue placeholder="Select a partner" />
              </SelectTrigger>
              <SelectContent>
                {partners.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>

          {/* Partner Info Card */}
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
              delay: 0.1,
            }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold text-lg">
                {selectedPartner.avatar}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">
                  {selectedPartner.name}
                </h3>
                <p className="text-sm text-gray-500">
                  Managed by {selectedPartner.fleetManager}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-6">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${selectedPartner.status === "online" ? "bg-green-100 text-green-700" : selectedPartner.status === "delivering" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}
              >
                {selectedPartner.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Package size={14} />
                  <span className="text-xs font-medium">Today</span>
                </div>
                <p className="text-xl font-bold text-gray-900">
                  {selectedPartner.todayDeliveries}
                </p>
                <p className="text-xs text-gray-500">deliveries</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Clock size={14} />
                  <span className="text-xs font-medium">Earnings</span>
                </div>
                <p className="text-xl font-bold text-gray-900">
                  ${selectedPartner.todayEarnings}
                </p>
                <p className="text-xs text-gray-500">today</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right: Activity Timeline */}
        <div className="lg:col-span-2">
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
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-brand-50 rounded-lg text-brand-500">
                <Bike size={20} />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Activity Log</h2>
            </div>

            <ActivityTimeline activities={activities} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
