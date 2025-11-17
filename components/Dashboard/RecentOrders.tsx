"use client";

import { motion } from "framer-motion";
import { CheckIcon, ClockIcon } from "lucide-react";

const orders = [
  {
    id: "#ORD-5412",
    customer: "Emma Wilson",
    status: "Delivered",
    time: "12m ago",
  },
  {
    id: "#ORD-5411",
    customer: "John Smith",
    status: "Preparing",
    time: "24m ago",
  },
  {
    id: "#ORD-5410",
    customer: "Sarah Davis",
    status: "Delivered",
    time: "45m ago",
  },
];

const RecentOrders = () => {
  const container = {
    hidden: {
      opacity: 0,
    },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };
  const item = {
    hidden: {
      opacity: 0,
      y: 10,
    },
    show: {
      opacity: 1,
      y: 0,
    },
  };
  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-100 h-full">
      <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
      <motion.div
        className="space-y-3"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {orders.map((order, index) => (
          <motion.div
            key={index}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            variants={item}
          >
            <div>
              <p className="font-medium text-sm">{order.id}</p>
              <p className="text-xs text-gray-500">{order.customer}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center">
                {order.status === "Delivered" ? (
                  <CheckIcon size={14} className="text-green-500 mr-1" />
                ) : (
                  <ClockIcon size={14} className="text-amber-500 mr-1" />
                )}
                <span
                  className={`text-xs ${
                    order.status === "Delivered"
                      ? "text-green-500"
                      : "text-amber-500"
                  }`}
                >
                  {order.status}
                </span>
              </div>
              <p className="text-xs text-gray-500">{order.time}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
      <button className="w-full mt-4 text-[#DC3173] text-sm font-medium hover:underline">
        View All Orders
      </button>
    </div>
  );
};
export default RecentOrders;
