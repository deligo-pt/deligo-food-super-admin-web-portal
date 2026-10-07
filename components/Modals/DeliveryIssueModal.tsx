"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/hooks/use-translation";
import { Lock, AlertTriangle, RotateCcw, MessageSquare } from "lucide-react";

export type DeliveryIssueType = "DELIVERY_OTP_LOCKED" | "DELIVERY_VERIFICATION";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    orderId: string;
    orderStatus?: string;
    issueType: DeliveryIssueType;
    onResetOtp: () => void;
    onRequestConfirmation: () => void;
    onViewOrder: () => void;
}

export default function DeliveryIssueModal({
    open,
    onOpenChange,
    orderId,
    orderStatus,
    issueType,
    onResetOtp,
    onRequestConfirmation,
    onViewOrder,
}: Props) {
    const { t } = useTranslation();

    const isOtpLocked = issueType === "DELIVERY_OTP_LOCKED";
    const isVerification = issueType === "DELIVERY_VERIFICATION";

    const title = isOtpLocked
        ? t("delivery_otp_locked") || "Delivery OTP Locked"
        : t("delivery_verification_issue") || "Delivery Verification Issue";

    const description = isOtpLocked
        ? t("otp_locked_desc") ||
        "The delivery code was entered incorrectly too many times. Reset the OTP so the same rider can continue."
        : t("verification_issue_desc") ||
        "The rider reported a verification issue. You can reset the OTP (same rider continues) or request the customer to confirm they received the order.";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {isOtpLocked ? (
                            <Lock className="h-5 w-5 text-red-600" />
                        ) : (
                            <AlertTriangle className="h-5 w-5 text-amber-600" />
                        )}
                        {title}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="flex flex-wrap gap-2 text-xs">
                        <Badge variant="outline">{orderId}</Badge>
                        {orderStatus && (
                            <Badge variant="secondary">
                                {orderStatus.replace(/_/g, " ")}
                            </Badge>
                        )}
                    </div>

                    <p className="text-sm text-muted-foreground">{description}</p>

                    <div className="grid gap-2">
                        {/* Always available – first recovery */}
                        <Button
                            variant="outline"
                            className="justify-start gap-2 h-11"
                            onClick={() => {
                                onOpenChange(false);
                                onResetOtp();
                            }}
                        >
                            <RotateCcw className="h-4 w-4" />
                            {t("reset_otp") || "Reset OTP"}
                            <span className="ml-auto text-[10px] text-muted-foreground">
                                {t("same_rider_continues") || "Same rider continues"}
                            </span>
                        </Button>

                        {/* Only for Verification issue */}
                        {isVerification && (
                            <Button
                                variant="outline"
                                className="justify-start gap-2 h-11"
                                onClick={() => {
                                    onOpenChange(false);
                                    onRequestConfirmation();
                                }}
                            >
                                <MessageSquare className="h-4 w-4" />
                                {t("request_receipt_confirmation") ||
                                    "Request Receipt Confirmation"}
                            </Button>
                        )}
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:justify-between">
                    <Button variant="ghost" size="sm" onClick={onViewOrder}>
                        {t("view_order") || "View Order"}
                    </Button>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        {t("close") || "Close"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}