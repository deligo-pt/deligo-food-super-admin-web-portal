import { TDeliveryPartner } from "@/types/delivery-partner.type";
import { TAgent, TVendor } from "@/types/user.type";

export type TIncludedOrder = {
  orderId: string;
  orderCreatedAt: Date | string;
  grossEarnings: number;
  platformDeduction: number;
  taxAmount: number;
  sdrReimbursement: number;
  netPayout: number;
};

export type TPayout = {
  _id: string;
  payoutId: string;

  userId: {
    _id?: string;
    id?: string;
    userId: string;
    name: {
      firstName: string;
      lastName: string;
    };
    profilePhoto?: string;
    role?: string;
    NIF?: string;
    bankDetails?: {
      iban?: string;
      accountHolderName?: string;
      accountNumber?: string;
      bankName?: string;
      swiftCode?: string;
    };
  };

  userModel: "Vendor" | "DeliveryPartner" | "FleetManager";

  senderId?: {
    _id?: string;
    name?: {
      firstName: string;
      lastName: string;
    };
    role?: string;
  };
  senderModel?: "Admin" | "FleetManager" | "SUPER_ADMIN";

  /** Period covered by this payout */
  startDate: Date | string;
  endDate: Date | string;
  paymentDate?: Date | string;

  /** Optional explicit date range (sometimes present) */
  dateRange?: {
    from: Date | string;
    to: Date | string;
  };

  amount: number;
  status: "PENDING" | "PAID" | "FAILED" | "PROCESSING";
  paymentMethod: "BANK_TRANSFER" | "MOBILE_BANKING" | "CASH";

  /** Snapshot of bank details at the time of payout (optional) */
  bankDetails?: {
    bankName?: string;
    accountHolderName?: string;
    accountNumber?: string;
    iban?: string;
    swiftCode?: string;
  };

  bankReferenceId?: string;
  payoutProof?: string;
  remarks?: string;

  /** Orders included in this payout */
  includedOrders?: TIncludedOrder[];

  /** Category of the payout (e.g. GENERAL) */
  payoutCategory?: string;

  failedAt?: Date | string;
  failedReason?: string;

  retryAt?: Date | string;
  retryRemarks?: string;

  createdAt: Date | string;
  updatedAt: Date | string;
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