"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { LucideIcon, PlusIcon } from "lucide-react";
import { ReactNode } from "react";

interface IProps {
  title: string;
  subtitle?: string;
  buttonInfo?: {
    text: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  extraComponent?: ReactNode;
}

export default function TitleHeader({
  title,
  subtitle,
  buttonInfo,
  extraComponent,
}: IProps) {
  return (
    <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="bg-linear-to-r from-[#DC3173] to-[#FF6CAB] p-6 rounded-lg mb-6 shadow-lg">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              {title}
            </h1>
            {subtitle && <p className="text-pink-100 mt-1">{subtitle}</p>}
          </div>
          <div>
            {buttonInfo && (
              <Button
                className="bg-white text-[#DC3173] hover:bg-slate-100 hover:text-[#DC3173]/90 px-4 py-2 rounded-md font-medium flex items-center gap-2 cursor-pointer print:hidden"
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
