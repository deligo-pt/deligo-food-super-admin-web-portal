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

export default function CompleteDeliveryModal({
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

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {t("complete_delivery_manually") || "Complete Delivery Manually"}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-3 text-sm text-muted-foreground">
                    <p>
                        {t("order_will_be_marked_as_delivered") ||
                            "Order will be marked DELIVERED. Any open exception is closed. Requires proof (customer YES or verified OTP while exception was open)."}
                    </p>
                </div>

                <div className="space-y-2 py-2">
                    <Label>{t("reason")} <span className="text-red-600">*</span> (10–500 characters)</Label>
                    <Textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={4}
                        placeholder={
                            t("why_are_you_completing_delivery") ||
                            "Why are you completing this delivery manually?"
                        }
                    />
                    <p className="text-xs text-muted-foreground">
                        {reason.trim().length}/500
                    </p>
                </div>

                <DialogFooter className="gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isSubmitting}
                    >
                        {t("cancel")}
                    </Button>
                    <Button onClick={handleConfirm} disabled={isSubmitting || !isValid}>
                        {isSubmitting ? t("processing") : t("complete_delivery")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}