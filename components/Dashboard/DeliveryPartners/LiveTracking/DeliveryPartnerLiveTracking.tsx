"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Map as GoogleMap,
    AdvancedMarker,
    Pin,
    InfoWindow,
    useMap,
} from "@vis.gl/react-google-maps";
import { Loader2, Bike, User, RefreshCw, Search } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getAllDeliveryPartners } from "@/services/dashboard/delivery-partner/delivery-partner.service";
import { TMeta } from "@/types";
import { TDeliveryPartner } from "@/types/delivery-partner.type";
import { queryStringFormatter } from "@/utils/formatter";
import { cn } from "@/lib/utils";
import Image from "next/image";
import TitleHeader from "@/components/TitleHeader/TitleHeader";

interface IProps {
    initialData: {
        data: TDeliveryPartner[];
        meta: TMeta;
    };
}

function getPartnerLocation(
    partner: TDeliveryPartner
): { lat: number; lng: number } | null {
    const loc = partner.currentSessionLocation;

    const lat = loc?.coordinates?.[1] ?? partner.address?.latitude;
    const lng = loc?.coordinates?.[0] ?? partner.address?.longitude;

    if (
        typeof lat === "number" &&
        typeof lng === "number" &&
        !isNaN(lat) &&
        !isNaN(lng)
    ) {
        return { lat, lng };
    }
    return null;
}

function isActivePartner(partner: TDeliveryPartner) {
    const activeStatuses = ["APPROVED"];
    return activeStatuses.includes(String(partner.status).toUpperCase());
}

// Helper component – pans map when selected rider changes
function MapController({
    selectedPartner,
}: {
    selectedPartner: TDeliveryPartner | undefined;
}) {
    const map = useMap();

    useEffect(() => {
        if (!map || !selectedPartner) return;
        const loc = getPartnerLocation(selectedPartner);
        if (!loc) return;

        map.panTo(loc);
        // Optional: zoom in a bit when focusing a rider
        const currentZoom = map.getZoom() ?? 12;
        if (currentZoom < 14) {
            map.setZoom(14);
        }
    }, [map, selectedPartner]);

    return null;
}

export default function DeliveryPartnerLiveTracking({ initialData }: IProps) {
    const { t } = useTranslation();

    const [partners, setPartners] = useState<TDeliveryPartner[]>(
        initialData.data || []
    );
    const [page, setPage] = useState(initialData.meta?.page || 1);
    const [hasMore, setHasMore] = useState(
        (initialData.meta?.page || 1) < (initialData.meta?.totalPage || 1)
    );
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    const listRef = useRef<HTMLDivElement | null>(null);
    const loadMoreRef = useRef<HTMLDivElement | null>(null);

    // Infinite scroll – load next page
    const loadMore = useCallback(async () => {
        if (isLoadingMore || !hasMore) return;

        setIsLoadingMore(true);
        try {
            const nextPage = page + 1;
            const qs = queryStringFormatter({
                limit: "50",
                page: String(nextPage),
                sortBy: "-updatedAt",
            });

            const res = await getAllDeliveryPartners(qs);
            const list: TDeliveryPartner[] = Array.isArray(res?.data)
                ? res.data
                : res?.data?.data || [];

            const newMeta: TMeta | undefined = res?.meta || res?.data?.meta;

            if (list.length > 0) {
                setPartners((prev) => {
                    const existingIds = new Set(
                        prev.map((p) => String(p._id || p.userId))
                    );
                    const filtered = list.filter(
                        (p) => !existingIds.has(String(p._id || p.userId))
                    );
                    return [...prev, ...filtered];
                });
                setPage(nextPage);
                setHasMore(
                    newMeta
                        ? nextPage < (newMeta.totalPage || 1)
                        : list.length >= 50
                );
            } else {
                setHasMore(false);
            }
        } catch (err) {
            console.error("Load more error:", err);
        } finally {
            setIsLoadingMore(false);
        }
    }, [isLoadingMore, hasMore, page]);

    // Intersection observer for infinite scroll in the sidebar
    useEffect(() => {
        const target = loadMoreRef.current;
        const root = listRef.current;
        if (!target) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting && hasMore && !isLoadingMore) {
                    loadMore();
                }
            },
            { root: root || null, rootMargin: "200px", threshold: 0 }
        );

        observer.observe(target);
        return () => observer.disconnect();
    }, [loadMore, hasMore, isLoadingMore]);

    // Refresh (reload from page 1)
    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        try {
            const qs = queryStringFormatter({
                limit: "50",
                page: "1",
                sortBy: "-updatedAt",
            });
            const res = await getAllDeliveryPartners(qs);
            const list: TDeliveryPartner[] = Array.isArray(res?.data)
                ? res.data
                : res?.data?.data || [];
            const newMeta: TMeta | undefined = res?.meta || res?.data?.meta;

            setPartners(list);
            setPage(1);
            setHasMore(
                newMeta
                    ? 1 < (newMeta.totalPage || 1)
                    : list.length >= 50
            );
        } catch (err) {
            console.error("Refresh error:", err);
        } finally {
            setIsRefreshing(false);
        }
    }, []);

    // Auto-refresh every 30s
    useEffect(() => {
        const interval = setInterval(() => {
            handleRefresh();
        }, 30_000);
        return () => clearInterval(interval);
    }, [handleRefresh]);

    // Derived data
    const activePartners = useMemo(
        () => partners.filter(isActivePartner),
        [partners]
    );

    const partnersOnMap = useMemo(() => {
        return activePartners.filter((p) => {
            const loc = getPartnerLocation(p);
            if (!loc) return false;
            if (!search.trim()) return true;

            const name =
                `${p.name?.firstName || ""} ${p.name?.lastName || ""}`.toLowerCase();
            const phone = (p.contactNumber || "").toLowerCase();
            const q = search.toLowerCase();
            return name.includes(q) || phone.includes(q);
        });
    }, [activePartners, search]);

    const selectedPartner = partnersOnMap.find(
        (p) => (p._id || p.userId) === selectedId
    );

    // Default center (Lisbon) – only used once
    const defaultCenter = { lat: 38.7223, lng: -9.1393 };

    return (
        <>
            <TitleHeader
                title={t("live_rider_tracking")}
                subtitle={t("tracking_riders_live_location_and_where_they_are")}
            />
            <div className="flex h-full gap-3 overflow-hidden">
                {/* LEFT SIDEBAR */}
                <div className="w-80 shrink-0 flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-50 space-y-3">
                        <div className="flex items-center justify-between">
                            <h2 className="font-semibold text-gray-900">
                                {t("all_active_riders")}
                            </h2>
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={handleRefresh}
                                disabled={isRefreshing || isLoadingMore}
                                className="h-8 w-8"
                            >
                                <RefreshCw
                                    className={cn(
                                        "h-4 w-4",
                                        (isRefreshing || isLoadingMore) && "animate-spin"
                                    )}
                                />
                            </Button>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={t("search_riders") || "Search riders..."}
                                className="pl-9 h-9"
                            />
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>
                                {partnersOnMap.length} {t("on_map") || "on map"}
                            </span>
                            {/* <span>
                                {activePartners.length} {t("active") || "active"}
                            </span> */}
                        </div>
                    </div>

                    {/* Scrollable list with infinite scroll */}
                    <div ref={listRef} className="flex-1 overflow-y-auto p-2 space-y-1">
                        {partnersOnMap.length === 0 && !isLoadingMore ? (
                            <p className="text-center text-sm text-gray-400 py-8">
                                {t("no_riders_on_map") || "No riders with location"}
                            </p>
                        ) : (
                            <>
                                {partnersOnMap.map((partner) => {
                                    const id = partner._id || partner.userId;
                                    const name =
                                        `${partner.name?.firstName || ""} ${partner.name?.lastName || ""}`.trim() ||
                                        "Unknown";
                                    const isSelected = selectedId === id;

                                    return (
                                        <button
                                            key={id}
                                            onClick={() => setSelectedId(id)}
                                            className={cn(
                                                "w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-colors",
                                                isSelected
                                                    ? "bg-[#DC3173]/10 border border-[#DC3173]/20"
                                                    : "hover:bg-gray-50"
                                            )}
                                        >
                                            <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden shrink-0 relative">
                                                {partner.profilePhoto ? (
                                                    <Image
                                                        src={partner.profilePhoto}
                                                        alt={name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <User className="h-5 w-5 text-gray-400" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="font-medium text-sm text-gray-900 truncate">
                                                    {name}
                                                </div>
                                                <div className="text-xs text-gray-500 truncate">
                                                    {partner.contactNumber || "—"}
                                                </div>
                                                <div className="flex items-center gap-1 mt-0.5">
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-[10px] px-1.5 py-0 h-4"
                                                    >
                                                        {partner.vehicleInfo?.vehicleType || "—"}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}

                                {/* Infinite scroll trigger */}
                                <div
                                    ref={loadMoreRef}
                                    className="flex justify-center py-4"
                                >
                                    {isLoadingMore && (
                                        <Loader2 className="h-5 w-5 animate-spin text-[#DC3173]" />
                                    )}
                                    {!hasMore && partners.length > 0 && (
                                        <p className="text-xs text-gray-400">
                                            {t("no_more_riders") || "No more riders"}
                                        </p>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* MAP */}
                <div className="flex-1 min-w-0 rounded-2xl overflow-hidden border border-gray-100 shadow-sm relative">
                    {isRefreshing && (
                        <div className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full shadow text-xs flex items-center gap-2">
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-[#DC3173]" />
                            {t("refreshing")}...
                        </div>
                    )}

                    <GoogleMap
                        defaultCenter={defaultCenter}
                        defaultZoom={12}
                        gestureHandling="greedy"
                        disableDefaultUI={false}
                        // mapId is NOT the API key. Use a Map ID from Google Cloud Console
                        // (required for AdvancedMarker). Leave undefined if you don't have one yet.
                        mapId={process.env.NEXT_PUBLIC_GOOGLE_MAP_ID}
                        className="w-full h-full"
                        style={{ width: "100%", height: "100%" }}
                    >
                        <MapController selectedPartner={selectedPartner} />

                        {partnersOnMap.map((partner) => {
                            const loc = getPartnerLocation(partner);
                            if (!loc) return null;

                            const id = partner._id || partner.userId;
                            const name =
                                `${partner.name?.firstName || ""} ${partner.name?.lastName || ""}`.trim() ||
                                "Rider";

                            return (
                                <AdvancedMarker
                                    key={id}
                                    position={loc}
                                    onClick={() => setSelectedId(id)}
                                    title={name}
                                >
                                    <Pin
                                        background="#DC3173"
                                        borderColor="#fff"
                                        glyphColor="#fff"
                                    />
                                </AdvancedMarker>
                            );
                        })}

                        {selectedPartner && getPartnerLocation(selectedPartner) && (
                            <InfoWindow
                                position={getPartnerLocation(selectedPartner)!}
                                onCloseClick={() => setSelectedId(null)}
                            >
                                <div className="p-1 min-w-45">
                                    <div className="font-semibold text-sm">
                                        {`${selectedPartner.name?.firstName || ""} ${selectedPartner.name?.lastName || ""}`.trim()}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-0.5">
                                        {selectedPartner.contactNumber || "—"}
                                    </div>
                                    <div className="text-xs mt-1 flex items-center gap-1">
                                        <Bike className="h-3 w-3" />
                                        {selectedPartner.vehicleInfo?.vehicleType || "—"}
                                    </div>
                                    {selectedPartner.currentFleetManagerId?.businessDetails
                                        ?.businessName && (
                                            <div className="text-xs text-gray-500 mt-1">
                                                Fleet:{" "}
                                                {
                                                    selectedPartner.currentFleetManagerId.businessDetails
                                                        .businessName
                                                }
                                            </div>
                                        )}
                                </div>
                            </InfoWindow>
                        )}
                    </GoogleMap>
                </div>
            </div>
        </>
    );
}