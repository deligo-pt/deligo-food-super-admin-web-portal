/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ZoneMapDrawer } from "./ZoneMapDrawer";
import { ZoneForm, type ZoneFormValues } from "./ZoneForm";
import { toast } from "sonner";
import { ValidateBoundaryResponse } from "@/types/zone.type";
import { toGeoJsonPolygon } from "@/utils/toGeoJsonPolygon";
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

    const handleSubmit = async (values: ZoneFormValues) => {
        if (!canSave) {
            toast.error("Please draw a valid boundary first");
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
                minDeliveryFee: values.minDeliveryFee,
                maxDeliveryDistanceKm: values.maxDeliveryDistanceKm,
            });

            if (result.success) {
                toast.success("Zone created successfully");
                router.push("/admin/zones");
            } else {
                toast.error(result.message || "Failed to create zone");
            }
        } catch (e: any) {
            toast.error(e.message || "Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <TitleHeader
                title="Create Zone"
                subtitle="Draw the coverage area, then fill in the zone details."
            />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Map */}
                <div className="xl:col-span-2">
                    <ZoneMapDrawer
                        onValidationChange={setValidation}
                        onPolygonChange={setCurrentPath}
                    />
                </div>

                {/* Form */}
                <div className="border rounded-lg p-4 h-fit sticky top-6 space-y-4">
                    <h2 className="font-semibold">Zone Details</h2>

                    <ZoneForm
                        onSubmit={handleSubmit}
                        isSubmitting={isSubmitting}
                        isValidBoundary={canSave}   // ← this controls the Save button
                    />
                </div>
            </div>
        </div>
    );
}

export default CreateZone;