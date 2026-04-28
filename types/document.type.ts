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

export type TFilePreview = {
  file: File | null;
  url: string | null;
  isImage: boolean;
};
