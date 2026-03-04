import { TDeliveryPartner } from "@/types/delivery-partner.type";
import { TAgent, TVendor } from "@/types/user.type";

export type TPayout = {
  _id: string;
  payoutId: string;

  amount: string;

  bankDetails: {
    iban: string;
    accountHolderName: string;
    bankName: string;
    swiftCode: string;
  };

  status: "PENDING" | "PROCESSING" | "PAID" | "FAILED";
  paymentMethod: "BANK_TRANSFER" | "MOBILE_BANKING" | "CASH";

  bankReferenceId: string;

  payoutCategory: string;
  remarks: string;

  payoutProof: string;

  userId: unknown;
  userModel: "Vendor" | "DeliveryPartner" | "FleetManager";

  createdAt: string;
  updatedAt: string;
};

export type TVendorPayout = TPayout & {
  userId: TVendor;
};

export type TFleetManagerPayout = TPayout & {
  userId: TAgent;
};

export type TDeliveryPartnerPayout = TPayout & {
  userId: TDeliveryPartner;
};
