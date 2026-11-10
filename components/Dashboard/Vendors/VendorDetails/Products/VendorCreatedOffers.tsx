"use client";

import {
    AdminOfferBadge,
    FirstOrderBadge,
    OfferStatusBadge,
    OfferTypeIcon,
    STATUS_STYLES,
} from "./OfferBadges";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";
import { TOffer } from "@/types/offer.type";
import {
    formatOfferDiscount,
    getOfferStatus,
    isAdminCreatedVendorOffer,
    isFirstOrderOffer,
    TOfferStatus,
} from "@/utils/offer.util";
import { differenceInCalendarDays, format } from "date-fns";
import { CalendarClock, Plus, Ticket, Users, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import VendorProductActionsMenu from "./VendorProductActionsMenu";

const PRIMARY = "#DC3173";

interface IProps {
    offerData: TOffer[];
    vendorId: string;
}

function timeLeft(offer: TOffer, status: TOfferStatus): string {
    const now = new Date();
    if (status === "EXPIRED") return "Expired";
    if (status === "SCHEDULED") {
        const d = differenceInCalendarDays(new Date(offer.validFrom), now);
        return d <= 1 ? "Starts tomorrow" : `Starts in ${d} days`;
    }
    const d = differenceInCalendarDays(new Date(offer.expiresAt), now);
    if (d <= 0) return "Ends today";
    return d === 1 ? "1 day left" : `${d} days left`;
}

const VendorCreatedOffers = ({ offerData, vendorId }: IProps) => {
    const { t, lang } = useTranslation();
    const router = useRouter();

    const typeLabel = (offer: TOffer) =>
        offer.offerType === "PERCENT"
            ? t("percentage_offer")
            : offer.offerType === "FLAT"
                ? t("flat_offer")
                : offer.offerType === "BUY_AND_REWARD"
                    ? "Buy & Reward"
                    : t("bogo_offer");

    return (
        <>
            <TitleHeader
                title={t("created_offers")}
                subtitle={t("manage_all_offers_here")}
                onBackClick={() => router.back()}
                extraComponent={
                    <VendorProductActionsMenu vendorId={vendorId} hide={["offers"]} />
                }
            />

            {offerData?.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {offerData.map((offer) => {
                        const status = getOfferStatus(offer);
                        const dimmed = status === "EXPIRED";
                        const cap =
                            offer.offerType === "PERCENT" && offer.maxDiscountAmount
                                ? `up to €${offer.maxDiscountAmount}`
                                : null;

                        return (
                            <Card
                                key={offer._id}
                                className={cn(
                                    "relative overflow-hidden rounded-2xl border bg-white shadow-sm transition-shadow hover:shadow-md",
                                    dimmed && "opacity-70",
                                )}
                            >
                                <div
                                    className={cn(
                                        "absolute inset-y-0 left-0 w-1",
                                        STATUS_STYLES[status].bar,
                                    )}
                                />
                                <CardContent className="space-y-4 p-5 pl-6">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <OfferTypeIcon type={offer.offerType} />
                                            <div className="min-w-0">
                                                <h3 className="truncate font-semibold text-gray-900">
                                                    {offer.title?.[lang] || offer.title?.en || "-"}
                                                </h3>
                                                <p className="text-sm text-gray-500">{typeLabel(offer)}</p>
                                            </div>
                                        </div>
                                        <OfferStatusBadge status={status} />
                                    </div>

                                    <div className="flex items-baseline justify-between gap-3">
                                        <p
                                            className="text-2xl font-bold tracking-tight"
                                            style={{ color: PRIMARY }}
                                        >
                                            {formatOfferDiscount(offer)}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {[
                                                cap,
                                                offer.minOrderAmount
                                                    ? `min. order €${offer.minOrderAmount}`
                                                    : null,
                                            ]
                                                .filter(Boolean)
                                                .join(", ")}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2">
                                        {offer.isAutoApply ? (
                                            <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                                                <Zap size={12} /> Auto-applied
                                            </span>
                                        ) : (
                                            offer.code && (
                                                <span className="inline-flex items-center gap-1 rounded-md border border-dashed border-gray-300 px-2 py-1 font-mono text-xs text-gray-700">
                                                    <Ticket size={12} /> {offer.code}
                                                </span>
                                            )
                                        )}
                                        {isAdminCreatedVendorOffer(offer) && <AdminOfferBadge />}
                                        {isFirstOrderOffer(offer) && (
                                            <FirstOrderBadge scope={offer.eligibility?.scope} />
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between border-t pt-3 text-xs text-gray-500">
                                        <span className="flex items-center gap-1.5">
                                            <CalendarClock size={14} />
                                            {offer.validFrom ? format(offer.validFrom, "dd MMM yyyy") : "N/A"}
                                            {" to "}
                                            {offer.expiresAt ? format(offer.expiresAt, "dd MMM yyyy") : "N/A"}
                                        </span>
                                        <span className="flex items-center gap-3">
                                            <span className="flex items-center gap-1">
                                                <Users size={13} /> {offer.usageCount ?? 0} used
                                            </span>
                                            <span className="font-medium text-gray-700">
                                                {timeLeft(offer, status)}
                                            </span>
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-gray-300 bg-gray-50/60 px-6 py-14 text-center">
                    <p className="font-medium text-gray-800">{t("no_offers_created")}</p>
                    <p className="max-w-sm text-sm text-gray-500">
                        Offers you create for this store will show up here.
                    </p>
                    <Button
                        className="mt-1 gap-2 text-white"
                        style={{ background: PRIMARY }}
                        onClick={() =>
                            router.push(`/admin/vendor/${vendorId}/products/offers/create-new`)
                        }
                    >
                        <Plus size={16} />
                        {t("create_new_offer") || "Create New Offer"}
                    </Button>
                </div>
            )}

            {offerData?.length > 0 && (
                <div className="mt-4 text-center">
                    <Link
                        className="text-sm font-medium text-[#DC3173] hover:underline"
                        href={`/admin/vendor/offers/${vendorId}`}
                    >
                        {t("view_all")}
                    </Link>
                </div>
            )}
        </>
    );
};

export default VendorCreatedOffers;