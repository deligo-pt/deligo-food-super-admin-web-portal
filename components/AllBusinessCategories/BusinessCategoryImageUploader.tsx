"use client";

import { useTranslation } from "@/hooks/use-translation";
import { AnimatePresence, motion } from "framer-motion";
import { ImageIcon, UploadIcon, XIcon } from "lucide-react";
import Image from "next/image";
import React, { useCallback, useRef, useState } from "react";

interface IProps {
  image?: { file: File | null; url: string };
  onChange: (image: { file: File | null; url: string }) => void;
}

export function ImageUploader({ image, onChange }: IProps) {
  const { t } = useTranslation();
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleFile = useCallback(
    (file: File) => {
      setError(null);
      if (!file.type.match("image.*")) {
        setError("Please upload only image files");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          onChange({ file, url: e.target!.result as string });
        }
      };
      reader.readAsDataURL(file);
    },
    [onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files?.[0]) {
        handleFile(e.dataTransfer.files?.[0]);
      }
    },
    [handleFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      if (e.target.files && e.target.files?.[0]) {
        handleFile(e.target.files?.[0]);
      }
    },
    [handleFile]
  );

  const removeImage = () => {
    onChange({ file: null, url: "" });
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-4">
      <div className={!!image?.url ? "grid lg:grid-cols-2 gap-6" : ""}>
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
              {t("drag_drop_image_here")}
            </p>
            <p className="text-sm text-gray-500 mt-1">{t("or_click_browse")}</p>
            <p className="text-xs text-gray-400 mt-2">{t("png_jpg_jpeg")}</p>
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
                {t("upload_image")}
              </motion.span>
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                onChange={handleChange}
                accept="image/*"
              />
            </label>
          </motion.div>
        </div>
        {!!image?.url && (
          <AnimatePresence>
            <motion.div
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
              className="relative group w-full h-full lg:max-h-64 rounded-lg overflow-hidden"
            >
              <Image
                src={image.url}
                alt={"Image Preview"}
                className="w-full h-full object-cover"
                width={500}
                height={500}
              />
              <motion.button
                whileHover={{
                  scale: 1.1,
                }}
                whileTap={{
                  scale: 0.9,
                }}
                onClick={() => removeImage()}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <XIcon className="h-4 w-4" />
              </motion.button>
            </motion.div>
          </AnimatePresence>
        )}
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
    </div>
  );
}
