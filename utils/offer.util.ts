import { TOffer } from "@/types/offer.type";

export type TOfferStatus = "ACTIVE" | "INACTIVE" | "EXPIRED" | "SCHEDULED";

/**
 * An offer an admin created on behalf of a store (not global, not made by the vendor).
 * If your API marks this differently, change it here and every screen follows.
 */
export const isAdminCreatedVendorOffer = (offer: TOffer): boolean =>
    !!offer.adminId && !offer.isGlobal;

/** Legacy BOGO offers can't be edited with the new form */
export const canAdminEditVendorOffer = (offer: TOffer): boolean =>
    isAdminCreatedVendorOffer(offer) && offer.offerType !== "BOGO";

export const isFirstOrderOffer = (offer: TOffer): boolean =>
    offer.eligibility?.type === "FIRST_ORDER";

/** Id from either a plain id or a populated document */
export const toId = (value: unknown): string =>
    typeof value === "string"
        ? value
        : ((value as { _id?: string } | null)?._id ?? "");

export function getOfferStatus(offer: TOffer): TOfferStatus {
    const now = new Date();
    if (new Date(offer.expiresAt) < now) return "EXPIRED";
    if (!offer.isActive) return "INACTIVE";
    if (new Date(offer.validFrom) > now) return "SCHEDULED";
    return "ACTIVE";
}

export function formatOfferDiscount(offer: TOffer): string {
    switch (offer.offerType) {
        case "PERCENT":
            return `${offer.discountValue ?? 0}% off`;
        case "FLAT":
            return `€${offer.discountValue ?? 0} off`;
        case "BUY_AND_REWARD": {
            const b = offer.buyAndReward;
            return b
                ? `Buy ${b.buy.quantity}, get ${b.reward.quantity} free`
                : "Buy & Reward";
        }
        case "BOGO":
            return `Buy ${offer.bogo?.buyQty} get ${offer.bogo?.getQty}`;
        default:
            return "";
    }
}