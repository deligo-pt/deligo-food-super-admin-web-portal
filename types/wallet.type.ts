import { TDeliveryPartner } from "@/types/delivery-partner.type";
import { TAgent, TCustomer, TVendor } from "@/types/user.type";

export type TWallet = {
  _id: string;
  walletId: string;
  userId: unknown;
  userModel: "Customer" | "Vendor" | "FleetManager" | "DeliveryPartner";
  lastSettlementDate?: string;
  totalUnpaidEarnings: number;
  totalRiderPayable: number;
  totalFleetEarnings: number;
  totalEarnings: number;

  createdAt: string;
  updatedAt: string;
};

export type TVendorWallet = TWallet & {
  userId: TVendor;
};

export type TFleetManagerWallet = TWallet & {
  userId: TAgent;
};

export type TDeliveryPartnerWallet = TWallet & {
  userId: TDeliveryPartner;
};

export type TCustomerWallet = TWallet & {
  userId: TCustomer;
};

export type TWalletDetails = TWallet & {
  userId: {
    userId: string;
    email: string;
    name?: { firstName?: string; lastName?: string };
  };
};
