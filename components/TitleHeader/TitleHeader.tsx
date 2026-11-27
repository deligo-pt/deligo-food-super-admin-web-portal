"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeftIcon, LucideIcon, PlusIcon } from "lucide-react";
import { ReactNode } from "react";

interface IProps {
  title: string;
  subtitle?: string;
  buttonInfo?: {
    text: string;
    onClick: () => void;
    icon?: LucideIcon;
    disabled?: boolean;
  };
  extraComponent?: ReactNode;
  onBackClick?: () => void;
  /** A slim banner for list pages where the space belongs to the content. */
  compact?: boolean;
}

export default function TitleHeader({
  title,
  subtitle,
  buttonInfo,
  extraComponent,
  onBackClick,
  compact = false,
}: IProps) {
  return (
    <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
      <div className={`bg-linear-to-r from-[#DC3173] to-[#FF6CAB] rounded-lg shadow-lg ${compact ? "px-5 py-3 mb-3" : "p-6 mb-6"}`}>
        <div className={`flex flex-col lg:flex-row justify-between items-start lg:items-center ${compact ? "gap-2" : "gap-4"}`}>
          <div className="flex gap-3">
            {onBackClick && (
              <div>
                <Button
                  onClick={onBackClick}
                  className="w-8 h-8 flex justify-center items-center bg-white/30 hover:bg-white/20 rounded-full transition-colors mt-1"
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                </Button>
              </div>
            )}
            <div>
              <h1 className={`font-bold text-white ${compact ? "text-xl md:text-2xl" : "text-2xl md:text-3xl"}`}>
                {title}
              </h1>
              {subtitle && (
                <p className={compact ? "hidden text-sm text-pink-100 sm:block" : "text-pink-100 mt-1"}>{subtitle}</p>
              )}
            </div>
          </div>
          <div className="flex flex-row gap-2">
            {buttonInfo && (
              <Button
                className="bg-white text-[#DC3173] hover:bg-slate-100 hover:text-[#DC3173]/90 px-4 py-2 rounded-md font-medium flex items-center gap-2 cursor-pointer print:hidden"
                disabled={buttonInfo?.disabled ? buttonInfo?.disabled : false}
                onClick={buttonInfo.onClick}
              >
                {buttonInfo.icon ? (
                  <buttonInfo.icon className="h-5 w-5" />
                ) : (
                  <PlusIcon className="h-5 w-5" />
                )}
                {buttonInfo.text}
              </Button>
            )}
            {extraComponent ? extraComponent : null}
          </div>
        </div>
      </div>
    </motion.h1>
  );
}
