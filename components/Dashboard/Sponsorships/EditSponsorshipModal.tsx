"use client";

import SettingsInput from "@/components/Dashboard/Settings/GlobalSettings/SettingsInput";
import SettingsToggle from "@/components/Dashboard/Settings/GlobalSettings/SettingsToggle";
import ImageUpload from "@/components/Dashboard/Sponsorships/ImageUpload";
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
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";
import { getAllZones } from "@/services/dashboard/zone/zone.service";
import { TResponse } from "@/types";
import { TSponsorship } from "@/types/sponsorship.type";
import { catchAsync } from "@/utils/catchAsync";
import { updateData } from "@/utils/requests";
import { sponsorshipValidation } from "@/validations/sponsorship/sponsorship.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { MapPin, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

type TSponsorshipForm = z.infer<typeof sponsorshipValidation>;

interface IProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prevValues: TSponsorship;
}

interface TZone {
  _id: string;
  zoneName: string;
  district: string;
  zoneId?: string;
}

export default function EditSponsorshipModal({
  open,
  onOpenChange,
  prevValues,
}: IProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const [zones, setZones] = useState<TZone[]>([]);
  const [loadingZones, setLoadingZones] = useState(false);

  // Extract initial zone IDs from prevValues (handles populated objects or raw IDs)
  const initialZoneIds = prevValues?.targetZoneIds?.map((z:  Partial<TSponsorship>) => (typeof z === "object" ? z._id : z)) || [];

  const form = useForm<TSponsorshipForm>({
    resolver: zodResolver(sponsorshipValidation),
    defaultValues: {
      sponsorName: prevValues?.sponsorName || "",
      sponsorType: prevValues?.sponsorType || "Ads",
      startDate: new Date(prevValues?.startDate) || new Date(),
      endDate: new Date(prevValues?.endDate) || new Date(),
      isActive: prevValues?.isActive ?? true,
      sponsorBanner: { file: null, url: prevValues?.bannerImage || "" },
      url: prevValues?.url || "",
      targetZoneIds: initialZoneIds,
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sponsorBannerPreview, setSponsorBannerPreview] = useState<
    string | undefined
  >(prevValues?.bannerImage);

  // Fetch available zones for selection
  useEffect(() => {
    if (open) {
      const fetchZones = async () => {
        setLoadingZones(true);
        try {
          const res = await getAllZones();
          if (res?.success || Array.isArray(res?.data)) {
            setZones(res.data || res);
          }
        } catch (error) {
          console.error("Failed to fetch zones", error);
        } finally {
          setLoadingZones(false);
        }
      };
      fetchZones();
    }
  }, [open]);

  const onSubmit = async (data: TSponsorshipForm) => {
    setIsSubmitting(true);
    const toastId = toast.loading("Updating Sponsorship...");

    const payload = {
      sponsorName: data.sponsorName,
      sponsorType: data.sponsorType,
      startDate: format(data.startDate, "yyyy-MM-dd"),
      endDate: format(data.endDate, "yyyy-MM-dd"),
      isActive: data.isActive,
      targetZoneIds: data.targetZoneIds,
      ...(data.url && { url: data.url }),
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
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-xl">
        <DialogTitle className="text-2xl font-medium">
          {t("edit_sponsorship")}
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

            {/* Target Zones Selection */}
            <FormField
              control={form.control}
              name="targetZoneIds"
              render={({ field }) => {
                const selectedZones = (field.value || []).filter(
                  (zoneId): zoneId is string => typeof zoneId === "string",
                );

                return (
                  <FormItem>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-[#DC3173]" />
                          {t("targeted_zones") || "Target Zones"}
                        </label>
                        {selectedZones.length === 0 && (
                          <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md font-medium">
                            {t("no_zones_set") || "No zones set - Please select zones"}
                          </span>
                        )}
                      </div>

                      {/* Selected Badges */}
                      <div className="flex flex-wrap gap-1.5 min-h-9.5 p-2 rounded-xl bg-gray-50 border border-gray-200">
                        {selectedZones.length === 0 ? (
                          <p className="text-sm text-gray-400 px-1 py-0.5">
                            {t("select_target_zones") || "Select zones below..."}
                          </p>
                        ) : (
                          selectedZones.map((zoneId) => {
                            const foundZone = zones.find((z) => z._id === zoneId);
                            const prevFound = prevValues?.targetZoneIds?.find(
                              (pz: Partial<TSponsorship>) => (typeof pz === "object" ? pz._id === zoneId : pz === zoneId)
                            );
                            const displayName =
                              foundZone?.zoneName ||
                              (typeof prevFound === "object" ? (prevFound as { zoneName?: string })?.zoneName : zoneId);

                            return (
                              <span
                                key={zoneId}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border text-xs font-medium text-gray-800 shadow-2xs"
                              >
                                {displayName}
                                <button
                                  type="button"
                                  onClick={() =>
                                    field.onChange(
                                      selectedZones.filter((id) => id !== zoneId)
                                    )
                                  }
                                  className="text-gray-400 hover:text-red-500"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            );
                          })
                        )}
                      </div>

                      {/* Zone Selector Dropdown */}
                      <Select
                        onValueChange={(value) => {
                          if (!selectedZones.includes(value)) {
                            field.onChange([...selectedZones, value]);
                          }
                        }}
                      >
                        <SelectTrigger className="w-full rounded-xl bg-gray-50 border-0 h-11">
                          <SelectValue
                            placeholder={
                              loadingZones
                                ? "Loading zones..."
                                : "Add target zone..."
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {zones
                            .filter((z) => !selectedZones.includes(z._id))
                            .map((zone) => (
                              <SelectItem key={zone._id} value={zone._id}>
                                {zone.zoneName} ({zone.district})
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

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
          </form>
        </Form>

        <DialogFooter className="mt-4">
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
              t("update")
            )}
          </Button>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              {t("cancel")}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}