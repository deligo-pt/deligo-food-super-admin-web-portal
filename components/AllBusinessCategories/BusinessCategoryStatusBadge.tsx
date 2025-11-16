import { motion } from "framer-motion";
import { CheckCircleIcon, XCircleIcon } from "lucide-react";
interface StatusBadgeProps {
  isActive: boolean;
  onClick?: () => void;
}
export default function BusinessCategoryStatusBadge({
  isActive,
  onClick,
}: StatusBadgeProps) {
  return (
    <motion.button
      whileHover={{
        scale: onClick ? 1.05 : 1,
      }}
      whileTap={{
        scale: onClick ? 0.95 : 1,
      }}
      onClick={onClick}
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
        ${isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
        ${onClick ? "cursor-pointer" : "cursor-default"}
      `}
    >
      {isActive ? (
        <>
          <CheckCircleIcon size={14} />
          <span>Active</span>
        </>
      ) : (
        <>
          <XCircleIcon size={14} />
          <span>Inactive</span>
        </>
      )}
    </motion.button>
  );
}
