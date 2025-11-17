"use client";

import { motion } from "framer-motion";

const categories = [
  {
    name: "Fast Food",
    percentage: 42,
    color: "#DC3173",
  },
  {
    name: "Healthy Food",
    percentage: 28,
    color: "#3B82F6",
  },
  {
    name: "Desserts",
    percentage: 18,
    color: "#F59E0B",
  },
  {
    name: "Beverages",
    percentage: 12,
    color: "#10B981",
  },
];

const PopularCategories = () => {
  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-100 h-full">
      <h3 className="text-lg font-semibold mb-4">Popular Categories</h3>
      <div className="space-y-4">
        {categories.map((category, index) => (
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
                  backgroundColor: category.color,
                }}
                initial={{
                  width: 0,
                }}
                animate={{
                  width: `${category.percentage}%`,
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
