"use client";

import { TPopularCategory } from "@/types/analytics.type";
import { motion } from "framer-motion";

const colors = ["#DC3173", "#3B82F6", "#F59E0B", "#10B981", "#5F3DC4"];

interface IProps {
  popularCategories: TPopularCategory[];
}

const PopularCategories = ({ popularCategories }: IProps) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-100 h-full">
      <h3 className="text-lg font-semibold mb-4">Popular Categories</h3>
      <div className="space-y-4">
        {popularCategories.length === 0 && (
          <div className="col-span-4 text-center text-gray-500">
            No popular categories found
          </div>
        )}
        {popularCategories.map((category, index) => (
          <div key={index}>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">{category.name}</span>
              <span className="text-sm font-medium">
                {category.percentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="h-2 rounded-full"
                style={{
                  backgroundColor: colors[index % 5],
                }}
                initial={{
                  width: 0,
                }}
                animate={{
                  width: `${Math.min(category.percentage, 100)}%`,
                }}
                transition={{
                  duration: 1,
                  delay: 0.2 + index * 0.1,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default PopularCategories;
