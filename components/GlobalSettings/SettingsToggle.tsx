"use client";

import { motion } from "framer-motion";

interface IProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export default function SettingsToggle({
  label,
  description,
  checked,
  onChange,
  disabled = false,
}: IProps) {
  return (
    <div
      className={`flex items-center justify-between py-2 ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      <div className="flex-1 pr-4">
        <label
          className="text-sm font-semibold text-gray-900 block cursor-pointer"
          onClick={() => !disabled && onChange(!checked)}
        >
          {label}
        </label>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#DC3173] focus-visible:ring-offset-2 ${
          checked ? "bg-[#DC3173]" : "bg-gray-200"
        }`}
      >
        <span className="sr-only">Use setting</span>
        <motion.span
          layout
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
          className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
