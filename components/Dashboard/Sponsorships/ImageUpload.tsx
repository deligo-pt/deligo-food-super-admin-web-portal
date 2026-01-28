import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { Image as ImageIcon, Upload, X } from "lucide-react";
import Image from "next/image";
import React, { useRef, useState } from "react";

interface IProps {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
}

export default function ImageUpload({
  value,
  onChange,
  label = "Banner Image",
  error,
}: IProps) {
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
      processFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      onChange(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label}
      </label>

      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative group cursor-pointer overflow-hidden rounded-xl border-2 border-dashed transition-all duration-200
          ${isDragging ? "border-brand-500 bg-brand-50" : error ? "border-red-300 bg-red-50 hover:bg-red-100/50" : "border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-brand-300"}
          ${value ? "h-48" : "h-32"}
        `}
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
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              className="relative h-full w-full"
            >
              <Image
                src={value}
                alt="Banner preview"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <p className="text-white font-medium">Click to change</p>
              </div>
              <Button
                onClick={clearImage}
                className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full text-gray-600 hover:text-red-500 hover:bg-white transition-colors shadow-sm"
              >
                <X size={16} />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              className="absolute inset-0 flex flex-col items-center justify-center text-gray-400"
            >
              <div
                className={`
                p-3 rounded-full mb-2 transition-colors
                ${isDragging ? "bg-brand-100 text-brand-500" : "bg-gray-100 text-gray-400 group-hover:bg-brand-50 group-hover:text-brand-500"}
              `}
              >
                {isDragging ? <Upload size={24} /> : <ImageIcon size={24} />}
              </div>
              <p className="text-sm font-medium text-gray-600">
                {isDragging ? "Drop image here" : "Click or drag image"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                PNG, JPG, WEBP up to 5MB
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <motion.p
          initial={{
            opacity: 0,
            y: -10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="mt-1.5 text-xs text-red-600 font-medium"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
