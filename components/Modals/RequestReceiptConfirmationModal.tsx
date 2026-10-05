"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/use-translation";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    isSubmitting: boolean;
}

export default function RequestReceiptConfirmationModal({
    open,
    onOpenChange,
    onConfirm,
    isSubmitting,
}: Props) {
    const { t } = useTranslation();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {t("request_receipt_confirmation") || "Request Receipt Confirmation"}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-3 text-sm text-muted-foreground">
                    <p>
                        {t("request_receipt_confirmation_desc") ||
                            "This will send a push + socket event to the customer asking them to confirm they received the order."}
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Allowed only if the rider reported <strong>productHandedOver: true</strong></li>
                        <li>Order must be <strong>PICKED_UP</strong> or <strong>ON_THE_WAY</strong></li>
                        <li>A second request returns 409</li>
                    </ul>
                </div>

                <DialogFooter className="gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isSubmitting}
                    >
                        {t("cancel")}
                    </Button>
                    <Button onClick={onConfirm} disabled={isSubmitting}>
                        {isSubmitting
                            ? t("processing")
                            : t("send_request") || "Send Request to Customer"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}