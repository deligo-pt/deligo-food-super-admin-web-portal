"use client";

import { motion } from "framer-motion";
import { Trash2Icon } from "lucide-react";
import { useState } from "react";

interface IProps {
  onConfirm: () => void;
  label?: string;
  size?: "sm" | "xs";
}

export default function VariationDeleteButton({
  onConfirm,
  label = "Delete",
  size = "sm",
}: IProps) {
  const [confirming, setConfirming] = useState(false);
  if (confirming) {
    return (
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.9,
        }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        className="inline-flex items-center gap-1"
      >
        <button
          onClick={() => {
            onConfirm();
            setConfirming(false);
          }}
          className={`${size === "xs" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-xs"} bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition-colors`}
        >
          Confirm
        </button>
        <button
          onClick={() => setConfirming(false)}
          className={`${size === "xs" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-xs"} bg-gray-100 text-gray-600 rounded-lg font-medium hover:bg-gray-200 transition-colors`}
        >
          Cancel
        </button>
      </motion.div>
    );
  }
  return (
    <button
      onClick={() => setConfirming(true)}
      className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
      title={label}
    >
      <Trash2Icon size={size === "xs" ? 13 : 15} />
    </button>
  );
}
