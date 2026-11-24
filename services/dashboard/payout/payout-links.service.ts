"use server";

import { getSingleDeliveryPartnerReq } from "@/services/dashboard/delivery-partner/delivery-partner.service";
import { getSingleOrderReq } from "@/services/dashboard/order/order.service";
import { getSingleVendorReq } from "@/services/dashboard/vendor/vendor.service";
import { TDeliveryPartner } from "@/types/delivery-partner.type";
import { TOrder } from "@/types/order.type";
import { TPayout, TPayoutFleetManager, TPayoutRider } from "@/types/payout.type";
import { TVendor } from "@/types/user.type";

/** Orders looked up at the same time, so a large payout doesn't flood the API. */
const BATCH = 5;

/**
 * The rider's current fleet manager (business name). Null when the rider has
 * none or the lookup fails — the page then shows nothing.
 */
export const getRiderFleetManagerReq = async (
  riderUserId: string,
): Promise<TPayoutFleetManager | null> => {
  if (!riderUserId) return null;
  const rider = (await getSingleDeliveryPartnerReq(riderUserId)) as Partial<TDeliveryPartner>;
  const fm = rider?.currentFleetManagerId;
  if (!fm?.userId) return null;
  return { userId: fm.userId, businessName: fm.businessDetails?.businessName || fm.userId };
};

/**
 * orderId → rider who delivered it. The payout's includedOrders don't carry
 * the rider, so each order is read with GET /orders/:id. Orders that fail to
 * load are left out (shown under "Unknown rider").
 * TODO(backend): drop this once includedOrders[] carries deliveryPartnerId.
 */
export const getOrderRidersReq = async (
  orderIds: string[],
): Promise<Record<string, TPayoutRider>> => {
  const riders: Record<string, TPayoutRider> = {};
  const ids = [...new Set(orderIds.filter(Boolean))];
  for (let i = 0; i < ids.length; i += BATCH) {
    const chunk = ids.slice(i, i + BATCH);
    const orders = await Promise.all(
      chunk.map((id) => getSingleOrderReq(id) as Promise<Partial<TOrder>>),
    );
    orders.forEach((order, idx) => {
      const dp = order?.deliveryPartnerId;
      if (!dp?.userId) return;
      riders[chunk[idx]] = {
        userId: dp.userId,
        name: [dp.name?.firstName, dp.name?.lastName].filter(Boolean).join(" ") || dp.userId,
      };
    });
  }
  return riders;
};

/**
 * Vendor payouts with the shop's name on `userId.shopName`. The payouts API
 * sends only the owner's name, so each vendor on the page (≈10) is read with
 * GET /vendors/:userId, BATCH at a time, once per vendor. A branch (`SV-…`)
 * shows its branch name ("Tasca do Bairro Thakurgaon"). A failed lookup
 * leaves the payout as it was, and the table falls back to the owner's name.
 * TODO(backend): drop this once payouts carry businessDetails.businessName.
 */
export const withVendorShopNames = async (payouts: TPayout[]): Promise<TPayout[]> => {
  const ids = [
    ...new Set(
      payouts
        .filter((p) => p?.userModel === "Vendor" && p.userId?.userId)
        .map((p) => p.userId.userId),
    ),
  ];
  const names: Record<string, string> = {};
  for (let i = 0; i < ids.length; i += BATCH) {
    const chunk = ids.slice(i, i + BATCH);
    const vendors = await Promise.all(
      chunk.map((id) => getSingleVendorReq(id) as Promise<Partial<TVendor>>),
    );
    vendors.forEach((vendor, idx) => {
      const details = vendor?.businessDetails;
      const name = details?.branchName?.trim() || details?.businessName?.trim();
      if (name) names[chunk[idx]] = name;
    });
  }
  return payouts.map((p) =>
    p?.userId?.userId && names[p.userId.userId]
      ? { ...p, userId: { ...p.userId, shopName: names[p.userId.userId] } }
      : p,
  );
};
