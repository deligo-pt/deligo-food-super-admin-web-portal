"use client";

import { useTranslation } from "@/hooks/use-translation";
import {
  deleteDocumentReq,
  updateDocumentsReq,
} from "@/services/auth/register-user.service";
import { uploadImagesReq } from "@/services/upload/upload.service";
import { TFilePreview, TFleetDocKey } from "@/types/document.type";
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
import { toast } from "sonner";

export default function UploadFleetManagerDocuments({
  fleetManagerId,
  previews,
  setPreviews,
}: {
  fleetManagerId: string;
  previews: Record<TFleetDocKey, TFilePreview[] | null>;
  setPreviews: React.Dispatch<
    React.SetStateAction<Record<TFleetDocKey, TFilePreview[] | null>>
  >;
}) {
  const { t } = useTranslation();
  const inputsRef = useRef<Record<string, HTMLInputElement | null>>({});

  const DOCUMENTS: {
    key: TFleetDocKey;
    label: string;
    prefersImagePreview: boolean;
  }[] = [
    { key: "myPhoto", label: "Fleet Manager Photo", prefersImagePreview: true },
    {
      key: "businessLicense",
      label: t("business_license"),
      prefersImagePreview: false,
    },
    { key: "idProofFront", label: "Id Proof Front", prefersImagePreview: true },
    { key: "idProofBack", label: "Id Proof Back", prefersImagePreview: true },
  ];

  const openPicker = (key: TFleetDocKey) => {
    const el = inputsRef.current[key];
    el?.click();
  };

  const handleFileChange = async (key: TFleetDocKey, f?: File | null) => {
    if (!f) return;

    if (inputsRef.current[key]) {
      inputsRef.current[key]!.value = "";
    }

    const toastId = toast.loading("Uploading...");

    if (previews[key]?.length === 3) {
      toast.error("You can only upload a maximum of 3 documents", {
        id: toastId,
      });
      return;
    }

    const isImage = f.type.startsWith("image/");

    const uploadResult = await uploadImagesReq([f]);

    if (uploadResult.success) {
      const prevUrls =
        previews[key]?.filter((p) => p.url)?.map((p) => p.url) || [];

      const updateResult = await updateDocumentsReq(`fleet-managers/${fleetManagerId}`, {
        docImageTitle: key,
        docImageUrls: [...prevUrls, uploadResult.data?.[0]],
      });

      if (updateResult.success) {
        toast.success("File uploaded successfully!", { id: toastId });

        setPreviews((p) => ({
          ...p,
          [key]: [
            ...(p[key] || []),
            { file: f, url: uploadResult.data?.[0], isImage },
          ],
        }));

        return;
      }

      deleteDocumentReq(fleetManagerId, {
        docImageTitle: key,
        imageUrl: uploadResult.data?.[0],
      });

      toast.error(updateResult.message || "File upload failed", {
        id: toastId,
      });
      console.log(updateResult);
      return;
    }

    toast.error(uploadResult.message || "File upload failed", { id: toastId });
    console.log(uploadResult);
  };

  const removeFile = async (key: TFleetDocKey, index: number) => {
    const prev = previews[key];

    if (prev && prev[index]?.url) {
      const toastId = toast.loading("Deleting...");

      const result = await deleteDocumentReq(fleetManagerId, {
        docImageTitle: key,
        imageUrl: prev[index].url,
      });

      if (result.success) {
        toast.success("File deleted successfully!", { id: toastId });

        setPreviews((p) => ({
          ...p,
          [key]: p[key]?.filter((_, i) => i !== index),
        }));

        if (inputsRef.current[key]) {
          inputsRef.current[key]!.value = "";
        }

        return;
      }

      toast.error(result.message || "File deletion failed", { id: toastId });
      console.log(result);
    }
  };

  useEffect(() => {
    return () => {
      Object.values(previews).forEach((p) => {
        if (p) {
          p.forEach((f) => {
            if (f.url) URL.revokeObjectURL(f.url);
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
      return match ? match[1] : lastSegment;
    } catch {
      return "";
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {DOCUMENTS.map((d, idx) => {
        const previewFiles = previews[d.key];
        const isSelected = !(!previewFiles || previewFiles?.length === 0);
        return (
          <motion.div
            key={d.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06 }}
            className={`flex items-center justify-between p-4 border rounded-xl shadow-sm hover:shadow-md transition-all ${
              isSelected
                ? "border-[#DC3173]/30 bg-[#FFF7FB] w-full"
                : "bg-white"
            }`}
          >
            <div className="flex items-center gap-4 w-full">
              <div
                className={`w-14 h-14 rounded-lg flex items-center justify-center ${
                  isSelected ? "bg-[#DC3173]/10" : "bg-gray-50"
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
                  {previewFiles?.map((f, i) => (
                    <div className="flex items-center gap-2 w-full" key={i}>
                      {f.isImage && f.url ? (
                        <div className="flex items-center gap-2 border p-1 rounded-md">
                          <Image
                            src={f.url}
                            alt={f.file?.name || getActualFileName(f.url || "")}
                            width={56}
                            height={40}
                            className="object-cover rounded-md border"
                            unoptimized
                          />
                          <div className="truncate">
                            {f.file?.name
                              ? f.file.name.length > 20
                                ? f.file.name.slice(0, 20) + "..."
                                : f.file.name
                              : getActualFileName(f.url || "")}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <File className="w-4 h-4 text-gray-500" />
                          <div className="truncate">
                            {f.file?.name
                              ? f.file.name.length > 10
                                ? f.file.name.slice(0, 10) + "..."
                                : f.file.name
                              : getActualFileName(f.url || "")}
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-2 w-full">
                        <button
                          type="button"
                          onClick={() =>
                            f.url
                              ? window.open(f.url, "_blank")
                              : alert(f.file?.name)
                          }
                          className="inline-flex items-center gap-2 px-2 py-1 rounded-md text-xs cursor-pointer"
                        >
                          <Eye className="w-4 h-4 text-[#DC3173]" /> {t("view")}
                        </button>

                        <button
                          type="button"
                          onClick={() => removeFile(d.key, i)}
                          className="px-2 py-1 rounded-md text-xs cursor-pointer"
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
              <div className="flex items-center justify-end gap-3 w-[170px]!">
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
