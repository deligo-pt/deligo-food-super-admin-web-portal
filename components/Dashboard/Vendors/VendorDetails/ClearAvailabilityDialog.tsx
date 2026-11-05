"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTranslation } from "@/hooks/use-translation";
import { clearVendorAvailabilityOverrideReq } from "@/services/dashboard/vendor/vendor.service";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface IProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    vendorId: string;
    vendorName: string;
    currentStatus?: string;
    until?: string;
}

export default function ClearAvailabilityDialog({
    open,
    onOpenChange,
    vendorId,
    vendorName,
    currentStatus,
    until,
}: IProps) {
    const { t } = useTranslation();
    const router = useRouter();
    const [isClearing, setIsClearing] = useState(false);

    const handleConfirm = async () => {
        const toastId = toast.loading("Clearing availability override...");
        setIsClearing(true);

        try {
            const result = await clearVendorAvailabilityOverrideReq(vendorId);

            if (result?.success) {
                toast.success(result?.message || "Override cleared. Store returned to normal schedule.", {
                    id: toastId,
                });
                onOpenChange(false);
                router.refresh();
                return;
            }

            const errorSources = result?.data?.errorSources;
            if (errorSources?.length > 0) {
                toast.error(
                    errorSources
                        ?.map((err: { path: string; message: string }) => err?.message)
                        .join(", "),
                    { id: toastId }
                );
            } else {
                toast.error(result?.message || "Failed to clear override", {
                    id: toastId,
                });
            }

        } finally {
            setIsClearing(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {t("clear_availability_override") || "Clear Availability Override?"}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="space-y-2">
                        <p>
                            {t("this_will_immediately_remove_the_current")}{" "}
                            <strong>{currentStatus}</strong> {t("override_for")}{" "}
                            <strong>{vendorName}</strong> {t("and_return_the_store_its_normal_opening")}
                        </p>
                        {until && (
                            <p className="text-sm text-muted-foreground">
                                {t("currently_scheduled_until")}:{" "}
                                {new Date(until).toLocaleString()}
                            </p>
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isClearing}>
                        {t("cancel") || "Cancel"}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        disabled={isClearing}
                        className="bg-[#DC3173] hover:bg-[#c22762]"
                    >
                        {isClearing
                            ? t("clearing") || "Clearing..."
                            : t("clear_override") || "Clear Override"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}