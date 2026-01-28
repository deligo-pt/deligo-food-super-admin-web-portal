"use client";

import ImageUpload from "@/components/Dashboard/Sponsorships/ImageUpload";
import SettingsCard from "@/components/GlobalSettings/SettingsCard";
import SettingsInput from "@/components/GlobalSettings/SettingsInput";
import SettingsToggle from "@/components/GlobalSettings/SettingsToggle";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { FormEvent, useState } from "react";

export default function AddSponsorship() {
  const [formData, setFormData] = useState({
    name: "",
    banner: "",
    type: "",
    startDate: "",
    endDate: "",
    isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 800));

    setFormData({
      name: "",
      banner: "",
      type: "",
      startDate: "",
      endDate: "",
      isActive: true,
    });
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
      {/* Header */}
      <TitleHeader
        title="Add Sponsorship"
        subtitle="Add banner ads and sponsored content"
      />

      {/* Add Form */}
      <SettingsCard
        title="Add Sponsorship"
        description="Create a new banner campaign"
        icon={Plus}
        className="sticky top-8"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <SettingsInput
            label="Sponsor Name"
            placeholder="e.g. ABC Group"
            value={formData.name}
            onChange={(e) => {
              setFormData({
                ...formData,
                name: e.target.value,
              });
              if (errors.name)
                setErrors({
                  ...errors,
                  name: "",
                });
            }}
            error={errors.name}
          />

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Sponsor Type
            </label>
            <Select
              value={formData.type || ""}
              onValueChange={(val: "ADS" | "OFFER") => {
                setFormData({
                  ...formData,
                  type: val,
                });
                if (errors.type)
                  setErrors({
                    ...errors,
                    type: "",
                  });
              }}
            >
              <SelectTrigger
                style={{ height: "44px" }}
                className="w-full rounded-xl border-0 bg-gray-50 px-4 py-2.5 text-gray-900 shadow-sm transition-all duration-200 placeholder:text-gray-400 focus:border-[#DC3173] focus:bg-white focus:ring-2 focus:ring-[#DC3173]/20 sm:text-sm sm:leading-6"
              >
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADS">Ads</SelectItem>
                <SelectItem value="OFFER">Offer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <SettingsInput
            label="Start Date"
            type="date"
            value={formData.startDate}
            onChange={(e) =>
              setFormData({
                ...formData,
                startDate: e.target.value,
              })
            }
          />

          <SettingsInput
            label="End Date"
            type="date"
            value={formData.endDate}
            onChange={(e) =>
              setFormData({
                ...formData,
                endDate: e.target.value,
              })
            }
          />

          <ImageUpload
            value={formData.banner}
            onChange={(val) => {
              setFormData({
                ...formData,
                banner: val,
              });
              if (errors.bannerUrl)
                setErrors({
                  ...errors,
                  bannerUrl: "",
                });
            }}
            error={errors.bannerUrl}
          />

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
            <SettingsToggle
              label="Active Status"
              description="Immediately publish this sponsorship"
              checked={formData.isActive}
              onChange={(val) =>
                setFormData({
                  ...formData,
                  isActive: val,
                })
              }
            />
          </div>

          <motion.button
            whileHover={{
              scale: 1.02,
            }}
            whileTap={{
              scale: 0.98,
            }}
            disabled={isSubmitting}
            className={cn(
              "w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-[#DC3173] shadow-lg transition-all",
              isSubmitting ? "cursor-wait" : "hover:bg-[#DC3173]/90",
            )}
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Plus size={20} />
                Create Sponsorship
              </>
            )}
          </motion.button>
        </form>
      </SettingsCard>
    </div>
  );
}
