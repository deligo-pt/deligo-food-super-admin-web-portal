"use client";

import { useTranslation } from "@/hooks/use-translation";
import { TResponse } from "@/types";
import { TDeliveryPartner } from "@/types/delivery-partner.type";
import { TFilePreview, TPartnerDocKey } from "@/types/document.type";
import { catchAsync } from "@/utils/catchAsync";
import { updateData } from "@/utils/requests";
import { motion } from "framer-motion";
import {
  Eye,
  File,
  FileText,
  ImageIcon,
  RefreshCcw,
  UploadCloud,
} from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";


export const BASE_REQUIRED_DOCS: TPartnerDocKey[] = [
  "myPhoto",
  "idProofFront",
  "idProofBack",
  "ibanProof",
];

export default function UploadPartnerDocuments({
  partnerId,
  vehicleType,
  previews,
  setPreviews,
  isSubmitting,
}: {
  partnerId: string;
  vehicleType: string;
  previews: Record<TPartnerDocKey, TFilePreview | null>;
  setPreviews: React.Dispatch<
    React.SetStateAction<Record<TPartnerDocKey, TFilePreview | null>>
  >;
  isSubmitting: boolean;
}) {
  const { t } = useTranslation();
  const inputsRef = useRef<Record<string, HTMLInputElement | null>>({});
  const [processing, setProcessing] = useState(false);

  // Dynamically build required docs based on vehicle type
  const getRequiredDocs = (): TPartnerDocKey[] => {
    const base = [...BASE_REQUIRED_DOCS];

    if (vehicleType === "MOTORBIKE" || vehicleType === "CAR") {
      return [
        ...base,
        "drivingLicenseFront",
        "drivingLicenseBack",
        "vehicleRegistration",
      ];
    }

    if (vehicleType === "SCOOTER") {
      return [...base, "vehicleRegistration"];
    }

    // BICYCLE | E-BIKE | undefined → only base required docs
    return base;
  };

  const REQUIRED_DOCS = getRequiredDocs();

  const DOCUMENTS: {
    key: TPartnerDocKey;
    label: string;
    prefersImagePreview: boolean;
  }[] = [
      {
        key: "idProofFront",
        label: t("id_proof_front"),
        prefersImagePreview: true,
      },
      {
        key: "idProofBack",
        label: t("id_proof_back"),
        prefersImagePreview: true,
      },
      {
        key: "ibanProof",
        label: t("iban_proof"),
        prefersImagePreview: true,
      },
      {
        key: "drivingLicenseFront",
        label: t("driving_license_front"),
        prefersImagePreview: true,
      },
      {
        key: "drivingLicenseBack",
        label: t("driving_license_back"),
        prefersImagePreview: true,
      },
      {
        key: "vehicleRegistration",
        label: t("vehicle_registration"),
        prefersImagePreview: true,
      },
      {
        key: "criminalRecordCertificate",
        label: t("criminal_record_certification"),
        prefersImagePreview: true,
      },
      {
        key: "activity",
        label: t("activity"),
        prefersImagePreview: false,
      },
      {
        key: "insurancePolicy",
        label: t("insurance_policy"),
        prefersImagePreview: true,
      },
      {
        key: "myPhoto",
        label: t("my_photo"),
        prefersImagePreview: true,
      },
    ];

  const openPicker = (key: TPartnerDocKey) => {
    const el = inputsRef.current[key];
    el?.click();
  };

  const handleFileChange = async (key: TPartnerDocKey, f?: File | null) => {
    if (!f) return;

    const toastId = toast.loading("Uploading...");
    setProcessing(true);

    if (f.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB", { id: toastId });
      setProcessing(false);
      return;
    }

    if (inputsRef.current[key]) {
      inputsRef.current[key]!.value = "";
    }

    const isImage = f.type.startsWith("image/");

    const formData = new FormData();
    formData.append("file", f);
    formData.append("data", JSON.stringify({ docImageTitle: key }));

    const uploadResult = await catchAsync<TDeliveryPartner>(async () => {
      return (await updateData(
        `/delivery-partners/${partnerId}/docImage`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      )) as unknown as TResponse<TDeliveryPartner>;
    });

    if (uploadResult.success) {
      toast.success(uploadResult.message || "File uploaded successfully!", {
        id: toastId,
      });

      setPreviews((p) => ({
        ...p,
        [key]: {
          file: f,
          url: uploadResult.data?.documents?.[key],
          isImage,
        },
      }));
      setProcessing(false);
      return;
    }

    if (uploadResult?.data?.errorSources) {
      uploadResult?.data?.errorSources?.map((err: { path: string, message: string }) => (
        toast.error(err?.message, { id: toastId })
      ));
      return;
    } else {
      toast.error(uploadResult.message || "File upload failed", { id: toastId });
    }

    console.log(uploadResult);
    setProcessing(false);
    return;
  };

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
        const previewFile = previews[d.key];
        const isSelected = !!previewFile?.url;
        const isRequired = REQUIRED_DOCS.includes(d.key);

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
              {!isSelected && (
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
              )}

              <div className="min-w-0 w-full">
                <div className="text-sm font-semibold text-gray-800 flex w-full gap-2 justify-between">
                  <p>
                    {d.label}
                    {isRequired && (
                      <span className="ml-1 text-red-600">*</span>
                    )}
                  </p>

                  {isSelected && (
                    <div>
                      <button
                        type="button"
                        onClick={() =>
                          previewFile?.url
                            ? window.open(previewFile.url, "_blank")
                            : toast.error("Cannot view the file")
                        }
                        className="inline-flex items-center gap-2 px-2 py-1 rounded-md text-xs cursor-pointer"
                      >
                        <Eye className="w-3 h-3 text-[#DC3173]" /> {t("view")}
                      </button>
                      <button
                        type="button"
                        disabled={isSubmitting || processing}
                        onClick={() => openPicker(d.key)}
                        className="inline-flex items-center gap-2 px-2 py-1 rounded-md text-xs cursor-pointer"
                      >
                        <RefreshCcw className="w-3 h-3 text-[#DC3173]" />{" "}
                        {t("change")}
                      </button>
                    </div>
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
                  {isSelected ? (
                    previewFile?.isImage && previewFile?.url ? (
                      <div className="grid grid-cols-[56px_1fr] items-center gap-2 rounded-md">
                        <Image
                          src={previewFile?.url}
                          alt={getActualFileName(previewFile?.url || "")}
                          width={56}
                          height={40}
                          className="object-cover rounded-md border w-14 h-8"
                          unoptimized
                        />
                        <div className="truncate">
                          {getActualFileName(previewFile?.url || "")}
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-[56px_1fr] items-center gap-2">
                        <File className="w-4 h-4 text-gray-500" />
                        <div className="truncate">
                          {getActualFileName(previewFile?.url || "")}
                        </div>
                      </div>
                    )
                  ) : (
                    <span>{t("no_file_selected")}</span>
                  )}
                </div>
              </div>
            </div>

            {!isSelected && (
              <div className="flex items-center justify-end gap-3 w-42.5!">
                <button
                  type="button"
                  disabled={isSubmitting || processing}
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