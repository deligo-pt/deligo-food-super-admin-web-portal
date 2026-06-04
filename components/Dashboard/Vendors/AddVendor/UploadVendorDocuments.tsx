"use client";

import { motion } from "framer-motion";
import {
  Eye,
  File,
  FileText,
  ImageIcon,
  Plus,
  UploadCloud,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef } from "react";

import { useTranslation } from "@/hooks/use-translation";
import {
  deleteDocumentReq,
  updateDocumentsReq,
} from "@/services/auth/register-user.service";
import { uploadImagesReq } from "@/services/upload/upload.service";
import { TVendorDocKey } from "@/types/document.type";
import { toast } from "sonner";
import { TVendor } from "@/types/user.type";

export default function UploadVendorDocuments({
  vendor,
  previews,
  setPreviews,
}: {
  vendor: TVendor | null;
  previews: Record<TVendorDocKey, string[] | null>;
  setPreviews: React.Dispatch<
    React.SetStateAction<Record<TVendorDocKey, string[] | null>>
  >;
}) {
  const { t } = useTranslation();
  const inputsRef = useRef<Record<string, HTMLInputElement | null>>({});

  const DOCUMENTS: {
    key: TVendorDocKey;
    label: string;
    prefersImagePreview: boolean;
  }[] = [
      {
        key: "businessLicenseDoc",
        label: t("business_license"),
        prefersImagePreview: false,
      },
      { key: "taxDoc", label: t("tax_document"), prefersImagePreview: false },
      { key: "idProofFront", label: t("id_proof_front"), prefersImagePreview: true },
      { key: "idProofBack", label: t("id_proof_back"), prefersImagePreview: true },
      { key: "storePhoto", label: t("store_photo"), prefersImagePreview: true },
      { key: "menuUpload", label: t("menu_brochure"), prefersImagePreview: true },
      {
        key: "agoserisHaccpCertificate",
        label: t("agoserisHaccpCertificate"),
        prefersImagePreview: true,
      },
    ];

  const visibleDocuments = DOCUMENTS.filter(
    (doc) => !(vendor?.businessDetails?.businessType === "STORE" && doc.key === "agoserisHaccpCertificate")
  );

  const openPicker = (key: TVendorDocKey) => {
    const el = inputsRef.current[key];
    el?.click();
  };

  const handleFileChange = async (
    key: TVendorDocKey,
    f?: File | null,
  ) => {
    if (!f) return;

    if (inputsRef.current[key]) {
      inputsRef.current[key]!.value = "";
    }

    const toastId = toast.loading("Uploading...");

    const currentFiles = previews[key] || [];

    if (key === "agoserisHaccpCertificate" && currentFiles?.length === 1) {
      toast.error("You can only upload one AGOSERIS HACCP Certificate", {
        id: toastId,
      });
      return;
    } else {
      if (currentFiles?.length === 3) {
        toast.error("You can only upload a maximum of 3 documents", {
          id: toastId,
        });
        return;
      }
    }

    const uploadResult = await uploadImagesReq([f]);

    if (!uploadResult.success) {
      toast.error(uploadResult.message || "File upload failed", {
        id: toastId,
      });
      return;
    }

    const newUrl = uploadResult.data?.[0];

    if (!newUrl) {
      toast.error("Upload failed: no file URL returned", {
        id: toastId,
      });
      return;
    }

    const prevUrls = currentFiles;

    const endpoint = `/vendors/${vendor?.userId}/docImage`;
    const updateResult = await updateDocumentsReq(endpoint, {
      docImageTitle: key,
      docImageUrls: [...prevUrls, newUrl],
    });

    if (!updateResult.success) {
      await deleteDocumentReq(endpoint, {
        docImageTitle: key,
        imageUrl: newUrl,
      });

      toast.error(updateResult.message || "File upload failed", {
        id: toastId,
      });
      return;
    }

    toast.success("File uploaded successfully!", { id: toastId });

    setPreviews((p) => ({
      ...p,
      [key]: [...(p[key] || []), newUrl],
    }));
  };

  const removeFile = async (key: TVendorDocKey, index: number) => {
    const currentFiles = previews[key];

    if (!currentFiles || !currentFiles[index]) return;

    const url = currentFiles[index];

    const toastId = toast.loading("Deleting...");

    const endpoint = `/vendors/${vendor?.userId}/docImage`;
    const result = await deleteDocumentReq(endpoint, {
      docImageTitle: key,
      imageUrl: url,
    });

    if (!result.success) {
      toast.error(result.message || "File deletion failed", {
        id: toastId,
      });
      return;
    }

    toast.success("File deleted successfully!", { id: toastId });

    setPreviews((p) => ({
      ...p,
      [key]: p[key]?.filter((_, i) => i !== index) || null,
    }));

    if (inputsRef.current[key]) {
      inputsRef.current[key]!.value = "";
    }
  };

  useEffect(() => {
    return () => {
      Object.values(previews).forEach((p) => {
        if (p) {
          p.forEach((f) => {
            if (f) URL.revokeObjectURL(f);
          });
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function getActualFileName(url: string): string {
    try {
      const decoded = decodeURIComponent(url);
      const lastSegment = decoded.split("/").pop() || "";
      const match = lastSegment.match(/file-(.+)$/);
      const fileName = match ? match[1] : lastSegment;
      return fileName.length > 10 ? fileName.slice(0, 10) + "..." : fileName;
    } catch {
      return "";
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {visibleDocuments.map((d, idx) => {
        const previewFiles = previews[d.key];
        const isSelected = !(!previewFiles || previewFiles?.length === 0);
        return (
          <motion.div
            key={d.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06 }}
            className={`flex items-center justify-between p-4 border rounded-xl shadow-sm hover:shadow-md transition-all ${isSelected
              ? "border-[#DC3173]/30 bg-[#FFF7FB] w-full"
              : "bg-white"
              }`}
          >
            <div className="flex items-center gap-4 w-full">
              <div
                className={`w-14 h-14 rounded-lg flex items-center justify-center ${isSelected ? "bg-[#DC3173]/10" : "bg-gray-50"
                  }`}
              >
                {d.prefersImagePreview ? (
                  <ImageIcon className="w-6 h-6 text-[#DC3173]" />
                ) : (
                  <FileText className="w-6 h-6 text-[#DC3173]" />
                )}
              </div>

              <div className="min-w-0 w-full">
                <div className="text-sm font-semibold text-gray-800 flex w-full gap-2 justify-between">
                  {d.label}
                  {isSelected && (
                    <button
                      type="button"
                      onClick={() => openPicker(d.key)}
                      className="inline-flex items-center gap-2 p-0 text-sm font-medium text-[#DC3173]  hover:underline"
                    >
                      <Plus className="w-3 h-3 text-[#DC3173]" /> Add More
                    </button>
                  )}

                  <input
                    ref={(el) => {
                      inputsRef.current[d.key] = el;
                    }}
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={(e) =>
                      handleFileChange(
                        d.key,
                        e.target.files ? e.target.files[0] : null,
                      )
                    }
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1 space-y-1">
                  {(previewFiles || [])?.map((url, i) => (
                    <div className="flex items-center gap-2 w-full" key={i}>
                      {/\.(jpg|jpeg|png|webp|gif|avif)$/i.test(url) ? (
                        <div className="flex items-center gap-2 border p-1 rounded-md">
                          <Image
                            src={url}
                            alt="document"
                            width={56}
                            height={40}
                            className="object-cover rounded-md border"
                            unoptimized
                          />
                          <div className="truncate">
                            {url.length > 30 ? getActualFileName(url)?.slice(0, 30) : getActualFileName(url)}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <File className="w-4 h-4 text-gray-500" />
                          <div className="truncate">
                            {url.length > 30 ? getActualFileName(url)?.slice(0, 30) : getActualFileName(url)}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2 w-full">
                        <button
                          type="button"
                          onClick={() => window.open(url, "_blank")}
                          className="inline-flex items-center gap-2 px-2 py-1 rounded-md text-xs"
                        >
                          <Eye className="w-4 h-4 text-[#DC3173]" />
                          {t("view")}
                        </button>

                        <button
                          type="button"
                          onClick={() => removeFile(d.key, i)}
                          className="px-2 py-1 rounded-md text-xs"
                        >
                          {t("remove")}
                        </button>
                      </div>
                    </div>
                  ))}
                  {!isSelected && <span>{t("no_file_selected")}</span>}
                </div>
              </div>
            </div>

            {!isSelected && (
              <div className="flex items-center justify-end gap-3 w-42.5!">
                <button
                  type="button"
                  onClick={() => openPicker(d.key)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-[#DC3173] border border-[#DC3173]/20 hover:bg-[#DC3173]/5 transition"
                >
                  <UploadCloud className="w-4 h-4" />
                  {t("select_file")}
                </button>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
