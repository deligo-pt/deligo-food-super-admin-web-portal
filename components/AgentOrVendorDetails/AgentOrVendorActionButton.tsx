"use client";

import { motion } from "framer-motion";

type TProps = {
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
  variant: "primary" | "danger" | "warning" | "success";
};
export default function ActionButton({
  onClick,
  label,
  icon,
  variant,
}: TProps) {
  const baseClasses =
    "flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-300 hover:scale-105";
  const variantClasses = {
    primary: "bg-[#DC3173] text-white hover:bg-[#c81d61]",
    danger: "bg-red-500 text-white hover:bg-red-600",
    warning: "bg-amber-500 text-white hover:bg-amber-600",
    success: "bg-green-500 text-white hover:bg-green-600",
  };
  return (
    <motion.button
      className={`${baseClasses} ${variantClasses[variant]}`}
      onClick={onClick}
      whileHover={{
        scale: 1.05,
      }}
      whileTap={{
        scale: 0.95,
      }}
    >
      {icon}
      <span>{label}</span>
    </motion.button>
  );
}
