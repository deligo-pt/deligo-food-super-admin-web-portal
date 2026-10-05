"use client";

import { uploadImagesReq } from "@/services/upload/upload.service";
import { useState, useCallback } from "react";
import { toast } from "sonner";

type ImageKey = string;

export function useImageUploads(initialValues: Record<ImageKey, string | null> = {}) {
    const [images, setImages] = useState<Record<ImageKey, string | null>>(initialValues);
    const [uploading, setUploading] = useState<Record<ImageKey, boolean>>({});

    const handleUpload = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>, key: ImageKey) => {
            const file = e.target.files?.[0];
            if (!file) return;

            if (!file.type.startsWith("image/")) {
                toast.error("Please upload an image file (PNG, JPG, etc.)");
                return;
            }

            const toastId = toast.loading("Uploading image...");
            setUploading((prev) => ({ ...prev, [key]: true }));

            try {
                const uploadResult = await uploadImagesReq([file]);

                if (uploadResult.success && uploadResult.data?.[0]) {
                    setImages((prev) => ({ ...prev, [key]: uploadResult.data[0] }));
                    toast.success("Image uploaded successfully!", { id: toastId });
                } else {
                    toast.error(uploadResult.message || "Upload failed", { id: toastId });
                }

            } finally {
                setUploading((prev) => ({ ...prev, [key]: false }));
            }
        },
        []
    );

    const clearImage = useCallback((key: ImageKey) => {
        setImages((prev) => ({ ...prev, [key]: null }));
    }, []);

    const getImage = (key: ImageKey) => images[key] ?? null;
    const isUploading = (key: ImageKey) => !!uploading[key];

    return {
        images,
        handleUpload,
        clearImage,
        getImage,
        isUploading,
        setImages, // useful if you need to reset from outside
    };
}