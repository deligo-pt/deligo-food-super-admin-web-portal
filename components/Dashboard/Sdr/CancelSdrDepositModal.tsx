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
import { cancelSdrDeposit } from "@/services/dashboard/sdr-deposits/sdr-deposits.service";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
    cancelId: string;
    onClose: () => void;
    t: (key: string) => string;
}

export default function CancelSdrDepositModal({ cancelId, onClose, t }: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleCancel = async () => {
        if (!cancelId) return;

        setIsLoading(true);
        const toastId = toast.loading(t("cancelling") || "Cancelling...");

        const result = await cancelSdrDeposit(cancelId);

        if (result.success) {
            toast.success(result.message || "SDR Deposit cancelled successfully", {
                id: toastId,
            });
            onClose();
            router.refresh();
        } else {
            toast.error(result.message || "Failed to cancel SDR Deposit", {
                id: toastId,
            });
        }

        setIsLoading(false);
    };

    return (
        <AlertDialog open={!!cancelId} onOpenChange={(open) => !open && onClose()}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {t("confirm_cancel_sdr") || "Cancel SDR Deposit?"}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {t("confirm_cancel_sdr_desc") ||
                            "This action cannot be undone. Only deposits that have not started yet can be cancelled."}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>
                        {t("keep") || "Keep"}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleCancel}
                        disabled={isLoading}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        {isLoading
                            ? t("cancelling") || "Cancelling..."
                            : t("yes_cancel") || "Yes, Cancel"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}