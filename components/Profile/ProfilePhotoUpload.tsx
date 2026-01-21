"use client";

import { useTranslation } from "@/hooks/use-translation";
import { uploadProfilePhoto } from "@/services/dashboard/profile/uploadProfilePhoto";
import { TResponse } from "@/types";
import { TAdmin } from "@/types/admin.type";
import { AnimatePresence, motion } from "framer-motion";
import {
  CameraIcon,
  CheckCircleIcon,
  EditIcon,
  LoaderIcon,
  UploadIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useRef, useState } from "react";
import { toast } from "sonner";

interface IProps {
  currentPhoto?: string;
}

export default function ProfilePhotoUpload({ currentPhoto }: IProps) {
  const { t } = useTranslation();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isChanged, setIsChanged] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentPhoto);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    setIsUploading(true);
    setUploadSuccess(false);
    setTimeout(() => {
      setIsUploading(false);
      setUploadSuccess(true);
      // onPhotoChange( as string);
      setTimeout(() => {
        setUploadSuccess(false);
        setIsChanged(true);
      }, 2000);
    }, 1500);
  };

  const uploadFile = async () => {
    const toastId = toast.loading("Uploading file...");

    try {
      const result = (await uploadProfilePhoto(
        imageFile as File
      )) as TResponse<TAdmin>;

      if (result.success) {
        toast.success("File uploaded successfully", { id: toastId });
        router.refresh();
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "File upload failed", {
        id: toastId,
      });
      console.log(error);
    }
  };

  return (
    <div className="relative z-999">
      <motion.div
        className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl"
        whileHover={{
          scale: 1.05,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
        }}
      >
        <AnimatePresence mode="wait">
          {previewUrl && previewUrl !== "<admin_profile_photo_url>" ? (
            <motion.img
              key={previewUrl}
              src={previewUrl}
              alt="Profile"
              className="w-full h-full object-cover"
              initial={{
                opacity: 0,
                scale: 0.8,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                scale: 0.8,
              }}
              transition={{
                duration: 0.3,
              }}
            />
          ) : (
            <motion.div
              className="w-full h-full bg-linear-to-br from-[#DC3173] to-[#FF6B9D] flex items-center justify-center"
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
            >
              <CameraIcon className="w-12 h-12 text-white" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload overlay */}
        <AnimatePresence>
          {isUploading && (
            <motion.div
              className="absolute inset-0 bg-black/60 flex items-center justify-center"
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
            >
              <LoaderIcon className="w-8 h-8 text-white animate-spin" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success overlay */}
        <AnimatePresence>
          {uploadSuccess && (
            <motion.div
              className="absolute inset-0 bg-[#DC3173]/90 flex items-center justify-center"
              initial={{
                opacity: 0,
                scale: 0.8,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                scale: 0.8,
              }}
            >
              <CheckCircleIcon className="w-12 h-12 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Upload button */}
      {isChanged ? (
        <motion.button
          onClick={uploadFile}
          className="bg-[#DC3173] px-4 py-2 rounded-md flex items-center justify-center gap-1 shadow-lg cursor-pointer mx-auto mt-4! text-white text-sm"
          whileHover={{
            scale: 1.1,
          }}
          whileTap={{
            scale: 0.95,
          }}
        // disabled={isUploading}
        >
          <span>{t("upload")}</span>
          <UploadIcon className="w-4 h-4" />
        </motion.button>
      ) : (
        <motion.button
          onClick={() => fileInputRef.current?.click()}
          className="absolute bottom-0 right-0 w-10 h-10 bg-[#DC3173] rounded-full flex items-center justify-center shadow-lg border-4 border-white cursor-pointer"
          whileHover={{
            scale: 1.1,
          }}
          whileTap={{
            scale: 0.95,
          }}
          disabled={isUploading}
        >
          <EditIcon className="w-4 h-4 text-white" />
        </motion.button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
