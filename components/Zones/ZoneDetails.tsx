// components/Zones/ZoneDetails.tsx
"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Map, useMap } from "@vis.gl/react-google-maps";
import { useEffect } from "react";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IZone } from "@/types/zone.type";
import { geoJsonToPath } from "@/utils/toGeoJsonPolygon";
import {
    MapPin,
    Ruler,
    Banknote,
    Navigation,
    Calendar,
    Pencil,
    ArrowLeft,
    CheckCircle2,
    XCircle,
    Hash,
    LocateFixed,
} from "lucide-react";
import { format } from "date-fns";

interface IProps {
    zoneDetails: IZone;
}

/** Read-only polygon on the map */
function ZoneBoundaryLayer({
    path,
}: {
    path: google.maps.LatLngLiteral[];
}) {
    const map = useMap();

    useEffect(() => {
        if (!map || path.length < 3) return;

        const poly = new google.maps.Polygon({
            paths: path,
            editable: false,
            draggable: false,
            fillColor: "#ec4899",
            fillOpacity: 0.25,
            strokeWeight: 2,
            strokeColor: "#db2777",
            map,
        });

        const bounds = new google.maps.LatLngBounds();
        path.forEach((p) => bounds.extend(p));
        map.fitBounds(bounds, 48);

        return () => {
            poly.setMap(null);
        };
    }, [map, path]);

    return null;
}

function InfoItem({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ElementType;
    label: string;
    value: React.ReactNode;
}) {
    return (
        <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/80 p-4">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#DC3173]/10 text-[#DC3173]">
                <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    {label}
                </p>
                <div className="mt-0.5 text-sm font-semibold text-gray-900 wrap-break-word">
                    {value}
                </div>
            </div>
        </div>
    );
}

const ZoneDetails = ({ zoneDetails }: IProps) => {
    const router = useRouter();

    const path = useMemo(() => {
        const coords = zoneDetails.boundary?.coordinates;
        if (!coords?.length) return [];
        return geoJsonToPath(coords);
    }, [zoneDetails.boundary]);

    const center = useMemo(() => {
        if (zoneDetails.centroid?.coordinates?.length === 2) {
            const [lng, lat] = zoneDetails.centroid.coordinates;
            return { lat, lng };
        }
        return { lat: 38.7223, lng: -9.1393 };
    }, [zoneDetails.centroid]);

    const createdAt = zoneDetails.createdAt
        ? format(new Date(zoneDetails.createdAt), "dd MMM yyyy, HH:mm")
        : "—";
    const updatedAt = zoneDetails.updatedAt
        ? format(new Date(zoneDetails.updatedAt), "dd MMM yyyy, HH:mm")
        : "—";

    return (
        <div className="space-y-6 pb-8">
            <TitleHeader
                title={zoneDetails.zoneName}
                subtitle={`Zone ID: ${zoneDetails.zoneId}`}
                onBackClick={() => router.push("/admin/zones")}
                extraComponent={
                    <div className="flex items-center gap-2">
                        {zoneDetails.isOperational ? (
                            <Badge className="bg-green-50 text-green-700 border-green-200 gap-1">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Operational
                            </Badge>
                        ) : (
                            <Badge variant="secondary" className="bg-gray-100 text-gray-600 gap-1">
                                <XCircle className="h-3.5 w-3.5" />
                                Inactive
                            </Badge>
                        )}

                        <Button asChild className="bg-[#DC3173] hover:bg-[#DC3173]/90">
                            <Link href={`/admin/zones/${zoneDetails.zoneId}/edit`}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit Zone
                            </Link>
                        </Button>
                    </div>
                }
            />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Map */}
                <div className="xl:col-span-2 space-y-3">
                    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
                            <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                                <MapPin className="h-4 w-4 text-[#DC3173]" />
                                Coverage Boundary
                            </div>
                            {zoneDetails.areaKm2 != null && (
                                <span className="text-xs text-gray-500">
                                    {zoneDetails.areaKm2.toFixed(2)} km²
                                </span>
                            )}
                        </div>

                        <div className="h-105 w-full relative">
                            {path.length >= 3 ? (
                                <Map
                                    defaultCenter={center}
                                    defaultZoom={12}
                                    gestureHandling="greedy"
                                    disableDefaultUI={false}
                                    style={{ width: "100%", height: "100%" }}
                                >
                                    <ZoneBoundaryLayer path={path} />
                                </Map>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 bg-gray-50">
                                    <MapPin className="h-10 w-10 mb-2 opacity-40" />
                                    <p className="text-sm font-medium">No boundary data</p>
                                    <p className="text-xs mt-1">
                                        This zone has no polygon stored yet.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Side info */}
                <div className="space-y-4">
                    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-4 space-y-3">
                        <h3 className="text-sm font-semibold text-gray-800 mb-1">
                            Zone Information
                        </h3>

                        <InfoItem
                            icon={Hash}
                            label="Zone ID"
                            value={
                                <span className="font-mono text-xs">{zoneDetails.zoneId}</span>
                            }
                        />
                        <InfoItem
                            icon={MapPin}
                            label="District"
                            value={zoneDetails.district || "—"}
                        />
                        <InfoItem
                            icon={Ruler}
                            label="Area"
                            value={
                                zoneDetails.areaKm2 != null
                                    ? `${zoneDetails.areaKm2.toFixed(2)} km²`
                                    : "—"
                            }
                        />
                        <InfoItem
                            icon={Banknote}
                            label="Min Delivery Fee"
                            value={
                                zoneDetails.minDeliveryFee != null
                                    ? `€${zoneDetails.minDeliveryFee.toFixed(2)}`
                                    : "—"
                            }
                        />
                        <InfoItem
                            icon={Navigation}
                            label="Max Delivery Distance"
                            value={
                                zoneDetails.maxDeliveryDistanceKm != null
                                    ? `${zoneDetails.maxDeliveryDistanceKm} km`
                                    : "—"
                            }
                        />
                        <InfoItem
                            icon={LocateFixed}
                            label="Centroid"
                            value={
                                zoneDetails.centroid?.coordinates ? (
                                    <span className="font-mono text-xs">
                                        {zoneDetails.centroid.coordinates[1].toFixed(5)},{" "}
                                        {zoneDetails.centroid.coordinates[0].toFixed(5)}
                                    </span>
                                ) : (
                                    "—"
                                )
                            }
                        />
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-4 space-y-3">
                        <h3 className="text-sm font-semibold text-gray-800 mb-1">
                            Status & Timeline
                        </h3>

                        <InfoItem
                            icon={zoneDetails.isOperational ? CheckCircle2 : XCircle}
                            label="Status"
                            value={
                                zoneDetails.isOperational ? (
                                    <span className="text-green-700">Operational</span>
                                ) : (
                                    <span className="text-gray-600">Inactive</span>
                                )
                            }
                        />

                        {zoneDetails.deactivationReason && (
                            <InfoItem
                                icon={XCircle}
                                label="Deactivation Reason"
                                value={zoneDetails.deactivationReason}
                            />
                        )}

                        <InfoItem icon={Calendar} label="Created" value={createdAt} />
                        <InfoItem icon={Calendar} label="Last Updated" value={updatedAt} />
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" className="flex-1" asChild>
                            <Link href="/admin/zones">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to list
                            </Link>
                        </Button>
                        <Button className="flex-1 bg-[#DC3173] hover:bg-[#DC3173]/90" asChild>
                            <Link href={`/admin/zones/${zoneDetails.zoneId}/edit`}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ZoneDetails;