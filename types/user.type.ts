import { USER_STATUS } from "@/consts/user.const";

export type TWeekday =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export interface TClockPeriod {
  open: string; // "HH:mm" 24-hour, e.g. "12:00"
  close: string; // "HH:mm" or "24:00" (end of day)
}

export interface TWeeklyDaySchedule {
  day: TWeekday; // English, capitalized, exactly as above
  periods: TClockPeriod[]; // [] means CLOSED all day
}

export type TAgent = {
  // ---------------------------------------------
  // Core Identifiers
  // ---------------------------------------------
  _id: string;
  userId: string;
  role: "FLEET_MANAGER";
  email: string;

  status: keyof typeof USER_STATUS;
  isEmailVerified: boolean;
  isDeleted: boolean;
  isUpdateLocked: boolean;

  // Push notifications
  fcmTokens?: string[];

  // ---------------------------------------------
  // OTP & Password Reset
  // ---------------------------------------------
  otp?: string;
  isOtpExpired?: Date;

  passwordResetToken?: string;
  passwordResetTokenExpiresAt?: Date;
  passwordChangedAt?: Date;

  // ---------------------------------------------
  // Personal Information
  // ---------------------------------------------
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

  // ---------------------------------------------
  // Business Details
  // ---------------------------------------------
  businessDetails?: {
    businessName: string;
    businessLicenseNumber?: string;
    NIF?: string;
  };

  businessLocation?: {
    street: string;
    city: string;
    state?: string;
    country: string;
    postalCode: string;
    latitude?: number;
    longitude?: number;
    geoAccuracy?: number;
  };

  // ---------------------------------------------
  // Bank & Payment Information
  // ---------------------------------------------
  bankDetails?: {
    bankName?: string;
    accountHolderName: string;
    iban: string;
    swiftCode?: string;
  };

  // ---------------------------------------------
  // Documents & Verification
  // ---------------------------------------------
  documents?: {
    idProofFront?: string;
    idProofBack?: string;
    businessLicense?: string;
    myPhoto?: string;
    proofOfAddress?: string;
    activityDocument?: string;
    ibanProof?: string;
  };

  // ---------------------------------------------
  // Operational Data
  // ---------------------------------------------
  operationalData?: {
    totalDrivers: number;
    activeVehicles?: number;
    totalDeliveries?: number;
    rating?: {
      average: number;
      totalReviews: number;
    };
  };

  // ---------------------------------------------
  // Security & Access
  // ---------------------------------------------
  twoFactorEnabled?: boolean;
  lastLoginAt?: Date;

  // ---------------------------------------------
  // Admin Workflow / Audit
  // ---------------------------------------------
  approvedBy?: string;
  rejectedBy?: string;
  blockedBy?: string;

  submittedForApprovalAt?: Date;
  approvedOrRejectedOrBlockedAt?: Date;

  remarks?: string;

  // ---------------------------------------------
  // Timestamps
  // ---------------------------------------------
  createdAt: Date;
  updatedAt: Date;
};

export type TVendor = {
  // --------------------------------------------------------
  // Core Identifiers
  // --------------------------------------------------------
  _id: string;
  userId: string;
  role: "VENDOR" | "SUB_VENDOR";
  email: string;

  status: keyof typeof USER_STATUS;
  isEmailVerified: boolean;
  isDeleted: boolean;
  isUpdateLocked: boolean;

  // Push notifications
  fcmTokens?: string[];

  // --------------------------------------------------------
  // OTP & Password Reset
  // --------------------------------------------------------
  otp?: string;
  isOtpExpired?: Date;

  passwordResetToken?: string;
  passwordResetTokenExpiresAt?: Date;
  passwordChangedAt?: Date;

  // --------------------------------------------------------
  // Personal Information
  // --------------------------------------------------------
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

  // --------------------------------------------------------
  // Business Details
  // --------------------------------------------------------
  businessDetails?: {
    businessName: string;
    companyLegalName?: string;
    branchName?: string;
    businessType: string;
    businessTypeSlug?: string;
    restaurantCuisineType?: string[];
    businessLicenseNumber?: string;
    NIF?: string;
    totalBranches?: number;

    /** Source of truth for opening hours. Absent on vendors that never set one. */
    weeklySchedule?: TWeeklyDaySchedule[];
    /** IANA timezone, e.g. "Europe/Lisbon". Times are store-local wall-clock. */
    timezone?: string;
    isStoreOpen?: boolean;

    /** @deprecated read-only mirror of weeklySchedule (lossy for split shifts). Never write it. */
    openingHours?: string; // "09:00 AM"
    /** @deprecated */
    closingHours?: string; // "11:00 PM"
    /** @deprecated */
    closingDays?: string[]; // ["Friday", "Holidays"]

    availability?: {
      state: "OPEN" | "CLOSED" | "PAUSED" | string;
      isOpen?: boolean;
      reason?: string | null;
      overrideType?: string | null;
      resumeAt?: string | null;
      nextOpenAt?: string | null;
      override?: {
        status: "PAUSED" | "SUSPENDED";
        until: string;
        reason: string;
        isCustomerHidden: boolean;
        setAt?: string;
        setBy?: string;
      } | null;
    } | null;
  };

  // --------------------------------------------------------
  // Business Location
  // --------------------------------------------------------
  businessLocation?: {
    street: string;
    city: string;
    state?: string;
    country: string;
    postalCode: string;
    latitude?: number;
    longitude?: number;
    geoAccuracy?: number;
  };

  // --------------------------------------------------------
  // Banking & Payments
  // --------------------------------------------------------
  bankDetails?: {
    bankName?: string;
    accountHolderName: string;
    iban: string;
    swiftCode?: string;
  };

  // --------------------------------------------------------
  // Documents & Verification
  // --------------------------------------------------------
  documents?: {
    myPhoto?: string[];
    businessLicenseDoc?: string[];
    taxDoc?: string[];
    idProofFront?: string[];
    idProofBack?: string[];
    storePhoto?: string[];
    menuUpload?: string[];
    agoserisHaccpCertificate?: string[];
    ibanProof?: string[];
  };

  // Agreement section
  agreement?: {
    agreementId: string;
    status: "UNSIGNED" | "PARTY_SIGNED" | "SIGNED";
    pdfPath: string;
  };

  // --------------------------------------------------------
  // Security & Access
  // --------------------------------------------------------
  twoFactorEnabled?: boolean;

  // --------------------------------------------------------
  // Rating & Activity
  // --------------------------------------------------------
  rating?: {
    average: number;
    totalReviews: number;
  };

  totalOrders?: number;
  lastLoginAt?: Date;

  // --------------------------------------------------------
  // Admin Workflow / Audit
  // --------------------------------------------------------
  approvedBy?: string;
  rejectedBy?: string;
  blockedBy?: string;
  parentVendorId?: {
    name: {
      firstName: string;
      lastName: string;
    },
    userId: string;
  };

  submittedForApprovalAt?: Date;
  approvedOrRejectedOrBlockedAt?: Date;

  remarks?: string;

  // --------------------------------------------------------
  // Timestamps
  // --------------------------------------------------------
  createdAt: Date;
  updatedAt: Date;
};

export type TCustomer = {
  // ------------------------------------------------------
  // Core Identifiers
  // ------------------------------------------------------
  _id?: string;
  userId: string;
  role: "CUSTOMER";
  email?: string;

  status: keyof typeof USER_STATUS;
  isOtpVerified: boolean;
  isDeleted: boolean;

  // Push notifications
  fcmTokens?: string[];

  // ------------------------------------------------------
  // OTP
  // ------------------------------------------------------
  otp?: string;
  isOtpExpired?: Date;
  requiresOtpVerification?: boolean;
  mobileOtpId?: string;

  // ------------------------------------------------------
  // Personal Information
  // ------------------------------------------------------
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

  // Multiple Saved Delivery Addresses
  deliveryAddresses?: Array<{
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    latitude?: number;
    longitude?: number;
    geoAccuracy?: number;
    isActive: boolean;
    detailedAddress: string;
    zoneId: string;
    addressType: string;
    customAddressType: string;
    _id: string;
  }>;

  // ------------------------------------------------------
  // Orders & Activity
  // ------------------------------------------------------
  orders: {
    totalOrders?: number;
    totalSpent?: number;
    lastOrderDate?: Date;
    lastLoginAt?: Date;
  };

  // ------------------------------------------------------
  // Security & Access
  // ------------------------------------------------------
  twoFactorEnabled?: boolean;
  // loginDevices?: TLoginDevice[];

  // ------------------------------------------------------
  // Referral & Loyalty
  // ------------------------------------------------------
  referralCode?: string;
  loyaltyPoints?: number;

  // ------------------------------------------------------
  // Admin Workflow / Audit
  // ------------------------------------------------------
  approvedBy?: string;
  rejectedBy?: string;
  blockedBy?: string;
  approvedOrRejectedOrBlockedAt?: Date;
  remarks?: string;

  // ------------------------------------------------------
  // Payment Methods
  // ------------------------------------------------------
  paymentMethods?: Array<{
    cardType: string;
    lastFourDigits: string;
    expiryDate: string;
    isDefault: boolean;
  }>;

  // ------------------------------------------------------
  // Timestamps
  // ------------------------------------------------------
  createdAt?: Date;
  updatedAt?: Date;
};

export type TUserQueryParams = {
  page?: number;
  limit?: number;
  searchTerm?: string;
  sortBy?: string;
};

export type TBusinessLocation = {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  geoAccuracy: number;
}