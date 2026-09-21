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

export function ProductImageUpload({ images, onChange, productId }: IProps) {
  const { t } = useTranslation();
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const handleFiles = async (files: FileList) => {
    setError(null);
    if (images.length + files.length > 5) {
      setError("You can upload a maximum of 5 images");
      return;
    }
    Array.from(files).forEach((file) => {
      if (!file.type.match("image.*")) {
        setError("Please upload only image files");
        return;
      }
    });

    const toastId = toast.loading(t("Uploading images..."));

    const result = await uploadImagesReq(Array.from(files));

    if (result.success) {
      toast.success(result.message || "Images uploaded successfully!", {
        id: toastId,
      });
      onChange([...images, ...(result.data || [])]);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    toast.error(result.message || "Image upload failed", { id: toastId });
    console.log(result);
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
        toast.success(res?.message || "Image removed successfully", { id: toastId });
      } else {
        // restore on failure
        onChange(previousImages);
        toast.error(res?.message || "Image remove failed!", { id: toastId });
      }
    } catch (error: any) {
      onChange(previousImages);
      toast.error(
        error?.response?.data?.message || error?.message || "Image remove failed",
        { id: toastId }
      );
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDragEnter={handleDrag}
        className={`border-2 border-dashed rounded-lg p-8 text-center ${dragActive
          ? "border-[#DC3173] bg-pink-50"
          : "border-gray-300 hover:border-gray-400"
          } transition-colors duration-200`}
      >
        {dragActive && (
          <div
            className="absolute inset-0 z-10"
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          />
        )}
        <motion.div
          initial={{
            scale: 0.9,
          }}
          animate={{
            scale: 1,
          }}
          className="flex flex-col items-center"
        >
          <ImageIcon className="h-12 w-12 text-gray-400 mb-3" />
          <p className="text-lg font-medium text-gray-700">
            {t("drag_drop_product_images")}
          </p>
          <p className="text-sm text-gray-500 mt-1">{t("or_click")}</p>
          <p className="text-xs text-gray-400 mt-2">{t("png_jpg_svg")}</p>
          <label className="mt-4">
            <motion.span
              whileHover={{
                scale: 1.05,
              }}
              whileTap={{
                scale: 0.95,
              }}
              className="inline-flex items-center px-4 py-2 bg-[#DC3173] text-white rounded-md cursor-pointer hover:bg-[#B02458] transition-colors"
            >
              <UploadIcon className="h-4 w-4 mr-2" />
              {t("select_files")}
            </motion.span>
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              onChange={handleChange}
              accept="image/*"
              multiple
            />
          </label>
        </motion.div>
      </div>
      {error && (
        <motion.p
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          className="text-red-500 text-sm"
        >
          {error}
        </motion.p>
      )}
      {images.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            {t("uploaded_images")} ({images.length}/5)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <AnimatePresence>
              {images.map((image, index) => (
                <motion.div
                  key={index}
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
                    whileHover={{
                      scale: 1.1,
                    }}
                    whileTap={{
                      scale: 0.9,
                    }}
                    disabled={isRemoving}
                    onClick={() => removeImage(image, index)}
                    className={`absolute -top-2 -right-2 text-white rounded-full p-1 ${isRemoving ? "bg-red-500 opacity-50" : "bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity"}`}
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
