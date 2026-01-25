import { motion } from "framer-motion";
import { ArrowRight, LucideIcon } from "lucide-react";
import { SOSBadge } from "./SOSBadge";

interface IProps {
  title: string;
  description: string;
  icon: LucideIcon;
  count: number;
  onClick: () => void;
}

export function SOSCard({
  title,
  description,
  icon: Icon,
  count,
  onClick,
}: IProps) {
  return (
    <motion.div
      variants={{
        hidden: {
          opacity: 0,
          y: 20,
        },
        visible: {
          opacity: 1,
          y: 0,
        },
      }}
      whileHover={{
        y: -8,
        boxShadow:
          "0 20px 25px -5px rgba(220, 49, 115, 0.15), 0 10px 10px -5px rgba(220, 49, 115, 0.1)",
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-6 shadow-md border border-gray-100 hover:border-[#DC3173]/30"
    >
      {/* Decorative background gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#DC3173]/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative z-10">
        <div className="mb-6 flex items-start justify-between">
          <div className="rounded-xl bg-[#DC3173]/10 p-3 text-[#DC3173]">
            <Icon size={32} strokeWidth={1.5} />
          </div>
          <SOSBadge count={count} />
        </div>

        <h3 className="mb-2 text-xl font-bold text-gray-900 group-hover:text-[#DC3173] transition-colors">
          {title}
        </h3>
        <p className="mb-8 text-sm text-gray-500 leading-relaxed">
          {description}
        </p>
      </div>

      <div className="relative z-10 mt-auto">
        <motion.button
          whileHover={{
            scale: 1.02,
          }}
          whileTap={{
            scale: 0.98,
          }}
          onClick={() => onClick()}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#DC3173] py-3 px-4 text-sm font-semibold text-white shadow-md transition-colors hover:bg-[#b0275c] focus:outline-none focus:ring-2 focus:ring-[#DC3173] focus:ring-offset-2"
        >
          View Alerts
          <ArrowRight size={16} />
        </motion.button>
      </div>
    </motion.div>
  );
}
