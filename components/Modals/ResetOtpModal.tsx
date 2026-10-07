"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/hooks/use-translation";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (payload: { reason: string }) => void;
    isSubmitting: boolean;
}

export default function ResetOtpModal({
    open,
    onOpenChange,
    onConfirm,
    isSubmitting,
}: Props) {
    const { t } = useTranslation();
    const [reason, setReason] = useState("");

    const isValid = reason.trim().length >= 10 && reason.trim().length <= 500;

    const handleConfirm = () => {
        if (!isValid) return;
        onConfirm({ reason: reason.trim() });
    };

    // Reset local state when modal closes
    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen) setReason("");
        onOpenChange(nextOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t("reset_delivery_otp") || "Reset Delivery OTP"}</DialogTitle>
                </DialogHeader>

                <div className="space-y-3 text-sm text-muted-foreground">
                    <p>
                        {t("a_new_delivery_otp_will_be_generated_and_sent_to_customer") ||
                            "A new delivery OTP will be generated and sent to the customer. Attempts are reset to 0 and the lock is cleared. This does not close an open RIDER_SOS."}
                    </p>
                </div>

                <div className="space-y-2 py-2">
                    <Label>{t("reason")} <span className="text-red-600">*</span> (10–500 characters)</Label>
                    <Textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={4}
                        placeholder={
                            t("why_are_you_resetting_otp") ||
                            "Why are you resetting the delivery OTP?"
                        }
                        disabled={isSubmitting}
                    />
                    <p className="text-xs text-muted-foreground">
                        {reason.trim().length}/500
                    </p>
                </div>

                <DialogFooter className="gap-2">
                    <Button
                        variant="outline"
                        onClick={() => handleOpenChange(false)}
                        disabled={isSubmitting}
                    >
                        {t("cancel")}
                    </Button>
                    <Button className="bg-[#DC3173]" onClick={handleConfirm} disabled={isSubmitting || !isValid}>
                        {isSubmitting ? t("processing") : t("reset_otp")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}