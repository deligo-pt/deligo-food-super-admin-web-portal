"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { assignPartnerToOrder } from "@/services/dashboard/order/order.service";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
    MapPin,
    Phone,
    Star,
    User,
    Bike,
    CheckCircle2,
    Loader2,
} from "lucide-react";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { useTranslation } from "@/hooks/use-translation";

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

type Props = {
    nearbyPartners: NearbyPartnersData;
};

const NearbyPartners = ({ nearbyPartners }: Props) => {
    const { t } = useTranslation();
    const router = useRouter();
    const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
    const [note, setNote] = useState("");
    const [isAssigning, setIsAssigning] = useState(false);

    const partners = nearbyPartners?.partners ?? [];
    const orderId = nearbyPartners?.orderId;

    const selectedPartner = partners.find(
        (p) => p.deliveryPartnerId === selectedPartnerId
    );

    const handleSelect = (partnerId: string) => {
        setSelectedPartnerId((prev) => (prev === partnerId ? null : partnerId));
    };

    const handleAssign = async () => {
        if (!selectedPartnerId || !orderId) {
            toast.error("Please select a delivery partner");
            return;
        }

        // Matches backend schema:
        // { deliveryPartnerId: string (ObjectId), note?: string }
        const payload = {
            deliveryPartnerId: selectedPartnerId,
            ...(note.trim() ? { note: note.trim() } : {}),
        };

        setIsAssigning(true);
        const toastId = toast.loading("Assigning partner...");

        try {
            const result = await assignPartnerToOrder(orderId, payload);

            if (result?.success) {
                toast.success(result.message || "Partner assigned successfully", {
                    id: toastId,
                });
                setSelectedPartnerId(null);
                setNote("");
                router.refresh();
                // optional: redirect somewhere
                // router.push(`/admin/all-orders/${orderId}`);
            } else {
                toast.error(result?.message || "Failed to assign partner", {
                    id: toastId,
                });
            }
        } catch (err) {
            console.error(err);
            toast.error("Something went wrong while assigning partner", {
                id: toastId,
            });
        } finally {
            setIsAssigning(false);
        }
    };

    const getFullName = (name: Partner["name"]) =>
        `${name?.firstName || ""} ${name?.lastName || ""}`.trim() || "Unknown";

    return (
        <div className="space-y-6">
            {/* Header info */}
            <TitleHeader
                title={t("nearby_delivery_partners")}
                subtitle={`${t("order")} ${nearbyPartners.orderId} ${nearbyPartners.totalAvailablePartners}
                        ${nearbyPartners.totalAvailablePartners > 1 ? t("partners") : t("partner_sm")} ${t("within")} 
                        ${nearbyPartners.searchRadiusKm} ${t("km")}`}
                extraComponent={
                    <>
                        <Badge
                            variant="secondary"
                            className="bg-amber-50 text-amber-700 border-amber-200"
                        >
                            {nearbyPartners.orderStatus?.replace(/_/g, " ")}
                        </Badge>
                    </>
                }
            />

            {
                partners?.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                        <Bike className="h-12 w-12 mb-3 opacity-40" />
                        <p className="text-sm font-medium">{t("no_nearby_partners_found")}</p>
                        <p className="text-xs mt-1">
                            {t("search_radius")}: {nearbyPartners?.searchRadiusKm ?? 5} {t("km")}
                        </p>
                    </div>
                )
            }
            {/* Partners list */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {partners.map((partner) => {
                    const isSelected = selectedPartnerId === partner.deliveryPartnerId;

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
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    {/* Avatar */}
                                    <div className="relative h-12 w-12 shrink-0 rounded-full overflow-hidden bg-muted">
                                        {partner.profilePhoto ? (
                                            <Image
                                                src={partner.profilePhoto}
                                                alt={getFullName(partner.name)}
                                                fill
                                                className="object-cover"
                                                sizes="48px"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center">
                                                <User className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0 space-y-1">
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

                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
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

                                {/* Select button */}
                                <div className="mt-3 flex justify-end">
                                    <Button
                                        size="sm"
                                        variant={isSelected ? "default" : "outline"}
                                        className={cn(
                                            "h-8 text-xs",
                                            isSelected &&
                                            "bg-[#DC3173] hover:bg-[#DC3173]/90 text-white"
                                        )}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleSelect(partner.deliveryPartnerId);
                                        }}
                                    >
                                        {isSelected ? t("selected") : t("select")}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Assign section */}
            {partners?.length !== 0 && <Card className="border-border/60 sticky bottom-4 z-10 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80 shadow-md">
                <CardContent className="p-4 space-y-3">
                    {selectedPartner && (
                        <div className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-[#DC3173]" />
                            <span>
                                {t("selected")}:{" "}
                                <span className="font-semibold">
                                    {getFullName(selectedPartner.name)}
                                </span>
                                <span className="text-muted-foreground ml-1">
                                    ({selectedPartner.distanceKm.toFixed(2)} {t("km_away")})
                                </span>
                            </span>
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">
                            {t("note")} (optional)
                        </label>
                        <Textarea
                            placeholder={t("add_a_note_for_assignment")}
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            maxLength={500}
                            rows={2}
                            className="resize-none text-sm"
                        />
                        <p className="text-[10px] text-muted-foreground text-right">
                            {note.length}/500
                        </p>
                    </div>

                    <Button
                        onClick={handleAssign}
                        disabled={!selectedPartnerId || isAssigning}
                        className="w-full h-11 bg-[#DC3173] hover:bg-[#DC3173]/90 text-white gap-2"
                    >
                        {isAssigning ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                {t("assigning")}...
                            </>
                        ) : (
                            t("assign_partner")
                        )}
                    </Button>
                </CardContent>
            </Card>}
        </div>
    );
};

export default NearbyPartners;