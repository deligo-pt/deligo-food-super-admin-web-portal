/* eslint-disable @typescript-eslint/no-explicit-any */
// components/Zones/ZoneMapDrawer.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Map, useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { ZoneValidationFeedback } from "./ZoneValidationFeedback";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Check } from "lucide-react";
import { ValidateBoundaryResponse } from "@/types/zone.type";
import { toGeoJsonPolygon } from "@/utils/toGeoJsonPolygon";
import { validateBoundary } from "@/services/dashboard/zone/zone.service";

type LatLngLiteral = google.maps.LatLngLiteral;

type Props = {
    excludeZoneId?: string;
    initialPath?: LatLngLiteral[];
    onValidationChange?: (v: ValidateBoundaryResponse | null) => void;
    onPolygonChange?: (path: LatLngLiteral[]) => void;
};

export function ZoneMapDrawer({
    excludeZoneId,
    initialPath,
    onValidationChange,
    onPolygonChange,
}: Props) {
    const map = useMap();
    const geometry = useMapsLibrary("geometry");

    const [isDrawing, setIsDrawing] = useState(false);
    const [path, setPath] = useState<LatLngLiteral[]>(initialPath ?? []);
    const [polygon, setPolygon] = useState<google.maps.Polygon | null>(null);
    const [polyline, setPolyline] = useState<google.maps.Polyline | null>(null);
    const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
    const [validation, setValidation] = useState<ValidateBoundaryResponse | null>(null);
    const [isValidating, setIsValidating] = useState(false);

    // keep latest path in a ref so event listeners always see current value
    const pathRef = useRef<LatLngLiteral[]>(path);
    useEffect(() => {
        pathRef.current = path;
    }, [path]);

    // Validation
    const runValidation = useCallback(
        async (currentPath: LatLngLiteral[]) => {
            if (currentPath.length < 3) {
                setValidation(null);
                onValidationChange?.(null);
                return;
            }

            setIsValidating(true);
            try {
                const boundary = toGeoJsonPolygon(currentPath);
                // inside ZoneMapDrawer.tsx → runValidation

                const result = await validateBoundary({
                    boundary,
                    excludeZoneId,
                });

                if (result.success) {
                    const data = result.data as ValidateBoundaryResponse;

                    setValidation(data);
                    onValidationChange?.(data);

                    if (!data.valid) {
                        toast.error("Boundary is invalid");
                    } else if (data.overlaps?.length) {
                        toast.warning(
                            `Overlaps with: ${data.overlaps.map((o) => o.zoneId).join(", ")}`
                        );
                    } else {
                        toast.success(`Valid • ${data.areaKm2.toFixed(2)} km²`);
                    }
                } else {
                    toast.error(result.message || "Validation failed");
                    setValidation(null);
                    onValidationChange?.(null);
                }
            } catch (e: any) {
                toast.error(e.message || "Validation failed");
                setValidation(null);
                onValidationChange?.(null);
            } finally {
                setIsValidating(false);
            }
        },
        [excludeZoneId, onValidationChange]
    );

    // Clear everything
    const clearDrawing = useCallback(() => {
        polygon?.setMap(null);
        polyline?.setMap(null);
        markers.forEach((m) => m.setMap(null));

        setPolygon(null);
        setPolyline(null);
        setMarkers([]);
        setPath([]);
        pathRef.current = [];
        setValidation(null);
        onValidationChange?.(null);
        onPolygonChange?.([]);
    }, [polygon, polyline, markers, onValidationChange, onPolygonChange]);

    // Finish drawing (close the polygon)
    const finishDrawing = useCallback(() => {
        const current = pathRef.current;
        if (current.length < 3) {
            toast.error("Need at least 3 points to create a zone");
            return;
        }

        // close the ring
        const closed = [...current];
        if (
            closed[0].lat !== closed[closed.length - 1].lat ||
            closed[0].lng !== closed[closed.length - 1].lng
        ) {
            closed.push({ ...closed[0] });
        }

        setPath(closed);
        pathRef.current = closed;
        setIsDrawing(false);

        // remove temporary polyline + markers
        polyline?.setMap(null);
        markers.forEach((m) => m.setMap(null));
        setPolyline(null);
        setMarkers([]);

        // create final editable polygon
        if (map) {
            const poly = new google.maps.Polygon({
                paths: closed,
                editable: true,
                draggable: false,
                fillColor: "#ec4899",
                fillOpacity: 0.25,
                strokeWeight: 2,
                strokeColor: "#db2777",
                map,
            });

            setPolygon(poly);

            // listen for vertex edits
            const pathObj = poly.getPath();
            const updateFromPoly = () => {
                const newPath = pathObj.getArray().map((p) => ({
                    lat: p.lat(),
                    lng: p.lng(),
                }));
                setPath(newPath);
                pathRef.current = newPath;
                onPolygonChange?.(newPath);
                runValidation(newPath);
            };

            google.maps.event.addListener(pathObj, "set_at", updateFromPoly);
            google.maps.event.addListener(pathObj, "insert_at", updateFromPoly);
            google.maps.event.addListener(pathObj, "remove_at", updateFromPoly);

            onPolygonChange?.(closed);
            runValidation(closed);
        }
    }, [map, polyline, markers, onPolygonChange, runValidation]);

    // Click handler while drawing
    useEffect(() => {
        if (!map || !isDrawing) return;

        const clickListener = map.addListener("click", (e: google.maps.MapMouseEvent) => {
            if (!e.latLng) return;

            const newPoint = { lat: e.latLng.lat(), lng: e.latLng.lng() };
            const updated = [...pathRef.current, newPoint];
            setPath(updated);
            pathRef.current = updated;
            onPolygonChange?.(updated);

            // temporary marker
            const marker = new google.maps.Marker({
                position: newPoint,
                map,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 6,
                    fillColor: "#db2777",
                    fillOpacity: 1,
                    strokeWeight: 1,
                    strokeColor: "#fff",
                },
            });
            setMarkers((prev) => [...prev, marker]);

            // temporary polyline
            if (polyline) {
                polyline.setPath(updated);
            } else {
                const line = new google.maps.Polyline({
                    path: updated,
                    strokeColor: "#db2777",
                    strokeWeight: 2,
                    map,
                });
                setPolyline(line);
            }
        });

        return () => {
            google.maps.event.removeListener(clickListener);
        };
    }, [map, isDrawing, polyline, onPolygonChange]);

    // Load initial path (edit mode)
    useEffect(() => {
        if (!map || !initialPath || initialPath.length < 3) return;

        polygon?.setMap(null);
        polyline?.setMap(null);
        markers.forEach((marker) => marker.setMap(null));

        const poly = new google.maps.Polygon({
            paths: initialPath,
            editable: true,
            draggable: false,
            fillColor: "#ec4899",
            fillOpacity: 0.25,
            strokeWeight: 2,
            strokeColor: "#db2777",
            map,
        });

        pathRef.current = initialPath;

        queueMicrotask(() => {
            setPolygon(poly);
            setPolyline(null);
            setMarkers([]);
            setPath(initialPath);
            setValidation(null);
        });

        const pathObj = poly.getPath();
        const updateFromPoly = () => {
            const newPath = pathObj.getArray().map((p) => ({
                lat: p.lat(),
                lng: p.lng(),
            }));
            setPath(newPath);
            pathRef.current = newPath;
            onPolygonChange?.(newPath);
            runValidation(newPath);
        };

        google.maps.event.addListener(pathObj, "set_at", updateFromPoly);
        google.maps.event.addListener(pathObj, "insert_at", updateFromPoly);
        google.maps.event.addListener(pathObj, "remove_at", updateFromPoly);

        onPolygonChange?.(initialPath);
        queueMicrotask(() => runValidation(initialPath));

        return () => {
            poly.setMap(null);
        };
    }, [map, initialPath, polygon, polyline, markers]);

    // Start drawing
    const startDrawing = () => {
        clearDrawing();
        setIsDrawing(true);
        toast.info("Click on the map to add points. Click “Finish” when done.");
    };

    return (
        <div className="space-y-3">
            {/* Toolbar */}
            <div className="flex flex-wrap gap-2">
                {!isDrawing && !polygon && (
                    <Button type="button" size="sm" onClick={startDrawing} className="bg-[#DC3173]">
                        <Pencil className="mr-2 h-4 w-4" />
                        Draw Zone
                    </Button>
                )}

                {isDrawing && (
                    <>
                        <Button type="button" size="sm" onClick={finishDrawing}>
                            <Check className="mr-2 h-4 w-4" />
                            Finish Drawing
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                                setIsDrawing(false);
                                clearDrawing();
                            }}
                        >
                            Cancel
                        </Button>
                    </>
                )}

                {(polygon || path.length > 0) && !isDrawing && (
                    <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={clearDrawing}
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Clear
                    </Button>
                )}
            </div>

            {/* Map */}
            <div className="h-125 rounded-lg overflow-hidden border relative">
                <Map
                    defaultCenter={{ lat: 38.7223, lng: -9.1393 }}
                    defaultZoom={12}
                    gestureHandling="greedy"
                    disableDefaultUI={false}
                    style={{ width: "100%", height: "100%" }}
                // optional: mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID}
                />
                {isDrawing && (
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur px-3 py-1.5 rounded-md text-sm shadow border z-10">
                        Click to add points • {path.length} point{path.length !== 1 ? "s" : ""}
                    </div>
                )}
            </div>

            <ZoneValidationFeedback
                validation={validation}
                isValidating={isValidating}
            />
        </div>
    );
}