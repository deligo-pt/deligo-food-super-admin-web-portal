"use client";

import { useTranslation } from "@/hooks/use-translation";
import { motion } from "framer-motion";
import { PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CategoriesTitle() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="bg-linear-to-r from-[#DC3173] to-[#FF6CAB] p-6 rounded-lg mb-6 shadow-lg">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              {t("business_categories")}
            </h1>
            <p className="text-pink-100 mt-1">
              {t("manage_all_business_categories")}
            </p>
          </div>
          <motion.button
            whileHover={{
              scale: 1.05,
            }}
            whileTap={{
              scale: 0.95,
            }}
            className="mt-4 md:mt-0 bg-white text-[#DC3173] px-4 py-2 rounded-md font-medium flex items-center shadow-md"
            onClick={() => router.push("/admin/business-categories/add")}
          >
            <PlusCircle className="mr-2 h-5 w-5" />
            {t("add_category")}
          </motion.button>
        </div>
      </div>
    </motion.h1>
  );
}
