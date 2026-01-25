"use client";

import SOSActions from "@/components/Dashboard/SOS/SOSActions";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TMeta } from "@/types";
import { SOSType, TSOS } from "@/types/sos.type";
import { format } from "date-fns";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { CheckCircle, Clock, ShieldAlert, User, X } from "lucide-react";

interface IProps {
  isOpen: boolean;
  onClose: () => void;
  sectionType: SOSType | null;
  SOSData: { data: TSOS[]; meta?: TMeta };
  getSOSes: ({ limit, role }: { limit: number; role: SOSType }) => void;
}

const backdropVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
  },
};

const modalVariants = {
  hidden: {
    y: "100%",
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 300,
    },
  },
  exit: {
    y: "100%",
    opacity: 0,
  },
};

const listVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    x: -20,
  },
  visible: {
    opacity: 1,
    x: 0,
  },
};

export function SOSDetailModal({
  isOpen,
  onClose,
  sectionType,
  SOSData,
  getSOSes,
}: IProps) {
  if (!isOpen || !sectionType) return null;

  const getTitle = (type: SOSType) => {
    switch (type) {
      case "VENDOR":
        return "Vendor Alerts";
      case "FLEET_MANAGER":
        return "Fleet Manager Alerts";
      case "DELIVERY_PARTNER":
        return "Delivery Partner Alerts";
      default:
        return "Emergency Details";
    }
  };

  const onStatusUpdateSuccess = () => {
    getSOSes({ limit: SOSData.meta?.limit || 10, role: sectionType });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-51 flex items-center justify-center p-4 sm:p-6 pointer-events-none">
            <motion.div
              variants={modalVariants as Variants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="pointer-events-auto flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DC3173]/10 text-[#DC3173]">
                    <ShieldAlert size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {getTitle(sectionType)}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {SOSData?.meta?.total} active alerts
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto bg-gray-50/30 p-6">
                <motion.div
                  variants={listVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-4"
                >
                  {SOSData?.data?.map((sos) => (
                    <motion.div
                      key={sos._id}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      className="group overflow-hidden rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-[#DC3173]/20"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-2">
                            <div className="flex items-center gap-1 text-xs font-medium text-gray-500">
                              <Clock size={12} />
                              <span>
                                {format(sos.createdAt, "h:mm a; dd MMM yyyy")}
                              </span>
                            </div>
                            <Badge
                              className={cn(
                                sos.status === "ACTIVE" && "bg-red-500",
                                sos.status === "INVESTIGATING" &&
                                  "bg-indigo-500",
                                sos.status === "RESOLVED" && "bg-[#DC3173]",
                                sos.status === "FALSE_ALARM" && "bg-yellow-500",
                              )}
                            >
                              {sos.status}
                            </Badge>
                          </div>

                          {/* <h3 className="mb-1 text-lg font-bold text-gray-900">
                            {sos.issueTags?.map((tag) => tag).join(", ")}
                          </h3> */}

                          <p className="mb-3 text-sm text-gray-600">
                            {sos.userNote}
                          </p>

                          <p className="mb-3 text-sm text-gray-600">
                            {sos.issueTags?.map((tag, i) => (
                              <Badge
                                key={i}
                                className="bg-[#DC3173]/20 text-[#DC3173]"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </p>

                          <div className="flex items-center gap-1.5 text-sm text-gray-500">
                            <User size={14} className="text-[#DC3173]" />
                            <span>
                              {sos.userId?.id?.name?.firstName}{" "}
                              {sos.userId?.id?.name?.lastName}
                            </span>
                          </div>

                          {/* <div className="h-52">
                            <LocationMap
                              lat={sos?.location?.coordinates?.[0]}
                              lng={sos?.location?.coordinates?.[1]}
                            />
                          </div> */}
                        </div>

                        <SOSActions
                          sosId={sos._id}
                          status={sos.status}
                          onStatusUpdateSuccess={onStatusUpdateSuccess}
                        />
                      </div>
                    </motion.div>
                  ))}

                  {SOSData?.meta?.total === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
                      <CheckCircle
                        size={48}
                        className="mb-4 text-green-500 opacity-50"
                      />
                      <p className="text-lg font-medium">
                        No active emergencies
                      </p>
                      <p className="text-sm">
                        All systems operational in this sector.
                      </p>
                    </div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
