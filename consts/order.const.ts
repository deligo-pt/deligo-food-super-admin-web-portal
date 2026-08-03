export const ORDER_STATUS = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
  PREPARING: "PREPARING",
  READY_FOR_PICKUP: "READY_FOR_PICKUP",
  AWAITING_PARTNER: "AWAITING_PARTNER",
  DISPATCHING: "DISPATCHING",
  ASSIGNED: "ASSIGNED",
  REASSIGNMENT_NEEDED: "REASSIGNMENT_NEEDED",
  PICKED_UP: "PICKED_UP",
  ON_THE_WAY: "ON_THE_WAY",
  DELIVERED: "DELIVERED",
  CANCELED: "CANCELED",
};

export const REFUND_STATUS = {
  NOT_APPLICABLE: 'NOT_APPLICABLE', // no refund was ever owed for this order
  PENDING: 'PENDING', // refund owed, gateway call not attempted/completed yet
  REFUNDED: 'REFUNDED', // gateway refund (or void) succeeded
  FAILED: 'FAILED', // refund was owed but the gateway call failed
};

export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  PAID: 'PAID',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
};