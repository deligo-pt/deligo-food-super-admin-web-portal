"use client";

import StatsCard from "@/components/Dashboard/Performance/VendorPerformance/StatsCard";
import ZoneCard from "@/components/Dashboard/Zones/ZoneCard/ZoneCard";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { TZone } from "@/types/zone.type";
import { CircleCheckBig, CircleOff, MapPin } from "lucide-react";
import { useState } from "react";

const initialZones: TZone[] = [
  {
    _id: "65a1f1b2c3d4e5f6a7b8c901",
    zoneId: "Z-LIS-001",
    district: "Lisboa",
    zoneName: "Lisbon City Center",
    boundary: {
      _id: "b-001",
      type: "Polygon",
      coordinates: [
        [
          [-9.15, 38.71],
          [-9.13, 38.71],
          [-9.13, 38.73],
          [-9.15, 38.73],
          [-9.15, 38.71],
        ],
      ],
    },
    isOperational: true,
    minDeliveryFee: 2.5,
    maxDeliveryDistanceKm: 8,
    isDeleted: false,
    createdAt: new Date("2024-01-01T10:00:00Z"),
    updatedAt: new Date("2024-01-15T12:30:00Z"),
  },
  {
    _id: "65a1f1b2c3d4e5f6a7b8c902",
    zoneId: "Z-OPO-002",
    district: "Porto",
    zoneName: "Porto Riverside",
    boundary: {
      _id: "b-002",
      type: "Polygon",
      coordinates: [
        [
          [-8.63, 41.14],
          [-8.6, 41.14],
          [-8.6, 41.16],
          [-8.63, 41.16],
          [-8.63, 41.14],
        ],
      ],
    },
    isOperational: true,
    minDeliveryFee: 3.0,
    maxDeliveryDistanceKm: 6,
    isDeleted: false,
    createdAt: new Date("2024-01-02T09:00:00Z"),
    updatedAt: new Date("2024-01-02T09:00:00Z"),
  },
  {
    _id: "65a1f1b2c3d4e5f6a7b8c903",
    zoneId: "Z-FAO-003",
    district: "Faro",
    zoneName: "Algarve Coastal Hub",
    boundary: {
      _id: "b-003",
      type: "Polygon",
      coordinates: [
        [
          [-7.95, 37.01],
          [-7.91, 37.01],
          [-7.91, 37.04],
          [-7.95, 37.04],
          [-7.95, 37.01],
        ],
      ],
    },
    isOperational: true,
    minDeliveryFee: 4.5,
    maxDeliveryDistanceKm: 15,
    isDeleted: false,
    createdAt: new Date("2024-02-10T14:20:00Z"),
    updatedAt: new Date("2024-02-10T14:20:00Z"),
  },
  {
    _id: "65a1f1b2c3d4e5f6a7b8c904",
    zoneId: "Z-BRG-004",
    district: "Braga",
    zoneName: "Braga University District",
    boundary: {
      _id: "b-004",
      type: "Polygon",
      coordinates: [
        [
          [-8.41, 41.54],
          [-8.38, 41.54],
          [-8.38, 41.56],
          [-8.41, 41.56],
          [-8.41, 41.54],
        ],
      ],
    },
    isOperational: false,
    minDeliveryFee: 2.0,
    maxDeliveryDistanceKm: 5,
    isDeleted: false,
    createdAt: new Date("2024-03-05T08:45:00Z"),
    updatedAt: new Date("2024-03-12T11:00:00Z"),
  },
  {
    _id: "65a1f1b2c3d4e5f6a7b8c905",
    zoneId: "Z-COI-005",
    district: "Coimbra",
    zoneName: "Mondego Valley",
    boundary: {
      _id: "b-005",
      type: "Polygon",
      coordinates: [
        [
          [-8.44, 40.2],
          [-8.41, 40.2],
          [-8.41, 40.22],
          [-8.44, 40.22],
          [-8.44, 40.2],
        ],
      ],
    },
    isOperational: true,
    minDeliveryFee: 2.75,
    maxDeliveryDistanceKm: 10,
    isDeleted: false,
    createdAt: new Date("2024-04-20T16:00:00Z"),
    updatedAt: new Date("2024-04-20T16:00:00Z"),
  },
  {
    _id: "65a1f1b2c3d4e5f6a7b8c906",
    zoneId: "Z-SET-006",
    district: "Setúbal",
    zoneName: "Arrábida Industrial",
    boundary: {
      _id: "b-006",
      type: "Polygon",
      coordinates: [
        [
          [-8.9, 38.52],
          [-8.87, 38.52],
          [-8.87, 38.55],
          [-8.9, 38.55],
          [-8.9, 38.52],
        ],
      ],
    },
    isOperational: true,
    minDeliveryFee: 5.0,
    maxDeliveryDistanceKm: 20,
    isDeleted: true,
    createdAt: new Date("2023-11-15T09:00:00Z"),
    updatedAt: new Date("2024-01-05T15:30:00Z"),
  },
];

export default function VendorZones() {
  const [zones, setZones] = useState(initialZones);
  const handleDelete = (id: string) => {
    if (window.confirm("Delete this zone?")) {
      setZones(zones.filter((z) => z._id !== id));
    }
  };

  const operationalZones = zones.filter((z) => z.isOperational).length;
  const notOperationalZones = zones.filter((z) => z.isOperational).length;

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-brand-50/80 to-transparent -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {/* Header */}
        <TitleHeader
          title="Vendor Zones & Coverage"
          subtitle="Manage service areas for vendor operations"
        />

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatsCard
            title="Total Zones"
            value={zones.length}
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
          {zones.map((zone, index) => (
            <ZoneCard
              key={zone._id}
              name={zone.zoneName}
              district={zone.district}
              minDeliveryFee={zone.minDeliveryFee}
              isOperational={zone.isOperational}
              onEdit={() => console.log("Edit zone")}
              onDelete={() => handleDelete(zone._id)}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
