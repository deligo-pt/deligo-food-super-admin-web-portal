import { USER_STATUS } from "@/consts/user.const";
import { TGeoJSONPoint } from ".";

export type TVehicleType =
  | "BICYCLE"
  | "E-BIKE"
  | "SCOOTER"
  | "MOTORBIKE"
  | "CAR";

export const currentStatusOptions = {
  IDLE: "IDLE",
  OFFLINE: "OFFLINE",
  ON_DELIVERY: "ON_DELIVERY",
} as const;

export type TDeliveryPartner = {
  // -------------------------------------------------
  // Core Identifiers
  // -------------------------------------------------
  _id?: string;
  userId: string;
  registeredBy?: {
    id: {
      name: {
        firstName: string;
        lastName: string;
      },
      userId: string;
    }
  };
  role: "DELIVERY_PARTNER";
  email: string;
  status: keyof typeof USER_STATUS;
  isEmailVerified: boolean;
  isDeleted: boolean;
  isUpdateLocked: boolean;
  currentFleetManagerId?: {
    businessDetails: {
      businessName: string;
    },
    role: string;
    userId: string;
    _id: string;
  };

  // FCM tokens
  fcmTokens?: string[];

  // --------------------------------------------------------
  // Pending temporary Email and contact number
  // --------------------------------------------------------
  pendingEmail?: string;
  pendingContactNumber?: string;

  // ------------------------------------------------------
  // OTP & Password Reset
  // ------------------------------------------------------
  otp?: string;
  isOtpExpired?: string;
  requiresOtpVerification?: boolean;

  passwordResetToken?: string;
  passwordResetTokenExpiresAt?: string;
  passwordChangedAt?: Date;

  // -------------------------------------------------
  // 1) Personal Information
  // -------------------------------------------------
  name?: {
    firstName?: string;
    lastName?: string;
  };
  contactNumber?: string;
  profilePhoto?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    latitude?: number;
    longitude?: number;
    geoAccuracy?: number;
  };
  currentSessionLocation: TGeoJSONPoint;
  personalInfo?: {
    dateOfBirth?: string;
    gender?: "MALE" | "FEMALE" | "OTHER";
    nationality?: string;

    NIF?: string;
    citizenCardNumber?: string;
    passportNumber?: string;
    idExpiryDate?: string;
  };

  // -------------------------------------------------
  // 2) Legal Status / Work Rights
  // -------------------------------------------------
  legalStatus?: {
    residencePermitType?: string;
    residencePermitNumber?: string;
    residencePermitExpiry?: string;
  };

  // -------------------------------------------------
  // 3) Payment & Banking Details
  // -------------------------------------------------
  bankDetails?: {
    bankName?: string;
    accountHolderName?: string;
    iban?: string;
    swiftCode?: string;
  };

  // -------------------------------------------------
  // 4) Vehicle Information
  // -------------------------------------------------
  vehicleInfo?: {
    vehicleType?: TVehicleType;
    brand?: string;
    model?: string;
    licensePlate?: string;

    drivingLicenseNumber?: string;
    drivingLicenseExpiry?: string;

    insurancePolicyNumber?: string;
    insuranceExpiry?: string;
  };

  // -------------------------------------------------
  // 5) Criminal Background
  // -------------------------------------------------
  criminalRecord?: {
    certificate?: boolean;
    issueDate?: string;
    expiryDate?: string;
  };

  // -------------------------------------------------
  // 6) Work Preferences & Equipment
  // -------------------------------------------------
  workPreferences?: {
    preferredZones?: string[];
    preferredHours?: string[];
    hasEquipment?: {
      isothermalBag?: boolean;
      helmet?: boolean;
      powerBank?: boolean;
    };
    workedWithOtherPlatform?: boolean;
    otherPlatformName?: string;
  };

  // -------------------------------------------------
  // 7) Operational Statistics
  // -------------------------------------------------
  operationalData?: {
    totalDeliveries?: number;
    completedDeliveries?: number;
    canceledDeliveries?: number;

    totalOfferedOrders?: number;
    totalAcceptedOrders?: number;
    totalRejectedOrders?: number;
    totalDeliveryMinutes?: number;

    currentStatus: keyof typeof currentStatusOptions; // Current working state (IDLE, ON_DELIVERY, OFFLINE)
    assignmentZoneId: string;
    currentZoneId?: string; // DeliGo Zone ID (e.g., 'Lisbon-Zone-02')
    currentOrderId?: string; // List of active order IDs they are currently fulfilling
    capacity: number; // Max number of orders the driver can carry (e.g., 2 or 3)
    isWorking: boolean; // Simple flag: Clocked in/out

    lastActivityAt?: Date;
  };

  // -------------------------------------------------
  // 8) Earnings Summary
  // -------------------------------------------------
  earnings?: {
    totalEarnings?: number;
    pendingEarnings?: number;
  };

  // -------------------------------------------------
  // 9) Documents
  // -------------------------------------------------
  documents?: {
    idProofFront?: string;
    idProofBack?: string;
    drivingLicenseFront?: string;
    drivingLicenseBack?: string;
    vehicleRegistration?: string;
    criminalRecordCertificate?: string;
    activity?: string;
    insurancePolicy?: string;
    myPhoto?: string;
    ibanProof?: string;
  };

  // -------------------------------------------------
  // 11) Admin Workflow (Approval System)
  // -------------------------------------------------
  approvedBy?: string;
  rejectedBy?: string;
  blockedBy?: string;
  submittedForApprovalAt?: Date;
  approvedOrRejectedOrBlockedAt?: Date;
  remarks?: string;

  rating?: {
    average: number;
    totalReviews: number;
  };

  // -------------------------------------------------
  // Timestamps
  // -------------------------------------------------
  createdAt: Date;
  updatedAt: Date;
};

export type TDeliveryPartnersQueryParams = {
  limit?: number;
  page?: number;
  searchTerm?: string;
  sortBy?: string;
  status?: string;
};

export type TDeliveryPartnerActivityType =
  | "pickup"
  | "delivery"
  | "online"
  | "offline"
  | "break"
  | "location";

export type TDeliveryPartnerActivity = {
  _id: string;
  type: TDeliveryPartnerActivityType;
  description: string;
  timestamp: Date;
  location?: string;
  createdAt: string;
  updatedAt: string;
};
