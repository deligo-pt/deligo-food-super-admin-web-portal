
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { ZoneMapDrawer } from "./ZoneMapDrawer";
import { ZoneForm, type ZoneFormValues, type DistrictPlaceResult } from "./ZoneForm";
import type { IZone, ValidateBoundaryResponse } from "@/types/zone.type";
import { updateZone } from "@/services/dashboard/zone/zone.service";
import {
    toGeoJsonPolygon,
    geoJsonToPath,
    boundsToPath,
} from "@/utils/toGeoJsonPolygon";
import { useTranslation } from "@/hooks/use-translation";

interface IProps {
    zoneDetails: IZone;
}

const EditZone = ({ zoneDetails }: IProps) => {
    const { t } = useTranslation();
    const router = useRouter();

    // Convert stored GeoJSON → map path
    const initialPath = useMemo(() => {
        const coords = zoneDetails.boundary?.coordinates;
        if (!coords?.length) return undefined;
        return geoJsonToPath(coords);
    }, [zoneDetails.boundary]);

    const [validation, setValidation] = useState<ValidateBoundaryResponse | null>(
        null
    );
    const [currentPath, setCurrentPath] = useState<google.maps.LatLngLiteral[]>(
        initialPath ?? []
    );
    const [mapPath, setMapPath] = useState<google.maps.LatLngLiteral[] | undefined>(
        initialPath
    );
    const [isSubmitting, setIsSubmitting] = useState(false);

    // On edit, existing boundary is already valid enough to allow save
    // until user changes it (then live validation takes over)
    const canSave = currentPath.length >= 4 && (validation === null || validation.valid === true);

    const handleDistrictSelect = (place: DistrictPlaceResult) => {
        const path = boundsToPath(place.bounds);
        setMapPath([...path]);
        setCurrentPath(path);
        toast.success(`Loaded area for ${place.name}`);
    };

    const handleSubmit = async (values: ZoneFormValues) => {
        if (currentPath.length < 4) {
            toast.error("Please keep a valid boundary on the map");
            return;
        }

        if (validation && !validation.valid) {
            toast.error("Boundary is invalid — fix overlaps or shape first");
            return;
        }

        setIsSubmitting(true);
        try {
            const boundary = toGeoJsonPolygon(currentPath);

            const result = await updateZone(zoneDetails.zoneId, {
                // zoneId usually should not change; backend keys by it
                district: values.district,
                zoneName: values.zoneName,
                boundary,
                isOperational: values.isOperational,
            });

            if (result.success) {
                toast.success(result.message || "Zone updated successfully");
                router.push("/admin/zones");
                router.refresh();
            } else {
                toast.error(result.message || "Failed to update zone");
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
                title={t("edit_zone")}
                subtitle={`${t("update_details_and_boundary_for")} ${zoneDetails.zoneName}`}
            />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Map */}
                <div className="xl:col-span-2">
                    <ZoneMapDrawer
                        excludeZoneId={zoneDetails.zoneId}
                        initialPath={mapPath}
                        onValidationChange={setValidation}
                        onPolygonChange={setCurrentPath}
                    />
                </div>

                {/* Form */}
                <div className="border rounded-lg p-4 h-fit sticky top-6 space-y-4">
                    <h2 className="font-semibold">{t("zone_details")}</h2>

                    <ZoneForm
                        isEdit
                        isSubmitting={isSubmitting}
                        isValidBoundary={canSave}
                        onDistrictSelect={handleDistrictSelect}
                        onSubmit={handleSubmit}
                        defaultValues={{
                            zoneId: zoneDetails.zoneId,
                            district: zoneDetails.district,
                            zoneName: zoneDetails.zoneName,
                            isOperational: zoneDetails.isOperational,
                            // minDeliveryFee: zoneDetails.minDeliveryFee ?? 2,
                            // maxDeliveryDistanceKm: zoneDetails.maxDeliveryDistanceKm ?? 7,
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default EditZone;