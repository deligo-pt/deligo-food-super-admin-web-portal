"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ChefHat,
  Cookie,
  Frown,
  IceCream,
  Milk,
  Pizza,
  RefreshCw,
  Utensils,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function GlobalError() {
  const router = useRouter();

  const floatingItems = [
    { Icon: Pizza, x: "12%", y: "18%", size: 50, delay: 0, rotate: 10 },
    { Icon: IceCream, x: "82%", y: "22%", size: 44, delay: 0.8, rotate: -15 },
    { Icon: Cookie, x: "18%", y: "70%", size: 48, delay: 1.4, rotate: 20 },
    { Icon: Milk, x: "78%", y: "68%", size: 42, delay: 2, rotate: -20 },
    { Icon: Utensils, x: "50%", y: "10%", size: 38, delay: 1.2, rotate: 25 },
  ];

  return (
    <div className="relative min-h-screen w-full bg-white flex flex-col items-center justify-center overflow-hidden p-6">
      {/* Soft Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] left-[10%] w-[40%] h-[40%] bg-[#DC3173]/20 blur-3xl rounded-full" />
        <div className="absolute bottom-[0%] right-[10%] w-[50%] h-[50%] bg-[#DC3173]/15 blur-3xl rounded-full" />
      </div>

      {/* Floating Food Icons */}
      {floatingItems.map((item, i) => (
        <motion.div
          key={i}
          className="absolute text-[#DC3173]/60 pointer-events-none"
          style={{ left: item.x, top: item.y }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: [0, -18, 0],
            rotate: [
              item.rotate,
              item.rotate + 12,
              item.rotate - 12,
              item.rotate,
            ],
          }}
          transition={{
            opacity: { duration: 0.6, delay: item.delay },
            scale: { duration: 0.6, delay: item.delay },
            y: {
              duration: 4,
              repeat: Infinity,
              delay: item.delay,
              ease: "easeInOut",
            },
            rotate: {
              duration: 6,
              repeat: Infinity,
              delay: item.delay,
              ease: "easeInOut",
            },
          }}
        >
          <item.Icon size={item.size} />
        </motion.div>
      ))}

      {/* Main Error Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-lg w-full bg-white/80 backdrop-blur-xl shadow-xl rounded-3xl p-10 border border-[#DC3173]/20"
      >
        <motion.div
          initial={{ rotate: -10, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 140, delay: 0.3 }}
          className="mx-auto w-fit text-[#DC3173]"
        >
          <AlertTriangle size={70} className="drop-shadow-xl" />
        </motion.div>

        <h1 className="text-4xl font-extrabold text-center mt-6 text-gray-900">
          Something Went Wrong
        </h1>

        <p className="text-gray-600 text-center mt-4 leading-relaxed text-lg">
          Looks like our app ran into an unexpected issue
        </p>
        <p className="text-gray-600 text-center leading-relaxed text-lg">
          🍳 We’re working hard to get things working again!
        </p>

        {/* Chef Animated Icon */}
        <motion.div
          className="mx-auto mt-6 w-fit text-[#DC3173]"
          animate={{ rotate: [-10, 10, -10] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        >
          <ChefHat size={48} />
        </motion.div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
          <Button
            onClick={() => router.refresh()}
            variant="default"
            className="bg-[#DC3173] hover:bg-[#bb1f61] text-white px-8 py-6 rounded-full text-lg font-semibold shadow-lg"
          >
            <RefreshCw size={20} className="mr-2" /> Retry
          </Button>

          <Button
            onClick={() => router.push("/")}
            variant="outline"
            className="border-[#DC3173] text-[#DC3173] hover:bg-[#DC3173]/10 px-8 py-6 rounded-full text-lg font-semibold"
          >
            <Frown size={20} className="mr-2" /> Back Home
          </Button>
        </div>
      </motion.div>

      {/* Bottom Accent Bar */}
      <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-[#DC3173] via-[#ff5fa0] to-[#DC3173] opacity-60" />
    </div>
  );
}
