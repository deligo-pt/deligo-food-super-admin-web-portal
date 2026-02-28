import { USER_STATUS } from "@/consts/user.const";

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
  };

  businessLocation?: {
    street: string;
    city: string;
    state: string;
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
    bankName: string;
    accountHolderName: string;
    iban: string;
    swiftCode: string;
  };

  // ---------------------------------------------
  // Documents & Verification
  // ---------------------------------------------
  documents?: {
    idProof?: string;
    businessLicense?: string;
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
  role: "VENDOR";
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
    businessType: string;
    businessLicenseNumber?: string;
    NIF?: string;
    totalBranches: number;

    openingHours?: string; // "09:00 AM"
    closingHours?: string; // "11:00 PM"
    closingDays?: string[]; // ["Friday", "Holidays"]
  };

  // --------------------------------------------------------
  // Business Location
  // --------------------------------------------------------
  businessLocation?: {
    street: string;
    city: string;
    state: string;
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
    bankName: string;
    accountHolderName: string;
    iban: string;
    swiftCode: string;
  };

  // --------------------------------------------------------
  // Documents & Verification
  // --------------------------------------------------------
  documents?: {
    businessLicenseDoc?: string;
    taxDoc?: string;
    idProof?: string;
    storePhoto?: string;
    menuUpload?: string;
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
