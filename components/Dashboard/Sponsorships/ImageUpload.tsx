import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Image as ImageIcon, Upload, X } from "lucide-react";
import Image from "next/image";
import React, { useRef, useState } from "react";

interface IProps {
  value?: string;
  onChange: (file: File | undefined) => void;
  label?: string;
  isInvalid: boolean;
}

export default function ImageUpload({
  value,
  onChange,
  label = "Banner Image",
  isInvalid,
}: IProps) {
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      onChange(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange(file);
    }
  };

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full">
      <label
        className={cn(
          "block text-sm font-semibold mb-1.5",
          isInvalid ? "text-destructive" : "text-gray-700",
        )}
      >
        {label}
      </label>

      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative group cursor-pointer overflow-hidden rounded-xl border-2 border-dashed transition-all duration-200 w-full",
          // Perfect 21:8 ratio (same as details page)
          "aspect-21/8",
          isDragging
            ? "border-brand-500 bg-brand-50"
            : isInvalid
              ? "border-red-300 bg-red-50 hover:bg-red-100/50"
              : "border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-brand-300",
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        <AnimatePresence mode="wait">
          {value ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              {/* Full image, perfectly fitted to 21:8 */}
              <Image
                src={value}
                alt="Banner preview"
                fill
                className="object-cover" // matches how it appears on the details page
                sizes="(max-width: 1200px) 100vw, 1200px"
                priority
              />

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <p className="text-white font-medium text-sm">
                  {t("click_to_change") || "Click to change"}
                </p>
              </div>

              {/* Clear button */}
              <Button
                type="button"
                size="icon"
                variant="secondary"
                onClick={clearImage}
                className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/90 text-gray-600 hover:text-red-500 hover:bg-white shadow-sm"
              >
                <X size={16} />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center text-gray-400"
            >
              <div
                className={cn(
                  "p-3 rounded-full mb-2 transition-colors",
                  isDragging
                    ? "bg-brand-100 text-brand-500"
                    : "bg-gray-100 text-gray-400 group-hover:bg-brand-50 group-hover:text-brand-500",
                )}
              >
                {isDragging ? <Upload size={24} /> : <ImageIcon size={24} />}
              </div>
              <p className="text-sm font-medium text-gray-600">
                {isDragging
                  ? t("drop_image_here") || "Drop image here"
                  : t("click_or_drag_image") || "Click or drag image"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                PNG, JPG, WEBP • Recommended 21:8 ratio • Max 5MB
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}