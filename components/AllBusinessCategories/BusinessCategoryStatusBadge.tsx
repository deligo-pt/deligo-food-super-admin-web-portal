import { motion } from "framer-motion";
import { BanIcon, CheckCircleIcon, XCircleIcon } from "lucide-react";

interface IProps {
  isActive: boolean;
  isDeleted: boolean;
}

export default function BusinessCategoryStatusBadge({
  isActive,
  isDeleted,
}: IProps) {
  return (
    <motion.button
      whileHover={{
        scale: 1,
      }}
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
        ${isDeleted ? "bg-red-100 text-red-800" : isActive ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
      `}
    >
      {isDeleted ? (
        <>
          <BanIcon size={14} />
          <span>Deleted</span>
        </>
      ) : isActive ? (
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
