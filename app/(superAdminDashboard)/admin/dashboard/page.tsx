"use client";

import { motion } from "framer-motion";
import { EuroIcon, ShoppingBag, Truck, Users } from "lucide-react";

export default function DashboardPage() {
  const stats = [
    { id: 1, name: "Total Orders", value: "1,240", icon: ShoppingBag },
    { id: 2, name: "Total Revenue", value: "€18,450", icon: EuroIcon },
    { id: 3, name: "Active Deliveries", value: "27", icon: Truck },
    { id: 4, name: "Total Customers", value: "630", icon: Users },
  ];

  const recentOrders = [
    {
      id: "ORD-1023",
      customer: "John Doe",
      amount: "€120",
      status: "Delivered",
    },
    {
      id: "ORD-1024",
      customer: "Sara Khan",
      amount: "€89",
      status: "In Transit",
    },
    {
      id: "ORD-1025",
      customer: "Luis Silva",
      amount: "€245",
      status: "Pending",
    },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Page Title */}
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl md:text-3xl font-semibold text-gray-800"
      >
        Dashboard Overview
      </motion.h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center justify-between bg-white shadow-md rounded-2xl p-4 hover:shadow-lg transition-all"
            >
              <div>
                <p className="text-gray-500 text-sm">{item.name}</p>
                <h3 className="text-xl font-semibold mt-1">{item.value}</h3>
              </div>
              <div className="bg-indigo-100 p-3 rounded-xl">
                <Icon className="text-indigo-600" size={22} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-md rounded-2xl p-4 md:p-6"
      >
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Recent Orders
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-600">
                <th className="p-3">Order ID</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b hover:bg-gray-50 transition-all"
                >
                  <td className="p-3 font-medium">{order.id}</td>
                  <td className="p-3">{order.customer}</td>
                  <td className="p-3">{order.amount}</td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.status === "Delivered"
                          ? "bg-green-100 text-green-700"
                          : order.status === "In Transit"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Placeholder for Chart Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-md rounded-2xl p-6 text-center text-gray-400"
      >
        📊 Chart section coming soon...
      </motion.div>
    </div>
  );
}
