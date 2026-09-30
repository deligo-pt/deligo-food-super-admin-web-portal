"use client";

import SettingsCard from "@/components/Dashboard/Settings/GlobalSettings/SettingsCard";
import SettingsInput from "@/components/Dashboard/Settings/GlobalSettings/SettingsInput";
import SettingsToggle from "@/components/Dashboard/Settings/GlobalSettings/SettingsToggle";
import ImageUpload from "@/components/Dashboard/Sponsorships/ImageUpload";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";
import { TResponse } from "@/types";
import { TSponsorship } from "@/types/sponsorship.type";
import { IZone } from "@/types/zone.type";
import { catchAsync } from "@/utils/catchAsync";
import { postData } from "@/utils/requests";
import { sponsorshipValidation } from "@/validations/sponsorship/sponsorship.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

type TSponsorshipForm = z.infer<typeof sponsorshipValidation>;

export default function AddSponsorship({ zones }: { zones: IZone[] }) {
  const { t } = useTranslation();
  const router = useRouter();

  const form = useForm<TSponsorshipForm>({
    resolver: zodResolver(sponsorshipValidation),
    defaultValues: {
      sponsorName: "",
      sponsorType: "Ads",
      startDate: new Date(),
      endDate: new Date(),
      isActive: true,
      sponsorBanner: { file: null, url: "" },
      url: "",
      targetZoneIds: [],
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sponsorBannerPreview, setSponsorBannerPreview] = useState<
    string | undefined
  >(undefined);
  const [isOpen, setIsOpen] = useState(false);

  const onSubmit = async (data: TSponsorshipForm) => {
    setIsSubmitting(true);
    const toastId = toast.loading("Adding Sponsorship...");

    const payload = {
      sponsorName: data.sponsorName,
      sponsorType: data.sponsorType,
      startDate: format(data.startDate, "yyyy-MM-dd"),
      endDate: format(data.endDate, "yyyy-MM-dd"),
      isActive: data.isActive,
      ...(data.url && { url: data.url }),
      ...(data.targetZoneIds &&
        data.targetZoneIds.length > 0 && {
        targetZoneIds: data.targetZoneIds,
      }),
    };

    const formData = new FormData();
    formData.append("data", JSON.stringify(payload));

    if (data.sponsorBanner?.file)
      formData.append("file", data.sponsorBanner.file as Blob);

    const result = await catchAsync<TSponsorship>(async () => {
      return (await postData("/sponsorships/create-sponsorship", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })) as unknown as Promise<TResponse<TSponsorship>>;
    });

    if (result.success) {
      toast.success(result.message || "Sponsorship added successfully!", {
        id: toastId,
      });
      form.reset();
      setSponsorBannerPreview(undefined);
      setIsSubmitting(false);
      router.push('/admin/sponsorships');
      return;
    }

    toast.error(result.message || "Failed to add Sponsorship", { id: toastId });
    console.log(result);
    setIsSubmitting(false);
  };

  return (
    <div className="">
      {/* Header */}
      <TitleHeader
        title={t("add_sponsorship")}
        subtitle={t("add_banner_ads_and_sponsored_content")}
      />

      {/* Add Form */}
      <SettingsCard
        title={t("add_sponsorship")}
        description={t("create_a_new_banner_campaign")}
        icon={Plus}
        className="sticky top-8"
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="sponsorName"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormControl>
                    <SettingsInput
                      fieldState={fieldState}
                      label={t("sponsor_name")}
                      placeholder="e.g. ABC Group"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sponsorType"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormControl>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        {t("sponsor_type")}
                      </label>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger
                          style={{ height: "44px" }}
                          className={cn(
                            "w-full rounded-xl border-0 bg-gray-50 px-4 py-2.5 text-gray-900 shadow-sm transition-all duration-200 placeholder:text-gray-400 focus:border-[#DC3173] focus:bg-white focus:ring-2 focus:ring-[#DC3173]/20 sm:text-sm sm:leading-6",
                            fieldState.invalid && "border-destructive",
                          )}
                        >
                          <SelectValue placeholder={t("select_a_type")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Ads">Ads</SelectItem>
                          <SelectItem value="Offer">Offer</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Target Zones Multi-Select with Badges */}
            <FormField
              control={form.control}
              name="targetZoneIds"
              render={({ field, fieldState }) => {

                const selectedZones = zones.filter((zone) =>
                  field.value?.includes(zone._id)
                );

                const toggleZone = (zoneId: string) => {
                  const current = field.value || [];
                  const updated = current.includes(zoneId)
                    ? current.filter((id) => id !== zoneId)
                    : [...current, zoneId];
                  field.onChange(updated);
                };

                return (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                          {t("target_zones")} <span className="text-gray-400 font-normal">(Optional)</span>
                        </label>
                        <div
                          onClick={() => setIsOpen(!isOpen)}
                          className={cn(
                            "w-full min-h-11 rounded-xl border-0 bg-gray-50 px-4 py-2.5 text-gray-900 shadow-sm transition-all duration-200 cursor-pointer flex flex-wrap items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[#DC3173]/20",
                            fieldState.invalid && "border border-destructive"
                          )}
                        >
                          {selectedZones.length > 0 ? (
                            selectedZones.map((zone) => (
                              <span
                                key={zone._id}
                                className="inline-flex items-center gap-1 bg-[#DC3173]/10 text-[#DC3173] text-xs font-medium px-2.5 py-1 rounded-lg"
                              >
                                {zone.zoneName}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleZone(zone._id);
                                  }}
                                  className="hover:text-destructive hover:bg-[#DC3173]/20 rounded-full p-0.5"
                                >
                                  ×
                                </button>
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400 text-sm">
                              {t("select_target_zones") || "Select target zones..."}
                            </span>
                          )}
                        </div>

                        {isOpen && (
                          <div className="absolute z-50 mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-100 max-h-60 overflow-y-auto p-2">
                            {zones.length > 0 ? (
                              zones.map((zone) => {
                                const isSelected = field.value?.includes(zone._id);
                                return (
                                  <div
                                    key={zone._id}
                                    onClick={() => toggleZone(zone._id)}
                                    className={cn(
                                      "flex items-center my-1 justify-between px-3 py-2 rounded-lg cursor-pointer text-sm transition-colors",
                                      isSelected
                                        ? "bg-[#DC3173]/10 text-[#DC3173] font-medium"
                                        : "hover:bg-gray-50 text-gray-700"
                                    )}
                                  >
                                    <span>
                                      {zone.zoneName} ({zone.district})
                                    </span>
                                    {isSelected && (
                                      <span className="text-xs font-bold">✓</span>
                                    )}
                                  </div>
                                );
                              })
                            ) : (
                              <div className="p-3 text-center text-sm text-gray-400">
                                {t("no_zones_available") || "No zones available"}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="startDate"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormControl>
                    <SettingsInput
                      fieldState={fieldState}
                      type="date"
                      label={t("start_date")}
                      value={format(field.value, "yyyy-MM-dd")}
                      onChange={(e) => field.onChange(new Date(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormControl>
                    <SettingsInput
                      fieldState={fieldState}
                      type="date"
                      label={t("end_date")}
                      value={format(field.value, "yyyy-MM-dd")}
                      onChange={(e) => field.onChange(new Date(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="url"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormControl>
                    <SettingsInput
                      fieldState={fieldState}
                      label={t("sponsor_url")}
                      placeholder="e.g. https://example.com"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sponsorBanner"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormControl>
                    <ImageUpload
                      value={sponsorBannerPreview}
                      label={t("banner_image")}
                      onChange={(file) => {
                        const url = file ? URL.createObjectURL(file) : "";
                        setSponsorBannerPreview(
                          file ? URL.createObjectURL(file) : undefined,
                        );
                        field.onChange({ file: file ? file : null, url });
                      }}
                      isInvalid={fieldState.invalid}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <SettingsToggle
                        label={t("active_status")}
                        description={t("immediately_publish_this_sponsorship")}
                        checked={field.value as boolean}
                        onChange={(val) => field.onChange(val)}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                  {t("create_sponsorship")}
                </>
              )}
            </motion.button>
          </form>
        </Form>
      </SettingsCard>
    </div>
  );
}