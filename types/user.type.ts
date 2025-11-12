import { USER_STATUS } from "@/consts/user.const";

export type TUser = {
  _id?: string;
  userId: string;
  email: string;
  status: keyof typeof USER_STATUS;
  isEmailVerified: boolean;
  isDeleted: boolean;

  // fcm token for push notifications
  fcmTokens?: string[];

  // OTP Details
  otp?: string;
  isOtpExpired?: Date | string;

  // Personal Details
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
    postalCode?: string;
    country?: string;
  };

  passwordChangedAt?: Date | string;

  // Bank & Payment Information
  bankDetails?: {
    bankName: string;
    accountHolderName: string;
    iban: string;
    swiftCode: string;
  };

  // Documents & Verification
  documents?: {
    idProof?: string;
    companyLicense?: string;
    profilePhoto?: string;
  };

  // Admin & Audit Fields
  approvedBy?: string;
  rejectedBy?: string;
  remarks?: string;

  createdAt: Date;
  updatedAt: Date;
};

export type TAgent = TUser & {
  role: "FLEET_MANAGER";

  //  Company Details
  companyDetails?: {
    companyName: string;
    companyLicenseNumber?: string;
  };
  // Company Location
  companyLocation?: {
    streetAddress: string;
    streetNumber: string;
    city: string;
    postalCode: string;
    latitude?: number;
    longitude?: number;
    geoAccuracy?: number; // meters
  };
  // Bank & Payment Information

  // Operation Data
  operationalData?: {
    noOfDrivers: number;
    activeVehicles?: number;
    totalDeliveries?: number;
    rating?: {
      average: number;
      totalReviews: number;
    };
  };

  // Security & Access Control
  twoFactorEnabled?: boolean;
  loginDevices?: { deviceId: string; lastLogin: Date | string }[];
};

export type TVendor = TUser & {
  role: "VENDOR";

  // Rating & Activity
  rating?: {
    average: number;
    totalReviews: number;
  };
  totalOrders?: number;
  lastLoginAt?: Date | string;

  // Business Details
  businessDetails?: {
    businessName: string;
    businessType: string;
    businessLicenseNumber?: string;
    NIF?: string;
    noOfBranch: number;
    openingHours?: string; // e.g. "09:00 AM"
    closingHours?: string; // e.g. "11:00 PM"
    closingDays?: string[]; // ["Friday", "Public Holidays"]
  };

  // Business Location
  businessLocation?: {
    streetAddress: string;
    streetNumber: string;
    city: string;
    postalCode: string;
    latitude?: number;
    longitude?: number;
    geoAccuracy?: number; // meters
  };

  // Security & Access Control
  twoFactorEnabled?: boolean;
  loginDevices?: { deviceId: string; lastLogin: Date | string }[];
};

export type TUserQueryParams = {
  page?: number;
  limit?: number;
  searchTerm?: string;
  // status?: string;
  sortBy?: string;
};
