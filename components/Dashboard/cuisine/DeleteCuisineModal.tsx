"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    softDeleteCuisineReq,
    permanentDeleteCuisineReq,
    updateCuisine
} from "@/services/dashboard/category/cuisine.service";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export interface IStatusInfo {
    cuisineId: string;
    isActive?: boolean;
    field: "isActive" | "isDeleted" | "isPermanentDelete" | "";
}

interface DeleteModalProps {
    statusInfo: IStatusInfo;
    onClose: () => void;
    t: (key: string) => string;
}

export default function DeleteCuisineModal({ statusInfo, onClose, t }: DeleteModalProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleActiveToggle = async () => {
        const toastId = toast.loading("Updating active status...");
        setIsLoading(true);
        const result = await updateCuisine(statusInfo.cuisineId, { isActive: statusInfo.isActive });

        if (result?.success) {
            toast.success(result.message || "Active status updated!", { id: toastId });
            router.refresh();
            onClose();
        } else {
            toast.error(result?.message || "Update failed", { id: toastId });
        }
        setIsLoading(false);
    };

    const handleSoftDelete = async () => {
        const toastId = toast.loading("Soft deleting cuisine...");
        setIsLoading(true);
        const result = await softDeleteCuisineReq(statusInfo.cuisineId);

        if (result?.success) {
            toast.success(result.message || "Cuisine moved to trash!", { id: toastId });
            router.refresh();
            onClose();
        } else {
            toast.error(result?.message || "Soft delete failed", { id: toastId });
        }
        setIsLoading(false);
    };

    const handlePermanentDelete = async () => {
        const toastId = toast.loading("Purging structural record...");
        setIsLoading(true);
        const result = await permanentDeleteCuisineReq(statusInfo.cuisineId);

        if (result?.success) {
            toast.success(result.message || "Cuisine purged permanently!", { id: toastId });
            router.refresh();
            onClose();
        } else {
            toast.error(result?.message || "Permanent deletion failed", { id: toastId });
        }
        setIsLoading(false);
    };

    return (
        <Dialog open={statusInfo.cuisineId.length > 0} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {statusInfo.field === "isDeleted" && t("Soft Delete")}
                        {statusInfo.field === "isPermanentDelete" && t("Permanent Delete")}
                        {statusInfo.field === "isActive" && (statusInfo.isActive ? t("Activate") : t("Deactivate"))}
                        {" "}{t("Cuisine")}
                    </DialogTitle>
                    <DialogDescription>
                        {statusInfo.field === "isPermanentDelete" ? (
                            <span className="text-red-500 font-medium">
                                Warning: This action cannot be undone. It will completely scrub this record out of the database!
                            </span>
                        ) : (
                            `${t("Are you sure you want to change this action item status to")} ${statusInfo.field === "isDeleted"
                                ? "Soft Delete"
                                : statusInfo.isActive
                                    ? "Active"
                                    : "Inactive"
                            }?`
                        )}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                    <DialogClose asChild>
                        <Button variant="outline">{t("cancel")}</Button>
                    </DialogClose>

                    {statusInfo.field === "isDeleted" && (
                        <Button variant="destructive" disabled={isLoading} onClick={handleSoftDelete}>
                            {t("Soft Delete")}
                        </Button>
                    )}

                    {statusInfo.field === "isPermanentDelete" && (
                        <Button className="bg-red-700 hover:bg-red-800 text-white" disabled={isLoading} onClick={handlePermanentDelete}>
                            {t("Delete Permanently")}
                        </Button>
                    )}
                    {statusInfo.field === "isActive" && (
                        <Button
                            onClick={handleActiveToggle}
                            disabled={isLoading}
                            className={cn(statusInfo.isActive ? "bg-green-600 hover:bg-green-500" : "bg-amber-600 hover:bg-amber-500")}
                        >
                            {statusInfo.isActive ? t("Activate") : t("Deactivate")}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}