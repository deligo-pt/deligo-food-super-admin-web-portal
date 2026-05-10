export type TVendorDocKey =
  | "businessLicenseDoc"
  | "taxDoc"
  | "idProofFront"
  | "idProofBack"
  | "storePhoto"
  | "menuUpload";

export type TFleetDocKey =
  | "myPhoto"
  | "businessLicense"
  | "idProofFront"
  | "idProofBack";

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
