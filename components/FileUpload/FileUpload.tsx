"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FileImage, Upload, X } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
interface FileUploadProps {
  label?: string;
  accept?: string;
  maxSize?: number; // in MB
  onFileSelect?: (file: File) => void;
}
export function FileUpload({
  label,
  accept = "image/*",
  maxSize = 5,
  onFileSelect,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };
  const handleFile = (file: File) => {
    setFile(file);
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
    onFileSelect?.(file);
  };
  const removeFile = () => {
    setFile(null);
    setPreview(null);
  };
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      <AnimatePresence mode="wait">
        {!file ? (
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
            className={`
              relative border-2 border-dashed rounded-xl p-8 text-center transition-colors duration-200
              ${
                isDragging
                  ? "border-[#DC3173] bg-pink-50"
                  : "border-gray-300 hover:border-[#DC3173] hover:bg-gray-50"
              }
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept={accept}
              onChange={handleFileInput}
            />
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="p-3 bg-pink-100 text-[#DC3173] rounded-full">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-gray-900">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                SVG, PNG, JPG or GIF (max. {maxSize}MB)
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              scale: 0.95,
            }}
            className="relative rounded-xl border border-gray-200 p-4 bg-white shadow-sm flex items-center gap-4"
          >
            <div className="h-16 w-16 flex-shrink-0 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
              {preview ? (
                <Image
                  src={preview}
                  alt="Preview"
                  className="h-full w-full object-cover"
                  width={500}
                  height={500}
                />
              ) : (
                <FileImage className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {file.name}
              </p>
              <p className="text-xs text-gray-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={removeFile}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
