"use client";

import { TTopRatedDeliveryPartner } from "@/types/analytics.type";
import { motion } from "framer-motion";
import { BikeIcon, StarIcon } from "lucide-react";

interface IProps {
  partners: TTopRatedDeliveryPartner[];
}

export default function TopRatedDeliveryPartners({ partners }: IProps) {
  return (
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
        delay: 0.3,
      }}
      className="bg-white rounded-lg shadow p-6 border border-gray-100"
    >
      <h3 className="text-lg font-semibold mb-4">
        Top Rated Delivery Partners
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {partners?.map((partner, index) => (
          <motion.div
            key={partner?._id}
            className="bg-gray-50 rounded-lg overflow-hidden p-4 shadow-lg"
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
              delay: 0.1 * index,
            }}
            whileHover={{
              y: -5,
            }}
          >
            <div className="p-2">
              <div className="flex items-center gap-3">
                <div>
                  <div className="w-10 h-10 rounded-full flex justify-center items-center overflow-hidden bg-[#DC3173]/10 border-[#DC3173]/30">
                    <BikeIcon className="w-5 text-[#DC3173]" />
                  </div>
                </div>
                <div>
                  <h4 className="font-medium">
                    {partner?.name?.firstName} {partner?.name?.lastName}
                  </h4>
                  <p className="text-sm">{partner?.userId}</p>
                </div>
              </div>
              <div className="flex justify-between items-center mt-6">
                <div className="flex items-center">
                  <StarIcon
                    size={16}
                    className="text-amber-400 mr-1"
                    fill="currentColor"
                  />
                  <span className="text-sm">{partner?.rating}</span>
                </div>
                <span className="text-sm text-gray-600">
                  {partner?.completedDeliveries || 0} Deliveries
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
