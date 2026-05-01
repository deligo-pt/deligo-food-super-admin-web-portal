import { TDeliveryPartner } from "@/types/delivery-partner.type";
import { TAgent, TVendor } from "@/types/user.type";

export type TPayout = {
  _id: string;
  payoutId: string;
  userId: {
    userId: string;
    name: {
      firstName: string;
      lastName: string;
    };
    profilePhoto: string;
    bankDetails: {
      iban: string;
      accountHolderName: string;
      accountNumber: string;
      bankName: string;
      swiftCode: string;
    };
  };
  userModel: "Vendor" | "DeliveryPartner" | "FleetManager";

  senderId: unknown;
  senderModel: "Admin" | "FleetManager";

  startDate: Date;
  endDate: Date;
  paymentDate?: Date;

  amount: number;
  status: "PENDING" | "PAID";
  paymentMethod: "BANK_TRANSFER" | "MOBILE_BANKING" | "CASH";
  bankDetails?: {
    bankName: string;
    accountHolderName: string;
    accountNumber: string;
    iban?: string;
    swiftCode?: string;
  };
  bankReferenceId?: string;
  payoutProof?: string;
  remarks?: string;

  failedAt?: Date;
  failedReason?: string;

  retryAt?: Date;
  retryRemarks?: string;

  createdAt: Date;
  updatedAt: Date;
};

// export type TPayout = {
//   _id: string;
//   payoutId: string;

//   amount: number;

//   status: "PENDING" | "PROCESSING" | "PAID" | "FAILED";
//   paymentMethod: "BANK_TRANSFER" | "MOBILE_BANKING" | "CASH";

//   bankReferenceId: string;

//   payoutCategory: string;
//   remarks: string;

//   payoutProof: string;

//   userId: {
//     userId: string;
//     name: {
//       firstName: string;
//       lastName: string;
//     };
//     email: string;
//     profilePhoto: string;
//     bankDetails: {
//       iban: string;
//       accountHolderName: string;
//       bankName: string;
//       swiftCode: string;
//     };
//   };

//   userModel: "Vendor" | "DeliveryPartner" | "FleetManager";

//   createdAt: string;
//   updatedAt: string;
// };

export type TVendorPayout = TPayout & {
  userId: TVendor;
};

export type TFleetManagerPayout = TPayout & {
  userId: TAgent;
};

export type TDeliveryPartnerPayout = TPayout & {
  userId: TDeliveryPartner;
};
