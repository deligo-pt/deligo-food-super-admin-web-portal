// components/Zones/CreateZone.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ZoneMapDrawer } from "./ZoneMapDrawer";
import { DistrictPlaceResult, ZoneForm, type ZoneFormValues } from "./ZoneForm";
import { toast } from "sonner";
import type { ValidateBoundaryResponse } from "@/types/zone.type";
import { boundsToPath, toGeoJsonPolygon } from "@/utils/toGeoJsonPolygon";
import { createZone } from "@/services/dashboard/zone/zone.service";
import TitleHeader from "../TitleHeader/TitleHeader";
import { useTranslation } from "@/hooks/use-translation";

const CreateZone = () => {
    const { t } = useTranslation();
    const router = useRouter();

    const [validation, setValidation] = useState<ValidateBoundaryResponse | null>(null);
    const [currentPath, setCurrentPath] = useState<google.maps.LatLngLiteral[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const canSave = !!validation?.valid && currentPath.length >= 4;
    const [districtPath, setDistrictPath] = useState<
        google.maps.LatLngLiteral[] | undefined
    >();

    const handleDistrictSelect = (place: DistrictPlaceResult) => {
        const path = boundsToPath(place.bounds);
        setDistrictPath([...path]);
        setCurrentPath(path);
        toast.success(`Loaded area for ${place.name}`);
    };


    const handleSubmit = async (values: ZoneFormValues) => {
        const toastId = toast.loading("Creating Zone...");
        if (!canSave) {
            toast.error("Please draw or select a valid boundary first", { id: toastId });
            return;
        }

        setIsSubmitting(true);
        try {
            const boundary = toGeoJsonPolygon(currentPath);

            const result = await createZone({
                zoneId: values.zoneId,
                district: values.district,
                zoneName: values.zoneName,
                boundary,
                isOperational: values.isOperational,
                // minDeliveryFee: values.minDeliveryFee,
                // maxDeliveryDistanceKm: values.maxDeliveryDistanceKm,
            });

            if (result.success) {
                toast.success("Zone created successfully", { id: toastId });
                router.push("/admin/zones");
                return;
            };

            const errorSources = result?.data?.errorSources;
            if (errorSources?.length > 0) {
                toast.error(
                    errorSources
                        ?.map((err: { path: string; message: string }) => err?.message)
                        .join(", "),
                    { id: toastId }
                );
            } else {
                toast.error(
                    result.message || "Failed to create zone.",
                    { id: toastId }
                );
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <TitleHeader
                title={t("create_zone")}
                subtitle={t("search_a_district_to_auto_load")}
            />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2">
                    <ZoneMapDrawer
                        initialPath={districtPath}
                        onValidationChange={setValidation}
                        onPolygonChange={setCurrentPath}
                    />
                </div>

                <div className="border rounded-lg p-4 h-fit sticky top-6 space-y-4">
                    <h2 className="font-semibold">{t("zone_details")}</h2>
                    <ZoneForm
                        onSubmit={handleSubmit}
                        isSubmitting={isSubmitting}
                        isValidBoundary={canSave}
                        onDistrictSelect={handleDistrictSelect}
                    />
                </div>
            </div>
        </div>
    );
};

export default CreateZone;