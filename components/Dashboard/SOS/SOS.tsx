"use client";

import { SOSCard } from "@/components/Dashboard/SOS/SOSCard";
import { SOSDetailModal } from "@/components/Dashboard/SOS/SOSDetailModal";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { USER_ROLE } from "@/consts/user.const";
import { useSOSSocket } from "@/hooks/use-sos-socket";
import { useTranslation } from "@/hooks/use-translation";
import { getAllSOSReq } from "@/services/dashboard/SOS/sos.service";
import { TMeta } from "@/types";
import { SOSType, TSOS, TSOSStats } from "@/types/sos.type";
import { motion } from "framer-motion";
import { Bike, ShoppingBag, Truck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface IProps {
  accessToken: string;
  SOSStats: TSOSStats;
}

export function SOS({ accessToken, SOSStats }: IProps) {
  const {t} = useTranslation();
  const router = useRouter();
  const [SOSData, setSOSData] = useState<{ data: TSOS[]; meta?: TMeta }>({
    data: [],
  });
  const [selectedSection, setSelectedSection] = useState<SOSType | null>(null);

  const handleCardClick = async (type: SOSType) => {
    await getSOSes({ role: type });
    setSelectedSection(type);
  };

  const handleCloseModal = () => {
    setSelectedSection(null);
  };

  const getSOSes = async ({ limit = 10, role = "VENDOR" }) => {
    const query = {
      limit,
      role,
    };

    const result = await getAllSOSReq(query);

    if (result?.success) {
      setSOSData({ data: result.data, meta: result.data.meta });
    } else {
      console.log("Server fetch error:", result);
    }
  };

  useSOSSocket({
    token: accessToken,
    onNewSOSAlert: async ({ message, data }) => {
      toast.info(message || "New SOS Alert");
      if (selectedSection === data.role) {
        await getSOSes({ limit: SOSData.meta?.limit, role: data.role });
      }
      router.refresh();
    },
  });

  return (
    <div className="min-h-screen w-full bg-gray-50 text-gray-900 font-sans">

      <main className="mx-auto">
        {/* Header Section */}
        <TitleHeader
          title={t("sos_alerts")}
          subtitle={t("monitor_and_resolve_critical_incidents")}
        />

        {/* Stats Summary */}
        {/* <motion.div
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
        </motion.div> */}

        {/* Main Cards Grid */}
        <motion.div
          variants={{
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
          }}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-8 md:grid-cols-3"
        >
          <SOSCard
            title={t("vendor_sos")}
            description={t("critical_issues_reported_by_restaurants")}
            icon={ShoppingBag}
            count={SOSStats.Vendor}
            onClick={() => handleCardClick(USER_ROLE.VENDOR)}
          />

          <SOSCard
            title={t("fleet_manager_sos")}
            description={t("operational_emergencies_from_logistics_hubs")}
            icon={Truck}
            count={SOSStats.FleetManager}
            onClick={() => handleCardClick(USER_ROLE.FLEET_MANAGER)}
          />

          <SOSCard
            title={t("delivery_partner_sos")}
            description={t("urgent_safety_alerts_from_riders_on_the_road")}
            icon={Bike}
            count={SOSStats.DeliveryPartner}
            onClick={() => handleCardClick(USER_ROLE.DELIVERY_PARTNER)}
          />
        </motion.div>
      </main>

      {/* Detail Modal */}
      <SOSDetailModal
        isOpen={!!selectedSection}
        onClose={handleCloseModal}
        sectionType={selectedSection}
        SOSData={SOSData}
        getSOSes={getSOSes}
      />
    </div>
  );
}
