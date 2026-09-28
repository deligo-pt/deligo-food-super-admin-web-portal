/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useTranslation } from "@/hooks/use-translation";
import { deleteProductImage } from "@/services/dashboard/product/product.service";
import { uploadImagesReq } from "@/services/upload/upload.service";
import { AnimatePresence, motion } from "framer-motion";
import { ImageIcon, UploadIcon, XIcon } from "lucide-react";
import Image from "next/image";
import React, { useRef, useState } from "react";
import { toast } from "sonner";

interface IProps {
  images: string[];
  onChange: (images: string[]) => void;
  productId?: string;
}

const MAX_IMAGES = 1;
const MAX_FILE_SIZE_MB = 5;
const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/svg+xml"];

export function ProductImageUpload({ images, onChange, productId }: IProps) {
  const { t } = useTranslation();
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFiles = (files: File[]): string | null => {
    if (files.length === 0) {
      return t("no_file_selected") || "No file selected";
    }

    // Only 1 image total
    if (images.length >= MAX_IMAGES) {
      return t("max_one_image") || "You can upload only 1 image";
    }

    if (files.length > MAX_IMAGES) {
      return t("max_one_image") || "You can upload only 1 image";
    }

    const file = files[0];

    if (!ACCEPTED_TYPES.includes(file.type) && !file.type.match(/^image\//)) {
      return t("only_image_files") || "Please upload only image files (PNG, JPG, WEBP, SVG)";
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

  const handleFiles = async (fileList: FileList) => {
    setError(null);

    const files = Array.from(fileList).slice(0, MAX_IMAGES); // hard limit 1
    const validationError = validateFiles(files);

    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    const toastId = toast.loading(t("Uploading images...") || "Uploading image...");
    setIsUploading(true);

    try {
      const result = await uploadImagesReq(files);

      if (result.success && result.data?.length) {
        toast.success(result.message || "Image uploaded successfully!", {
          id: toastId,
        });
        // Replace (not append) since max is 1
        onChange([result.data[0]]);
        if (inputRef.current) inputRef.current.value = "";
        return;
      }

      toast.error(result.message || "Image upload failed", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Image upload failed", { id: toastId });
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const removeImage = async (image: string, index: number) => {
    const previousImages = [...images];

    // optimistic UI
    onChange(images.filter((_, i) => i !== index));
    if (inputRef.current) inputRef.current.value = "";

    if (!productId) return;

    const toastId = toast.loading("Removing product image...");
    setIsRemoving(true);

    try {
      const res = await deleteProductImage(productId, { images: [image] });

      if (res?.success) {
        toast.success(res?.message || "Image removed successfully", {
          id: toastId,
        });
      } else {
        onChange(previousImages);
        toast.error(res?.message || "Image remove failed!", { id: toastId });
      }
    } catch (error: any) {
      onChange(previousImages);
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

  const hasImage = images.length > 0;

  return (
    <div className="space-y-4">
      {/* Hide dropzone when 1 image already exists */}
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
              {t("png_jpg_svg") || "PNG, JPG, WEBP, SVG • Max 1 image • Max 5MB"}
            </p>
            <label className="mt-4">
              <motion.span
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`inline-flex items-center px-4 py-2 bg-[#DC3173] text-white rounded-md cursor-pointer hover:bg-[#B02458] transition-colors ${isUploading ? "opacity-60 pointer-events-none" : ""
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
                // NO multiple — only 1 image
                disabled={isUploading}
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
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            {t("uploaded_images")}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <AnimatePresence>
              {images.map((image, index) => (
                <motion.div
                  key={image || index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative group aspect-square"
                >
                  <Image
                    src={image}
                    alt={`Product image ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                    width={500}
                    height={500}
                  />
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    disabled={isRemoving}
                    onClick={() => removeImage(image, index)}
                    className={`absolute -top-2 -right-2 text-white rounded-full p-1 ${isRemoving
                      ? "bg-red-500 opacity-50"
                      : "bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      }`}
                  >
                    <XIcon className="h-4 w-4" />
                  </motion.button>
                  {index === 0 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-[#DC3173] text-white text-xs py-1 text-center rounded-b-lg">
                      {t("main_image")}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}