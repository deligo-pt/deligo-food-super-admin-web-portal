"use client";

import ImageUpload from "@/components/Dashboard/Sponsorships/ImageUpload";
import SettingsInput from "@/components/GlobalSettings/SettingsInput";
import SettingsToggle from "@/components/GlobalSettings/SettingsToggle";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { updateData } from "@/utils/requests";
import { sponsorshipValidation } from "@/validations/sponsorship/sponsorship.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

type TSponsorshipForm = z.infer<typeof sponsorshipValidation>;

interface IProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prevValues: TSponsorship;
}

export default function EditSponsorshipModal({
  open,
  onOpenChange,
  prevValues,
}: IProps) {
  const router = useRouter();
  const form = useForm<TSponsorshipForm>({
    resolver: zodResolver(sponsorshipValidation),
    defaultValues: {
      sponsorName: prevValues?.sponsorName || "",
      sponsorType: prevValues?.sponsorType || "Ads",
      startDate: new Date(prevValues?.startDate) || new Date(),
      endDate: new Date(prevValues?.endDate) || new Date(),
      isActive: prevValues?.isActive || true,
      sponsorBanner: { file: null, url: prevValues?.bannerImage || "" },
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sponsorBannerPreview, setSponsorBannerPreview] = useState<
    string | undefined
  >(prevValues?.bannerImage);

  const onSubmit = async (data: TSponsorshipForm) => {
    setIsSubmitting(true);
    const toastId = toast.loading("Updating Sponsorship...");

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
      return (await updateData(
        `/sponsorships/update-sponsorship/${prevValues._id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${getCookie("accessToken")}`,
          },
        },
      )) as unknown as Promise<TResponse<TSponsorship>>;
    });

    if (result.success) {
      toast.success(result.message || "Sponsorship updated successfully!", {
        id: toastId,
      });
      form.reset();
      setSponsorBannerPreview(undefined);
      setIsSubmitting(false);
      onOpenChange(false);
      router.refresh();
      return;
    }

    toast.error(result.message || "Failed to update Sponsorship", {
      id: toastId,
    });
    console.log(result);
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogTitle className="text-2xl font-medium">
          Edit Sponsorship
        </DialogTitle>

        {/* Edit Form */}
        <Form {...form}>
          <form
            id="editSponsorship"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5"
          >
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
          </form>
        </Form>

        <DialogFooter>
          <Button
            disabled={isSubmitting}
            className={cn(
              "inline-flex items-center justify-center gap-2 text-white bg-[#DC3173]",
              isSubmitting ? "cursor-wait" : "hover:bg-[#DC3173]/90",
            )}
            form="editSponsorship"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Update"
            )}
          </Button>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
