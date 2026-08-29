export type TVendorDocKey =
  | "myPhoto"
  | "businessLicenseDoc"
  | "taxDoc"
  | "idProofFront"
  | "idProofBack"
  | "storePhoto"
  | "menuUpload"
  | "agoserisHaccpCertificate"
  | "ibanProof";

export type TFleetDocKey =
  | "myPhoto"
  | "businessLicense"
  | "idProofFront"
  | "idProofBack"
  | "proofOfAddress"
  | "activityDocument"
  | "ibanProof";

export type TPartnerDocKey =
  | "idProofFront"
  | "idProofBack"
  | "drivingLicenseFront"
  | "drivingLicenseBack"
  | "vehicleRegistration"
  | "criminalRecordCertificate"
  | "activity"
  | "insurancePolicy"
  | "myPhoto"
  | "ibanProof";

export type TFilePreview = {
  file: File | null;
  url: string | null;
  isImage: boolean;
};

export const PARTNER_REQUIRED_DOCS: TPartnerDocKey[] = [
  "myPhoto",
  "idProofFront",
  "idProofBack",
  "drivingLicenseFront",
  "drivingLicenseBack",
  "vehicleRegistration",
  "criminalRecordCertificate",
  "activity",
  "insurancePolicy",
  "ibanProof",
];

export const FLEET_REQUIRED_DOCS: TFleetDocKey[] = [
  "businessLicense",
  "proofOfAddress",
  "activityDocument",
  "ibanProof"
];


const FLEET_OPTIONAL_DOCS: TFleetDocKey[] = [
  "myPhoto",
  "idProofFront",
  "idProofBack",
]