/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { motion } from "framer-motion";
import { Eye, File, FileText, ImageIcon, UploadCloud } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { uploadVendorDocumentsReq } from "@/services/dashboard/add-vendor/add-vendor";
import { TResponse } from "@/types";
import { getCookie } from "@/utils/cookies";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";

type DocKey =
  | "businessLicenseDoc"
  | "taxDoc"
  | "idProof"
  | "storePhoto"
  | "menuUpload";

const DOCUMENTS: {
  key: DocKey;
  label: string;
  prefersImagePreview: boolean;
}[] = [
  {
    key: "businessLicenseDoc",
    label: "Business License",
    prefersImagePreview: false,
  },
  { key: "taxDoc", label: "Tax Document", prefersImagePreview: false },
  { key: "idProof", label: "ID Proof", prefersImagePreview: true },
  { key: "storePhoto", label: "Store Photo", prefersImagePreview: true },
  { key: "menuUpload", label: "Menu / Brochure", prefersImagePreview: true },
];

type FilePreview = {
  file: File | null;
  url: string | null;
  isImage: boolean;
};

export default function UploadVendorDocuments() {
  const [previews, setPreviews] = useState<Record<DocKey, FilePreview | null>>({
    businessLicenseDoc: null,
    taxDoc: null,
    idProof: null,
    storePhoto: null,
    menuUpload: null,
  });
  const inputsRef = useRef<Record<string, HTMLInputElement | null>>({});

  const openPicker = (key: DocKey) => {
    const el = inputsRef.current[key];
    el?.click();
  };

  const handleFileChange = async (key: DocKey, f?: File | null) => {
    if (!f) return;
    const isImage = f.type.startsWith("image/");
    const url = URL.createObjectURL(f);

    const toastId = toast.loading("Uploading...");
    try {
      const accessToken = getCookie("accessToken");
      const decoded = jwtDecode(accessToken || "") as { id: string };

      const result = (await uploadVendorDocumentsReq(
        decoded.id,
        key,
        f
      )) as unknown as TResponse<any>;

      if (result.success) {
        toast.success("File uploaded successfully!", { id: toastId });

        const prev = previews[key];
        if (prev && prev.url) URL.revokeObjectURL(prev.url);

        setPreviews((p) => ({ ...p, [key]: { file: f, url, isImage } }));

        if (inputsRef.current[key]) {
          inputsRef.current[key]!.value = "";
        }
        return;
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.message || "File upload failed", {
        id: toastId,
      });
      return;
    }
  };

  const removeFile = (key: DocKey) => {
    const prev = previews[key];
    if (prev && prev.url) URL.revokeObjectURL(prev.url);
    setPreviews((p) => ({ ...p, [key]: null }));

    if (inputsRef.current[key]) {
      inputsRef.current[key]!.value = "";
    }
  };

  useEffect(() => {
    return () => {
      Object.values(previews).forEach((p) => {
        if (p && p.url) URL.revokeObjectURL(p.url);
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
        const preview = previews[d.key];
        const isSelected = !!preview;
        return (
          <motion.div
            key={d.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06 }}
            className={`flex items-center justify-between p-4 border rounded-xl shadow-sm hover:shadow-md transition-all ${
              isSelected ? "border-[#DC3173]/30 bg-[#FFF7FB]" : "bg-white"
            }`}
          >
            <div className="flex items-center gap-4">
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

              <div className="min-w-0">
                <div className="text-sm font-semibold text-gray-800">
                  {d.label}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {preview ? (
                    preview.isImage && preview.url ? (
                      <div className="flex items-center gap-2">
                        <Image
                          src={preview.url}
                          alt={
                            preview.file?.name ||
                            getActualFileName(preview.url || "")
                          }
                          width={56}
                          height={40}
                          className="object-cover rounded-md border"
                          unoptimized
                        />
                        <div className="truncate">
                          {preview.file?.name ||
                            getActualFileName(preview.url || "")}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <File className="w-4 h-4 text-gray-500" />
                        <div className="truncate">
                          {preview.file?.name ||
                            getActualFileName(preview.url || "")}
                        </div>
                      </div>
                    )
                  ) : (
                    <span>No file selected</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* hidden native input */}
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
                    e.target.files ? e.target.files[0] : null
                  )
                }
              />

              {preview ? (
                <>
                  <button
                    onClick={() =>
                      preview.url
                        ? window.open(preview.url, "_blank")
                        : alert(preview.file?.name)
                    }
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm border border-gray-200 hover:shadow"
                  >
                    <Eye className="w-4 h-4 text-[#DC3173]" /> View
                  </button>

                  <button
                    onClick={() => removeFile(d.key)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm text-gray-600 border border-gray-100 hover:bg-gray-50"
                  >
                    Remove
                  </button>
                </>
              ) : (
                <button
                  onClick={() => openPicker(d.key)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-[#DC3173] border border-[#DC3173]/20 hover:bg-[#DC3173]/5 transition"
                >
                  <UploadCloud className="w-4 h-4" />
                  Select file
                </button>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
