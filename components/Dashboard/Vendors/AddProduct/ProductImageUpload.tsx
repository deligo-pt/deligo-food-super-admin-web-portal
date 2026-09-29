/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useTranslation } from "@/hooks/use-translation";
import { deleteProductImage } from "@/services/dashboard/product/product.service";
import { uploadImagesReq } from "@/services/upload/upload.service";
import { AnimatePresence, motion } from "framer-motion";
import { ImageIcon, RefreshCwIcon, UploadIcon, XIcon } from "lucide-react";
import Image from "next/image";
import React, { useRef, useState } from "react";
import { toast } from "sonner";

interface IProps {
  /** Current image URL (single string). Empty string = no image. */
  image: string;
  /** Called with the new URL, or "" when removed. */
  onChange: (image: string) => void;
  productId?: string;
}

const MAX_FILE_SIZE_MB = 5;
const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/svg+xml",
];

export function ProductImageUpload({ image, onChange, productId }: IProps) {
  const { t } = useTranslation();
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isReplacing, setIsReplacing] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  const currentImage = typeof image === "string" && image.trim() ? image.trim() : "";
  const hasImage = !!currentImage;
  const isBusy = isUploading || isRemoving || isReplacing;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const validateFile = (file: File): string | null => {
    if (!file) return t("no_file_selected") || "No file selected";

    if (!ACCEPTED_TYPES.includes(file.type) && !file.type.match(/^image\//)) {
      return (
        t("only_image_files") ||
        "Please upload only image files (PNG, JPG, WEBP, SVG)"
      );
    }

    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > MAX_FILE_SIZE_MB) {
      return (
        t("image_too_large") ||
        `Image must be smaller than ${MAX_FILE_SIZE_MB}MB`
      );
    }

    return null;
  };

  /** Upload and set a single URL. Optionally delete previous URL on server. */
  const uploadAndSet = async (file: File, oldUrl?: string) => {
    const toastId = toast.loading(
      t("Uploading images...") || "Uploading image..."
    );
    setIsUploading(true);
    if (oldUrl) setIsReplacing(true);

    try {
      const result = await uploadImagesReq([file]);

      if (!result.success || !result.data?.length) {
        toast.error(result.message || "Image upload failed", { id: toastId });
        return;
      }

      const newUrl = result.data[0];

      // Always a single string
      onChange(newUrl);

      // Remove old image from product when editing
      if (productId && oldUrl && oldUrl !== newUrl) {
        try {
          // API still accepts { images: string[] } for delete
          await deleteProductImage(productId, { images: [oldUrl] });
        } catch (err) {
          console.error("Failed to delete old image after replace:", err);
        }
      }

      toast.success(result.message || "Image uploaded successfully!", {
        id: toastId,
      });
    } catch (err) {
      console.error(err);
      toast.error("Image upload failed", { id: toastId });
    } finally {
      setIsUploading(false);
      setIsReplacing(false);
      if (inputRef.current) inputRef.current.value = "";
      if (replaceInputRef.current) replaceInputRef.current.value = "";
    }
  };

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList?.length) return;
    setError(null);

    if (hasImage) {
      const msg =
        t("max_one_image") ||
        "You can upload only 1 image. Use Replace to change it.";
      setError(msg);
      toast.error(msg);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    const file = fileList[0];
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    await uploadAndSet(file);
  };

  const handleReplaceFiles = async (fileList: FileList | null) => {
    if (!fileList?.length) return;
    setError(null);

    const file = fileList[0];
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      if (replaceInputRef.current) replaceInputRef.current.value = "";
      return;
    }

    await uploadAndSet(file, currentImage);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const handleReplaceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleReplaceFiles(e.target.files);
  };

  const removeImage = async () => {
    const previous = currentImage;
    onChange(""); // clear form field

    if (inputRef.current) inputRef.current.value = "";
    if (replaceInputRef.current) replaceInputRef.current.value = "";

    if (!productId || !previous) return;

    const toastId = toast.loading("Removing product image...");
    setIsRemoving(true);

    try {
      const res = await deleteProductImage(productId, { images: [previous] });
      console.log("delete image res", res);
      if (res?.success) {
        toast.success(res?.message || "Image removed successfully", {
          id: toastId,
        });
      } else {
        onChange(previous);
        toast.error(res?.message || "Image remove failed!", { id: toastId });
      }
    } catch (error: any) {
      onChange(previous);
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Image remove failed",
        { id: toastId }
      );
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="space-y-4">
      {!hasImage && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-lg p-8 text-center ${dragActive
            ? "border-[#DC3173] bg-pink-50"
            : "border-gray-300 hover:border-gray-400"
            } transition-colors duration-200`}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="flex flex-col items-center"
          >
            <ImageIcon className="h-12 w-12 text-gray-400 mb-3" />
            <p className="text-lg font-medium text-gray-700">
              {t("drag_drop_product_images")}
            </p>
            <p className="text-sm text-gray-500 mt-1">{t("or_click")}</p>
            <p className="text-xs text-gray-400 mt-2">
              {t("png_jpg_svg") ||
                "PNG, JPG, WEBP, SVG • Max 1 image • Max 5MB"}
            </p>
            <label className="mt-4">
              <motion.span
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`inline-flex items-center px-4 py-2 bg-[#DC3173] text-white rounded-md cursor-pointer hover:bg-[#B02458] transition-colors ${isBusy ? "opacity-60 pointer-events-none" : ""
                  }`}
              >
                <UploadIcon className="h-4 w-4 mr-2" />
                {isUploading
                  ? t("uploading") || "Uploading..."
                  : t("select_files")}
              </motion.span>
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                onChange={handleChange}
                accept="image/jpeg,image/jpg,image/png,image/webp,image/svg+xml"
                disabled={isBusy}
              />
            </label>
          </motion.div>
        </div>
      )}

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-500 text-sm"
        >
          {error}
        </motion.p>
      )}

      {hasImage && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">
              {t("uploaded_images") || "Uploaded Images"} (1/1)
            </h3>

            <label
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full border border-[#DC3173] text-[#DC3173] hover:bg-pink-50 cursor-pointer transition-colors ${isBusy ? "opacity-50 pointer-events-none" : ""
                }`}
            >
              <RefreshCwIcon
                className={`h-3.5 w-3.5 ${isReplacing ? "animate-spin" : ""}`}
              />
              {isReplacing
                ? t("replacing") || "Replacing..."
                : t("replace_image") || "Replace image"}
              <input
                ref={replaceInputRef}
                type="file"
                className="hidden"
                onChange={handleReplaceChange}
                accept="image/jpeg,image/jpg,image/png,image/webp,image/svg+xml"
                disabled={isBusy}
              />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentImage}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative group aspect-square max-w-45"
              >
                <Image
                  src={currentImage}
                  alt="Product image"
                  className="w-full h-full object-cover rounded-lg"
                  width={500}
                  height={500}
                />

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  disabled={isBusy}
                  onClick={removeImage}
                  className={`absolute -top-2 -right-2 text-white rounded-full p-1.5 shadow-sm bg-red-500 ${isRemoving
                    ? "opacity-50"
                    : "opacity-0 group-hover:opacity-100 transition-opacity"
                    }`}
                  title={t("remove") || "Remove"}
                >
                  <XIcon className="h-3.5 w-3.5" />
                </motion.button>

                <div className="absolute bottom-0 left-0 right-0 bg-[#DC3173] text-white text-xs py-1 text-center rounded-b-lg">
                  {t("main_image") || "Main Image"}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}