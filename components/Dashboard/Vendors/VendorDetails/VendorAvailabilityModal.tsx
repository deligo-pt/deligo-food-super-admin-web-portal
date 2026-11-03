"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/hooks/use-translation";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { addHours, formatISO } from "date-fns";
import { setVendorAvailabilityOverrideReq } from "@/services/dashboard/vendor/vendor.service";

interface IProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    vendorId: string;
    vendorName: string;
}

export default function VendorAvailabilityModal({
    open,
    onOpenChange,
    vendorId,
    vendorName,
}: IProps) {
    const { t } = useTranslation();
    const router = useRouter();

    const [status, setStatus] = useState<"PAUSED" | "SUSPENDED">("PAUSED");
    const [until, setUntil] = useState("");
    const [reason, setReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const reset = () => {
        setStatus("PAUSED");
        setUntil("");
        setReason("");
    };

    const handleClose = (open: boolean) => {
        if (!open) reset();
        onOpenChange(open);
    };

    const handleSubmit = async () => {
        // Client-side validation
        if (!reason || reason.trim().length < 3 || reason.trim().length > 200) {
            toast.error("Reason must be between 3 and 200 characters");
            return;
        }
        if (!until) {
            toast.error("Please select a resume / end time");
            return;
        }

        const untilDate = new Date(until);
        const now = new Date();
        const maxUntil = addHours(now, 24);

        if (untilDate <= now) {
            toast.error("Until time must be in the future");
            return;
        }
        if (untilDate > maxUntil) {
            toast.error("Until time cannot be more than 24 hours from now");
            return;
        }

        const toastId = toast.loading(
            status === "PAUSED" ? "Pausing vendor..." : "Suspending vendor..."
        );
        setIsSubmitting(true);

        try {
            const result = await setVendorAvailabilityOverrideReq({
                status,
                until: formatISO(untilDate),
                reason: reason.trim(),
            }, vendorId);

            if (result?.success) {
                toast.success(result?.message ||
                    status === "PAUSED"
                    ? "Vendor paused successfully"
                    : "Vendor suspended successfully",
                    { id: toastId }
                );
                handleClose(false);
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
                toast.error(result?.message || "Failed to update availability", {
                    id: toastId,
                });
            }

        } finally {
            setIsSubmitting(false);
        }
    };

    // Helper: min datetime for the input (now + a few minutes)
    const minDateTime = formatISO(addHours(new Date(), 0.1)).slice(0, 16);
    const maxDateTime = formatISO(addHours(new Date(), 24)).slice(0, 16);

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {t("pause_or_suspend_vendor") || "Pause / Suspend Vendor"}
                    </DialogTitle>
                    <DialogDescription>
                        <span className="font-semibold">{vendorName}</span> — {t("customers_will_see_store_as_closed_until_selected_time")}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* Status */}
                    <div className="space-y-2">
                        <Label>{t("status") || "Status"}</Label>
                        <Select
                            value={status}
                            onValueChange={(v) => setStatus(v as "PAUSED" | "SUSPENDED")}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="w-full">
                                <SelectItem value="PAUSED">
                                    {t("paused_visible_to_customers")}
                                </SelectItem>
                                <SelectItem value="SUSPENDED">
                                    {t("suspended_hidden_from_customers")}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            {status === "PAUSED"
                                ? t("store_stays_visible_but_marked_as_temporarily_closed")
                                : t("store_is_completely_hidden_from_the_customer_app")}
                        </p>
                    </div>

                    {/* Until */}
                    <div className="space-y-2">
                        <Label>{t("until_max_24h") || "Until (max 24 h)"}</Label>
                        <Input
                            type="datetime-local"
                            value={until}
                            min={minDateTime}
                            max={maxDateTime}
                            onChange={(e) => setUntil(e.target.value)}
                        />
                    </div>

                    {/* Reason */}
                    <div className="space-y-2">
                        <Label>
                            {t("reason") || "Reason"}{" "}
                            <span className="text-xs text-muted-foreground">(3–200 chars)</span>
                        </Label>
                        <Textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder={t("administrative_suspension_maintenance")}
                            rows={3}
                            maxLength={200}
                        />
                        <p className="text-xs text-right text-muted-foreground">
                            {reason.length}/200
                        </p>
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button
                        variant="outline"
                        onClick={() => handleClose(false)}
                        disabled={isSubmitting}
                    >
                        {t("cancel") || "Cancel"}
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="bg-[#DC3173] hover:bg-[#c22762]"
                    >
                        {isSubmitting
                            ? t("saving") || "Saving..."
                            : status === "PAUSED"
                                ? t("pause_vendor") || "Pause Vendor"
                                : t("suspend_vendor") || "Suspend Vendor"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}