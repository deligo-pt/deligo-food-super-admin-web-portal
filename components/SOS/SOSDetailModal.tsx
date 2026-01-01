"use client";

import { SOSItem, SOSType } from "@/types/sos.type";
import { AnimatePresence, motion, Variants } from "framer-motion";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  ShieldAlert,
  X,
} from "lucide-react";

interface IProps {
  isOpen: boolean;
  onClose: () => void;
  sectionType: SOSType | null;
  emergencies: SOSItem[];
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
  emergencies,
}: IProps) {
  if (!isOpen || !sectionType) return null;

  const getTitle = (type: SOSType) => {
    switch (type) {
      case "vendor":
        return "Vendor Emergencies";
      case "fleet":
        return "Fleet Operations Issues";
      case "partner":
        return "Delivery Partner Alerts";
      default:
        return "Emergency Details";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-[#DC3173] text-white";
      case "high":
        return "bg-orange-500 text-white";
      case "medium":
        return "bg-yellow-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return date.toLocaleDateString();
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
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none">
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
                      {emergencies.length} active alerts
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
                  {emergencies.map((emergency) => (
                    <motion.div
                      key={emergency.id}
                      variants={itemVariants}
                      className="group overflow-hidden rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-[#DC3173]/20"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-2">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${getPriorityColor(
                                emergency.priority
                              )}`}
                            >
                              {emergency.priority}
                            </span>
                            <div className="flex items-center gap-1 text-xs font-medium text-gray-500">
                              <Clock size={12} />
                              <span>{formatTime(emergency.timestamp)}</span>
                            </div>
                          </div>

                          <h3 className="mb-1 text-lg font-bold text-gray-900">
                            {emergency.title}
                          </h3>
                          <p className="mb-3 text-sm text-gray-600">
                            {emergency.description}
                          </p>

                          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1.5">
                              <MapPin size={14} className="text-[#DC3173]" />
                              <span>{emergency.location}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Phone size={14} className="text-[#DC3173]" />
                              <span>
                                {emergency.contactName} •{" "}
                                {emergency.contactPhone}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex shrink-0 flex-row gap-2 sm:flex-col">
                          <button
                            onClick={() => console.log("Resolve", emergency.id)}
                            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#DC3173] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#b0275c]"
                          >
                            <CheckCircle size={16} />
                            Resolve
                          </button>
                          <button
                            onClick={() =>
                              console.log("Escalate", emergency.id)
                            }
                            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 hover:text-[#DC3173] hover:border-[#DC3173]/30"
                          >
                            <AlertCircle size={16} />
                            Escalate
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {emergencies.length === 0 && (
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
