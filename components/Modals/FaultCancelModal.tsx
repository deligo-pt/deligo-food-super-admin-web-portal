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

export default function FaultCancelModal({
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
                    <DialogTitle className="text-red-600">
                        {t("fault_cancel") || "Fault Cancel"}
                    </DialogTitle>
                </DialogHeader>

                <p className="text-sm text-muted-foreground">
                    {t("this_will_cancel_the_order") ||
                        "This will cancel the order, set refund to PENDING, close the exception and set the rider OFFLINE. Stock is not restored."}
                </p>

                <div className="space-y-2 py-2">
                    <Label>{t("reason")} <span className="text-red-600">*</span> (10–500 characters)</Label>
                    <Textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={4}
                        placeholder={t("explain_why_you_are_cancelling") || "Explain why the delivery failed..."}
                    />
                    <p className="text-xs text-muted-foreground">
                        {reason.trim().length}/500
                    </p>
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                        {t("cancel")}
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleConfirm}
                        disabled={isSubmitting || !isValid}
                    >
                        {isSubmitting ? t("processing") : t("fault_cancel")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}