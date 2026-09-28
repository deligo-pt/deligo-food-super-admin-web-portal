/* eslint-disable @typescript-eslint/no-explicit-any */
// components/Zones/ZoneForm.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { Loader2, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateZoneId } from "@/utils/toGeoJsonPolygon";
import { useTranslation } from "@/hooks/use-translation";

const zoneFormSchema = z.object({
    zoneId: z
        .string()
        .min(3, "Min 3 characters")
        .max(50, "Max 50 characters")
        .regex(
            /^[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*$/,
            "Only letters, numbers and single hyphens"
        ),
    district: z.string().min(1, "Required").max(100),
    zoneName: z.string().min(1, "Required").max(100),
    isOperational: z.boolean(),
});

export type ZoneFormValues = z.infer<typeof zoneFormSchema>;

export type DistrictPlaceResult = {
    name: string;
    placeId: string;
    bounds: google.maps.LatLngBounds;
};

type Props = {
    defaultValues?: Partial<ZoneFormValues>;
    onSubmit: (values: ZoneFormValues) => Promise<void>;
    isSubmitting?: boolean;
    isValidBoundary?: boolean;
    onDistrictSelect?: (place: DistrictPlaceResult) => void;
    isEdit?: boolean;
};

type Prediction = {
    placeId: string;
    description: string;
    mainText: string;
};

export function ZoneForm({
    defaultValues,
    onSubmit,
    isSubmitting = false,
    isValidBoundary = false,
    onDistrictSelect,
    isEdit
}: Props) {
    const { t } = useTranslation();
    const places = useMapsLibrary("places");
    const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
    const placesService = useRef<google.maps.places.PlacesService | null>(null);
    const hiddenMapDiv = useRef<HTMLDivElement | null>(null);

    const form = useForm<z.input<typeof zoneFormSchema>, any, ZoneFormValues>({
        resolver: zodResolver(zoneFormSchema),
        defaultValues: {
            zoneId: "",
            district: "",
            zoneName: "",
            isOperational: true,
            ...defaultValues,
        },
    });

    const [query, setQuery] = useState(defaultValues?.district || "");
    const [predictions, setPredictions] = useState<Prediction[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    // Init Places services once library is ready
    useEffect(() => {
        if (!places) return;
        autocompleteService.current = new places.AutocompleteService();

        // PlacesService needs a DOM node
        if (!hiddenMapDiv.current) {
            hiddenMapDiv.current = document.createElement("div");
        }
        placesService.current = new places.PlacesService(hiddenMapDiv.current);
    }, [places]);

    // Debounced search – Portugal only
    useEffect(() => {
        if (!autocompleteService.current || query.trim().length < 2) {
            setPredictions([]);
            return;
        }

        const timer = setTimeout(() => {
            setIsSearching(true);

            autocompleteService.current!.getPlacePredictions(
                {
                    input: query.trim(),
                    componentRestrictions: { country: "pt" }, // 🇵🇹 Portugal only
                    types: ["(regions)"], // cities / districts / admin areas
                },
                (results, status) => {
                    setIsSearching(false);

                    if (
                        status !== google.maps.places.PlacesServiceStatus.OK ||
                        !results
                    ) {
                        setPredictions([]);
                        return;
                    }

                    setPredictions(
                        results.map((r) => ({
                            placeId: r.place_id,
                            description: r.description,
                            mainText: r.structured_formatting?.main_text || r.description,
                        }))
                    );
                    setShowDropdown(true);
                }
            );
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const handleSelect = (prediction: Prediction) => {
        if (!placesService.current) return;

        placesService.current.getDetails(
            {
                placeId: prediction.placeId,
                fields: ["name", "geometry", "address_components"],
            },
            (place, status) => {
                if (
                    status !== google.maps.places.PlacesServiceStatus.OK ||
                    !place?.geometry
                ) {
                    return;
                }

                const name =
                    place.name ||
                    prediction.mainText ||
                    prediction.description.split(",")[0];

                form.setValue("district", name, { shouldValidate: true });
                form.setValue("zoneName", name, { shouldValidate: true });
                form.setValue("zoneId", generateZoneId(name), { shouldValidate: true });

                setQuery(name);
                setShowDropdown(false);
                setPredictions([]);

                const bounds =
                    place.geometry.viewport ||
                    (place.geometry.location
                        ? new google.maps.LatLngBounds(
                            place.geometry.location,
                            place.geometry.location
                        )
                        : null);

                if (bounds && onDistrictSelect) {
                    onDistrictSelect({
                        name,
                        placeId: prediction.placeId,
                        bounds,
                    });
                }
            }
        );
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* District – Google Places search (PT only) */}
                <FormField
                    control={form.control}
                    name="district"
                    render={({ field }) => (
                        <FormItem className="relative">
                            <FormLabel>
                                {t("district")} <span className="text-red-600">*</span>
                            </FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Input
                                        placeholder={t("search_district_in_portugal")}
                                        value={query}
                                        onChange={(e) => {
                                            setQuery(e.target.value);
                                            field.onChange(e.target.value);
                                            setShowDropdown(true);
                                        }}
                                        onFocus={() => predictions.length > 0 && setShowDropdown(true)}
                                        onBlur={() => {
                                            // small delay so click on item still registers
                                            setTimeout(() => setShowDropdown(false), 200);
                                        }}
                                        autoComplete="off"
                                    />
                                    {isSearching && (
                                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                                    )}
                                </div>
                            </FormControl>
                            <FormMessage />

                            {showDropdown && predictions.length > 0 && (
                                <div className="absolute z-50 mt-1 w-full rounded-lg border bg-white shadow-lg max-h-52 overflow-y-auto">
                                    {predictions.map((p) => (
                                        <button
                                            key={p.placeId}
                                            type="button"
                                            className={cn(
                                                "w-full flex items-start gap-2 px-3 py-2.5 text-left text-sm hover:bg-[#DC3173]/10 transition-colors"
                                            )}
                                            onMouseDown={(e) => e.preventDefault()}
                                            onClick={() => handleSelect(p)}
                                        >
                                            <MapPin className="h-4 w-4 text-[#DC3173] shrink-0 mt-0.5" />
                                            <span className="truncate">
                                                <span className="font-medium">{p.mainText}</span>
                                                <span className="block text-xs text-muted-foreground truncate">
                                                    {p.description}
                                                </span>
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </FormItem>
                    )}
                />

                {/* Zone ID field – disable when editing */}
                <FormField
                    control={form.control}
                    name="zoneId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                {t("zone_id")} <span className="text-red-600">*</span>
                            </FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Lisbon-Zone"
                                    {...field}
                                    disabled={isEdit} // ← cannot change id on edit
                                    className={isEdit ? "bg-muted cursor-not-allowed" : ""}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="zoneName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                {t("zone_name")} <span className="text-red-600">*</span>
                            </FormLabel>
                            <FormControl>
                                <Input placeholder="Lisbon Centre" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="isOperational"
                    render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-3">
                            <FormLabel>{t("active_status")}</FormLabel>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    className="data-[state=checked]:bg-[#DC3173]"
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                {/* <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="minDeliveryFee"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t("min_delivery_fee")}</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        step="0.1"
                                        {...field}
                                        value={String(field.value) ?? ""}
                                        onChange={(e) => field.onChange(e.target.value)}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="maxDeliveryDistanceKm"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t("max_distance_km")}</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        step="0.1"
                                        {...field}
                                        value={String(field.value) ?? ""}
                                        onChange={(e) => field.onChange(e.target.value)}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div> */}

                <Button
                    type="submit"
                    className="w-full bg-[#DC3173]"
                    disabled={isSubmitting || !isValidBoundary}
                >
                    {isSubmitting ? t("saving") : isEdit ? t("update_zone") : t("save_zone")}
                </Button>
            </form>
        </Form>
    );
}