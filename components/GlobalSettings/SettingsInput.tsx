"use client";

import { HTMLMotionProps, motion } from "framer-motion";
import { ControllerFieldState } from "react-hook-form";

interface IProps extends HTMLMotionProps<"input"> {
  label: string;
  suffix?: string;
  error?: string;
  description?: string;
  fieldState?: ControllerFieldState;
}

export default function SettingsInput({
  label,
  suffix,
  error,
  description,
  className = "",
  fieldState,
  ...props
}: IProps) {
  return (
    <div className={`w-full ${className}`}>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label}
      </label>

      <div className="relative group">
        <motion.input
          whileFocus={{
            scale: 1.01,
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 25,
          }}
          className={`block w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-900 shadow-sm transition-all duration-200 placeholder:text-gray-400 focus:border-[#DC3173] focus:bg-white focus:ring-2 focus:ring-[#DC3173]/20 sm:text-sm sm:leading-6 ${
            error
              ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
              : "border-gray-200"
          } ${suffix ? "pr-12" : ""}`}
          {...props}
        />
        {suffix && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
            <span className="text-gray-500 sm:text-sm font-medium">
              {suffix}
            </span>
          </div>
        )}
      </div>

      {description && !fieldState?.invalid && (
        <p className="mt-1.5 text-xs text-gray-500">{description}</p>
      )}

      {/* {error && (
        <motion.p
          initial={{
            opacity: 0,
            y: -10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="mt-1.5 text-xs text-red-600 font-medium"
        >
          {error}
        </motion.p>
      )} */}
    </div>
  );
}
