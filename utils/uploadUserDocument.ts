import { TResponse } from "@/types";
import { catchAsync } from "@/utils/catchAsync";
import { updateData } from "@/utils/requests";
import { uploadImagesReq } from "@/services/upload/upload.service";
import { updateDocumentsReq } from "@/services/auth/register-user.service";
import { TVendorDocKey } from "@/types/document.type";

export const uploadUserDocumentsReq = async (
  endPoint: string,
  key: string,
  file: Blob,
) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("data", JSON.stringify({ docImageTitle: key }));

  return catchAsync<null>(async () => {
    return (await updateData(endPoint, {
      data: formData,
    })) as unknown as TResponse<null>;
  });
};

// Mirrors UploadDocuments.tsx's DEFAULT_DOC_IMAGES + uploadDefaultDocument
const DEFAULT_DOC_IMAGES: Partial<Record<TVendorDocKey, string>> = {
  myPhoto: "/defaults/my-photo.png",
  storePhoto: "/defaults/store-photo.jpg",
  menuUpload: "/defaults/menu.jpg",
};

export const uploadDefaultDocument = async (key: TVendorDocKey, userId: string) => {
  const imagePath = DEFAULT_DOC_IMAGES[key];
  if (!imagePath) return;

  const response = await fetch(imagePath, { cache: "no-store" });
  const blob = await response.blob();

  if (blob.size === 0) {
    throw new Error(`Default image for ${key} fetched with 0 bytes — check the asset path`);
  }

  const file = new window.File(
    [blob],
    imagePath.split("/").pop() ?? "default.png",
    { type: blob.type || "image/png" }
  );

  const uploadResult = await uploadImagesReq([file]);

  if (!uploadResult.success || !uploadResult.data?.[0]) {
    throw new Error(uploadResult.message || `Failed to upload default ${key}`);
  }

  const endpoint = `/vendors/${userId}/docImage`;
  const updateResult = await updateDocumentsReq(endpoint, {
    docImageTitle: key,
    docImageUrls: [uploadResult.data[0]],
  });

  if (!updateResult.success) {
    throw new Error(updateResult.message || `Failed to save default ${key}`);
  }

  return uploadResult.data[0];
};