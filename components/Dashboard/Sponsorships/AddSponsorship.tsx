"use client";

import ImageUpload from "@/components/Dashboard/Sponsorships/ImageUpload";
import SettingsCard from "@/components/GlobalSettings/SettingsCard";
import SettingsInput from "@/components/GlobalSettings/SettingsInput";
import SettingsToggle from "@/components/GlobalSettings/SettingsToggle";
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
import { cn } from "@/lib/utils";
import { TResponse } from "@/types";
import { TSponsorship } from "@/types/sponsorship.type";
import { catchAsync } from "@/utils/catchAsync";
import { getCookie } from "@/utils/cookies";
import { postData } from "@/utils/requests";
import { sponsorshipValidation } from "@/validations/sponsorship/sponsorship.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

type TSponsorshipForm = z.infer<typeof sponsorshipValidation>;

export default function AddSponsorship() {
  const form = useForm<TSponsorshipForm>({
    resolver: zodResolver(sponsorshipValidation),
    defaultValues: {
      sponsorName: "",
      sponsorType: "Ads",
      startDate: new Date(),
      endDate: new Date(),
      isActive: true,
      sponsorBanner: { file: null, url: "" },
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sponsorBannerPreview, setSponsorBannerPreview] = useState<
    string | undefined
  >(undefined);

  const onSubmit = async (data: TSponsorshipForm) => {
    setIsSubmitting(true);
    const toastId = toast.loading("Adding Sponsorship...");

    const payload = {
      sponsorName: data.sponsorName,
      sponsorType: data.sponsorType,
      startDate: format(data.startDate, "yyyy-MM-dd"),
      endDate: format(data.endDate, "yyyy-MM-dd"),
      isActive: data.isActive,
    };

    const formData = new FormData();
    formData.append("data", JSON.stringify(payload));

    if (data.sponsorBanner?.file)
      formData.append("file", data.sponsorBanner.file as Blob);

    const result = await catchAsync<TSponsorship>(async () => {
      return (await postData("/sponsorships/create-sponsorship", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${getCookie("accessToken")}`,
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
      return;
    }

    toast.error(result.message || "Failed to add Sponsorship", { id: toastId });
    console.log(result);
    setIsSubmitting(false);
  };

  return (
    <div className="p-6">
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
                      label="Sponsor Name"
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
                        Sponsor Type
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
                          <SelectValue placeholder="Select a type" />
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

            <FormField
              control={form.control}
              name="startDate"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormControl>
                    <SettingsInput
                      fieldState={fieldState}
                      type="date"
                      label="Start Date"
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
                      label="End Date"
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
              name="sponsorBanner"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormControl>
                    <ImageUpload
                      value={sponsorBannerPreview}
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
                        label="Active Status"
                        description="Immediately publish this sponsorship"
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
                  Create Sponsorship
                </>
              )}
            </motion.button>
          </form>
        </Form>
      </SettingsCard>
    </div>
  );
}
