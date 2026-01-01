"use client";

import { SOSCard } from "@/components/SOS/SOSCard";
import { SOSDetailModal } from "@/components/SOS/SOSDetailModal";
import { SOSItem, SOSType } from "@/types/sos.type";
import { motion, Variants } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  Bike,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { useState } from "react";

// Mock Data
const MOCK_EMERGENCIES: SOSItem[] = [
  // Vendor Issues
  {
    id: "v1",
    type: "vendor",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    status: "active",
    priority: "critical",
    title: "Kitchen Fire Reported",
    description:
      "Main kitchen fire alarm triggered. Fire department notified. Order fulfillment halted.",
    location: "Burger King, Downtown Branch",
    contactName: "John Smith (Manager)",
    contactPhone: "+1 (555) 123-4567",
  },
  {
    id: "v2",
    type: "vendor",
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    status: "active",
    priority: "high",
    title: "POS System Failure",
    description:
      "Central order management system offline. Unable to receive new orders.",
    location: "Pizza Hut, Westside",
    contactName: "Sarah Connor",
    contactPhone: "+1 (555) 987-6543",
  },
  {
    id: "v3",
    type: "vendor",
    timestamp: new Date(Date.now() - 1000 * 60 * 120),
    status: "in-progress",
    priority: "medium",
    title: "Critical Ingredient Shortage",
    description:
      "Ran out of pizza dough. Need emergency supply or temporary menu update.",
    location: "Dominos, North Ave",
    contactName: "Mike Ross",
    contactPhone: "+1 (555) 456-7890",
  },
  // Fleet Issues
  {
    id: "f1",
    type: "fleet",
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    status: "active",
    priority: "high",
    title: "Vehicle Breakdown - Van 402",
    description:
      "Delivery van broke down on highway with 50+ active orders. Tow truck needed.",
    location: "I-95 South, Exit 42",
    contactName: "Driver: Tom Hardy",
    contactPhone: "+1 (555) 222-3333",
  },
  // Partner Issues
  {
    id: "p1",
    type: "partner",
    timestamp: new Date(Date.now() - 1000 * 60 * 2),
    status: "active",
    priority: "critical",
    title: "Rider Accident",
    description:
      "Rider involved in collision. Ambulance called. Order #12345 damaged.",
    location: "5th Avenue & Main St",
    contactName: "Rider: Peter Parker",
    contactPhone: "+1 (555) 777-8888",
  },
  {
    id: "p2",
    type: "partner",
    timestamp: new Date(Date.now() - 1000 * 60 * 10),
    status: "active",
    priority: "high",
    title: "Harassment Report",
    description:
      "Rider reported aggressive behavior from customer at delivery point.",
    location: "123 Oak Lane, Apt 4B",
    contactName: "Rider: Mary Jane",
    contactPhone: "+1 (555) 999-0000",
  },
  {
    id: "p3",
    type: "partner",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    status: "active",
    priority: "high",
    title: "Bike Stolen",
    description:
      "Rider bike stolen while picking up order. Police report filed.",
    location: "Starbucks, Central Park",
    contactName: "Rider: Bruce Wayne",
    contactPhone: "+1 (555) 111-2222",
  },
  {
    id: "p4",
    type: "partner",
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    status: "in-progress",
    priority: "medium",
    title: "Severe Weather Alert",
    description:
      "Heavy rain causing flooding in Zone 4. Riders requesting pause.",
    location: "Zone 4 (Eastside)",
    contactName: "Zone Lead: Clark Kent",
    contactPhone: "+1 (555) 333-4444",
  },
  {
    id: "p5",
    type: "partner",
    timestamp: new Date(Date.now() - 1000 * 60 * 90),
    status: "in-progress",
    priority: "medium",
    title: "Medical Emergency",
    description:
      "Rider feeling dizzy/faint due to heat. Resting at safe location.",
    location: "Central Park West",
    contactName: "Rider: Barry Allen",
    contactPhone: "+1 (555) 555-6666",
  },
];

const containerVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const headerVariants = {
  hidden: {
    opacity: 0,
    y: -20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

export function SOS() {
  const [selectedSection, setSelectedSection] = useState<SOSType | null>(null);

  const handleCardClick = (type: SOSType) => {
    setSelectedSection(type);
  };

  const handleCloseModal = () => {
    setSelectedSection(null);
  };

  const filteredEmergencies = selectedSection
    ? MOCK_EMERGENCIES.filter((item) => item.type === selectedSection)
    : [];

  // Calculate counts dynamically
  const vendorCount = MOCK_EMERGENCIES.filter(
    (i) => i.type === "vendor" && i.status !== "resolved"
  ).length;
  const fleetCount = MOCK_EMERGENCIES.filter(
    (i) => i.type === "fleet" && i.status !== "resolved"
  ).length;
  const partnerCount = MOCK_EMERGENCIES.filter(
    (i) => i.type === "partner" && i.status !== "resolved"
  ).length;

  const totalActive = vendorCount + fleetCount + partnerCount;

  return (
    <div className="min-h-screen w-full bg-gray-50 text-gray-900 font-sans">
      {/* Top Accent Bar */}
      <div className="h-2 w-full bg-[#DC3173]" />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header Section */}
        <motion.div
          variants={headerVariants as Variants}
          initial="hidden"
          animate="visible"
          className="mb-16 flex flex-col items-center text-center md:items-start md:text-left"
        >
          <div className="mb-4 flex items-center gap-3 rounded-full bg-[#DC3173]/10 px-4 py-1.5 text-sm font-semibold text-[#DC3173]">
            <Activity size={16} className="animate-pulse" />
            <span>Live Emergency Dashboard</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
            SOS <span className="text-[#DC3173]">Response</span> Center
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-gray-600">
            Monitor and resolve critical incidents across the delivery network
            in real-time. Prioritize high-impact alerts from vendors, fleet
            managers, and delivery partners.
          </p>
        </motion.div>

        {/* Stats Summary */}
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
          className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
              <AlertTriangle size={20} />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">
                Total Active Incidents
              </p>
              <p className="text-xl font-bold text-gray-900">{totalActive}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
              <Activity size={20} />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">System Status</p>
              <p className="text-xl font-bold text-gray-900">Operational</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <Truck size={20} />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Fleet Active</p>
              <p className="text-xl font-bold text-gray-900">1,240</p>
            </div>
          </div>
        </motion.div>

        {/* Main Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-8 md:grid-cols-3"
        >
          <SOSCard
            title="Vendor SOS"
            description="Critical issues reported by restaurants and merchants. Includes kitchen fires, stock outages, or device failures."
            icon={ShoppingBag}
            count={vendorCount}
            buttonText="Manage Vendors"
            sectionType="vendor"
            onClick={handleCardClick}
          />

          <SOSCard
            title="Fleet Manager SOS"
            description="Operational emergencies from logistics hubs. Vehicle breakdowns, accident reports, and route blockages."
            icon={Truck}
            count={fleetCount}
            buttonText="View Logistics"
            sectionType="fleet"
            onClick={handleCardClick}
          />

          <SOSCard
            title="Delivery Partner SOS"
            description="Urgent safety alerts from riders on the road. Medical emergencies, harassment, or severe weather conditions."
            icon={Bike}
            count={partnerCount}
            buttonText="Assist Riders"
            sectionType="partner"
            onClick={handleCardClick}
          />
        </motion.div>
      </main>

      {/* Detail Modal */}
      <SOSDetailModal
        isOpen={!!selectedSection}
        onClose={handleCloseModal}
        sectionType={selectedSection}
        emergencies={filteredEmergencies}
      />
    </div>
  );
}
