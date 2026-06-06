export type TVendorDocKey =
  | "businessLicenseDoc"
  | "taxDoc"
  | "idProofFront"
  | "idProofBack"
  | "storePhoto"
  | "menuUpload"
  | "agoserisHaccpCertificate";

export type TFleetDocKey =
  | "myPhoto"
  | "businessLicense"
  | "idProofFront"
  | "idProofBack"
  | "proofOfAddress"
  | "activityDocument";

export type TPartnerDocKey =
  | "idProofFront"
  | "idProofBack"
  | "drivingLicenseFront"
  | "drivingLicenseBack"
  | "vehicleRegistration"
  | "criminalRecordCertificate"
  | "activity"
  | "insurancePolicy"
  | "myPhoto";

export type TFilePreview = {
  file: File | null;
  url: string | null;
  isImage: boolean;
};
