"use server";

import { getSingleDeliveryPartnerReq } from "@/services/dashboard/delivery-partner/delivery-partner.service";
import { getSingleOrderReq } from "@/services/dashboard/order/order.service";
import { TDeliveryPartner } from "@/types/delivery-partner.type";
import { TOrder } from "@/types/order.type";
import { TPayoutFleetManager, TPayoutRider } from "@/types/payout.type";

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
