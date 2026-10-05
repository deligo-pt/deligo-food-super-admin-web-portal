"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";
import { getNearbyPartnersForOrders } from "@/services/dashboard/order/order.service";
import {
    MapPin,
    Phone,
    Star,
    User,
    Bike,
    CheckCircle2,
    Loader2,
} from "lucide-react";

type Partner = {
    deliveryPartnerId: string;
    userId: string;
    name: {
        firstName: string;
        lastName: string;
    };
    contactNumber: string;
    profilePhoto?: string;
    rating: {
        average: number;
        totalReviews: number;
    };
    currentStatus: string;
    distanceKm: number;
};

type NearbyPartnersData = {
    orderId: string;
    orderStatus: string;
    searchOrigin: {
        latitude: number;
        longitude: number;
    };
    searchRadiusKm: number;
    totalAvailablePartners: number;
    partners: Partner[];
};

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    orderId: string; // ← required so we can fetch nearby partners
    onConfirm: (payload: { deliveryPartnerId: string; note?: string }) => void;
    isSubmitting: boolean;
}

export default function ReplaceRiderModal({
    open,
    onOpenChange,
    orderId,
    onConfirm,
    isSubmitting,
}: Props) {
    const { t } = useTranslation();

    const [loading, setLoading] = useState(false);
    const [partnersData, setPartnersData] = useState<NearbyPartnersData | null>(null);
    const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
    const [note, setNote] = useState("");
    const [error, setError] = useState<string | null>(null);

    const partners = partnersData?.partners ?? [];
    const selectedPartner = partners.find(
        (p) => p.deliveryPartnerId === selectedPartnerId
    );

    // Fetch nearby partners when modal opens
    useEffect(() => {
        if (!open || !orderId) return;

        let cancelled = false;

        const fetchPartners = async () => {
            setLoading(true);
            setError(null);
            setSelectedPartnerId(null);
            setNote("");
            setPartnersData(null);

            try {
                const res = await getNearbyPartnersForOrders(orderId);

                if (cancelled) return;

                if (res?.success && res?.data) {
                    setPartnersData(res.data);
                } else {
                    setError(res?.message || "Failed to load nearby partners");
                }
            } catch (err: any) {
                if (!cancelled) {
                    setError(err?.message || "Failed to load nearby partners");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchPartners();

        return () => {
            cancelled = true;
        };
    }, [open, orderId]);

    const handleSelect = (partnerId: string) => {
        setSelectedPartnerId((prev) => (prev === partnerId ? null : partnerId));
    };

    const handleConfirm = () => {
        if (!selectedPartnerId) return;
        onConfirm({
            deliveryPartnerId: selectedPartnerId,
            note: note.trim() || undefined,
        });
    };

    const getFullName = (name: Partner["name"]) =>
        `${name?.firstName || ""} ${name?.lastName || ""}`.trim() || "Unknown";

    const handleOpenChange = (next: boolean) => {
        if (!next) {
            // reset on close
            setSelectedPartnerId(null);
            setNote("");
            setError(null);
            setPartnersData(null);
        }
        onOpenChange(next);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t("replace_rider") || "Replace Rider"}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Loading */}
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <Loader2 className="h-8 w-8 animate-spin mb-3" />
                            <p className="text-sm">{t("loading_nearby_partners") || "Loading nearby partners..."}</p>
                        </div>
                    )}

                    {/* Error */}
                    {!loading && error && (
                        <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                            <Bike className="h-10 w-10 mb-2 opacity-40" />
                            <p className="text-sm font-medium text-red-600">{error}</p>
                        </div>
                    )}

                    {/* Empty */}
                    {!loading && !error && partners.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <Bike className="h-12 w-12 mb-3 opacity-40" />
                            <p className="text-sm font-medium">
                                {t("no_nearby_partners_found") || "No nearby partners found"}
                            </p>
                            <p className="text-xs mt-1">
                                {t("search_radius") || "Search radius"}:{" "}
                                {partnersData?.searchRadiusKm ?? 5} {t("km") || "km"}
                            </p>
                            <p className="text-xs mt-2 text-amber-600">
                                {t("no_replacement_use_fault_cancel") ||
                                    "If no replacement is available, use Fault Cancel."}
                            </p>
                        </div>
                    )}

                    {/* Partners list */}
                    {!loading && !error && partners.length > 0 && (
                        <>
                            <p className="text-xs text-muted-foreground">
                                {partnersData?.totalAvailablePartners}{" "}
                                {partnersData && partnersData.totalAvailablePartners > 1
                                    ? t("partners")
                                    : t("partner_sm")}{" "}
                                {t("within") || "within"} {partnersData?.searchRadiusKm}{" "}
                                {t("km") || "km"}
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[40vh] overflow-y-auto pr-1">
                                {partners.map((partner) => {
                                    const isSelected =
                                        selectedPartnerId === partner.deliveryPartnerId;

                                    return (
                                        <Card
                                            key={partner.deliveryPartnerId}
                                            className={cn(
                                                "transition-all cursor-pointer border",
                                                isSelected
                                                    ? "border-[#DC3173] bg-[#DC3173]/5 shadow-sm"
                                                    : "border-border hover:border-[#DC3173]/40 hover:bg-muted/30"
                                            )}
                                            onClick={() => handleSelect(partner.deliveryPartnerId)}
                                        >
                                            <CardContent className="p-3">
                                                <div className="flex items-start gap-3">
                                                    {/* Avatar */}
                                                    <div className="relative h-11 w-11 shrink-0 rounded-full overflow-hidden bg-muted">
                                                        {partner.profilePhoto ? (
                                                            <Image
                                                                src={partner.profilePhoto}
                                                                alt={getFullName(partner.name)}
                                                                fill
                                                                className="object-cover"
                                                                sizes="44px"
                                                            />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center">
                                                                <User className="h-5 w-5 text-muted-foreground" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Info */}
                                                    <div className="flex-1 min-w-0 space-y-0.5">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <h3 className="text-sm font-semibold truncate">
                                                                {getFullName(partner.name)}
                                                            </h3>
                                                            {isSelected && (
                                                                <CheckCircle2 className="h-4 w-4 text-[#DC3173] shrink-0" />
                                                            )}
                                                        </div>

                                                        <p className="text-[11px] text-muted-foreground">
                                                            {partner.userId}
                                                        </p>

                                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
                                                            <span className="inline-flex items-center gap-1">
                                                                <Phone className="h-3 w-3" />
                                                                {partner.contactNumber}
                                                            </span>
                                                            <span className="inline-flex items-center gap-1">
                                                                <MapPin className="h-3 w-3" />
                                                                {partner.distanceKm.toFixed(2)} {t("km")}
                                                            </span>
                                                            <span className="inline-flex items-center gap-1">
                                                                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                                                {partner.rating?.average?.toFixed(1) ?? "0.0"}
                                                                <span className="text-muted-foreground/70">
                                                                    ({partner.rating?.totalReviews ?? 0})
                                                                </span>
                                                            </span>
                                                        </div>

                                                        <Badge
                                                            variant="outline"
                                                            className={cn(
                                                                "text-[10px] h-5 font-normal mt-1",
                                                                partner.currentStatus === "IDLE"
                                                                    ? "border-emerald-200 text-emerald-700 bg-emerald-50"
                                                                    : "border-slate-200 text-slate-600"
                                                            )}
                                                        >
                                                            {partner.currentStatus}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>

                            {/* Selected + Note */}
                            <div className="space-y-3 pt-1 border-t">
                                {selectedPartner && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <CheckCircle2 className="h-4 w-4 text-[#DC3173]" />
                                        <span>
                                            {t("selected_lg") || "Selected"}:{" "}
                                            <span className="font-semibold">
                                                {getFullName(selectedPartner.name)}
                                            </span>
                                            <span className="text-muted-foreground ml-1">
                                                ({selectedPartner.distanceKm.toFixed(2)}{" "}
                                                {t("km_away") || "km away"})
                                            </span>
                                        </span>
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <Label className="text-xs">
                                        {t("note")}{" "}
                                        <span className="text-muted-foreground font-normal">
                                            ({t("optional") || "optional"})
                                        </span>
                                    </Label>
                                    <Textarea
                                        placeholder={
                                            t("add_a_note_for_replacement") ||
                                            "Add a note for the replacement..."
                                        }
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        maxLength={500}
                                        rows={2}
                                        className="resize-none text-sm"
                                        disabled={isSubmitting}
                                    />
                                    <p className="text-[10px] text-muted-foreground text-right">
                                        {note.length}/500
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <DialogFooter className="gap-2">
                    <Button
                        variant="outline"
                        onClick={() => handleOpenChange(false)}
                        disabled={isSubmitting}
                    >
                        {t("cancel")}
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={
                            isSubmitting ||
                            loading ||
                            !selectedPartnerId ||
                            partners.length === 0
                        }
                        className="bg-[#DC3173] hover:bg-[#DC3173]/90 text-white"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                {t("processing") || "Processing..."}
                            </>
                        ) : (
                            t("replace_rider") || "Replace Rider"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}