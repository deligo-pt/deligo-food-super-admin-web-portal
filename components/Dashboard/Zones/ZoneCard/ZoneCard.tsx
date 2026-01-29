"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Edit2, Euro, MapIcon, MapPin, Trash2 } from "lucide-react";

interface IProps {
  name: string;
  district: string;
  minDeliveryFee: number;
  isOperational: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  delay?: number;
}

export default function ZoneCard({
  name,
  district,
  minDeliveryFee,
  isOperational,
  onEdit,
  onDelete,
  delay = 0,
}: IProps) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.95,
      }}
      animate={{
        opacity: 1,
        scale: 1,
      }}
      transition={{
        duration: 0.3,
        delay,
      }}
      whileHover={{
        y: -4,
      }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-lg transition-all"
    >
      <div
        className="h-2"
        style={{
          backgroundColor: "#DC3173",
        }}
      />
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{
                backgroundColor: `#DC317320`,
              }}
            >
              <MapPin
                size={20}
                style={{
                  color: "#DC3173",
                }}
              />
            </div>
            <h3 className="font-bold text-gray-900 text-lg">{name}</h3>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${isOperational ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
          >
            {isOperational ? "Operational" : "Not Operational"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">District</p>
            <div className="flex items-center gap-1.5">
              <MapIcon size={16} className="text-[#DC3173]" />
              <p className="font-semibold text-gray-800">{district}</p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Minimum Delivery Fee</p>
            <div className="flex items-center gap-1.5">
              <Euro size={16} className="text-[#DC3173]" />
              <p className="font-semibold text-gray-800">
                {minDeliveryFee.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-1.5 font-medium text-[#DC3173] border-[#DC3173] hover:bg-[#DC3173] transition-colors cursor-pointer hover:text-white"
          >
            <Edit2 size={14} />
            Edit
          </Button>
          <Button
            variant="outline"
            onClick={onDelete}
            className="flex-1 flex items-center justify-center gap-1.5 font-medium text-destructive border-destructive hover:bg-destructive transition-colors cursor-pointer hover:text-white"
          >
            <Trash2 size={14} />
            Delete
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
