export type DocKey =
  | "businessLicenseDoc"
  | "taxDoc"
  | "idProofFront"
  | "idProofBack"
  | "storePhoto"
  | "menuUpload";

export type FilePreview = {
  file: File | null;
  url: string | null;
  isImage: boolean;
};
