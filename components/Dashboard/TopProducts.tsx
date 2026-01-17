"use client";

import { useTranslation } from "@/hooks/use-translation";
import { TTopRatedItems } from "@/types/analytics.type";
import { motion } from "framer-motion";
import { StarIcon } from "lucide-react";
import Image from "next/image";

interface IProps {
  topRatedItems: TTopRatedItems[];
}

const TopProducts = ({ topRatedItems }: IProps) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
      <h3 className="text-lg font-semibold mb-4">{t("top_rated_items")}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {topRatedItems.length === 0 && (
          <div className="col-span-4 text-center text-gray-500">
            {t("no_top_rated_items_found")}
          </div>
        )}
        {topRatedItems.map((item, index) => (
          <motion.div
            key={item._id}
            className="bg-gray-50 rounded-lg overflow-hidden"
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
              boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
            }}
          >
            <div className="h-32 w-full overflow-hidden">
              <Image
                src={item.images?.[0] || ""}
                alt={item.name}
                className="w-full h-full object-cover"
                width={500}
                height={500}
              />
            </div>
            <div className="p-4">
              <h4 className="font-medium">{item.name}</h4>
              <div className="flex justify-between items-center mt-2">
                <div className="flex items-center">
                  <StarIcon
                    size={16}
                    className="text-amber-400 mr-1"
                    fill="currentColor"
                  />
                  <span className="text-sm">{item.rating?.average}</span>
                </div>
                <span className="text-sm text-gray-600">
                  {item.totalOrders || 0} {t("orders")}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
export default TopProducts;
