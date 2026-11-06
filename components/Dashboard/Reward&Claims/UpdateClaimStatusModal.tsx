// src/components/Dashboard/Reward&Claims/UpdateClaimStatusModal.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/hooks/use-translation";
import { updateClaimedReward } from "@/services/dashboard/reward&claims/reward-claims.service";
import { IRewardClaim } from "@/types/reward-claim.type";
import {
    ClaimRemarksFormValues,
    claimRemarksFormSchema,
    ClaimUiAction,
    updateClaimStatusSchema,
} from "@/validations/reward-claim/reward-claim.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { getClaimHolder } from "./GetRewardClaimColumns";

interface IProps {
    claim: IRewardClaim | null;
    action: ClaimUiAction | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

interface FormProps {
    claim: IRewardClaim;
    action: ClaimUiAction;
    onClose: () => void;
    onSuccess?: () => void;
    onPendingChange: (pending: boolean) => void;
}

function ClaimStatusForm({ claim, action, onClose, onSuccess, onPendingChange }: FormProps) {
    const { t } = useTranslation();
    const isCancel = action === "CANCELLED";
    const holder = getClaimHolder(claim);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ClaimRemarksFormValues>({
        resolver: zodResolver(claimRemarksFormSchema),
        defaultValues: { remarks: "" },
    });

    const onSubmit = async ({ remarks }: ClaimRemarksFormValues) => {
        // Only send remarks when filled in; the body is strict.
        const parsed = updateClaimStatusSchema.safeParse({
            status: action,
            ...(remarks ? { remarks } : {}),
        });
        if (!parsed.success) {
            toast.error(parsed.error.issues[0]?.message ?? "Invalid data");
            return;
        }

        onPendingChange(true);
        const toastId = toast.loading(isCancel ? "Cancelling claim..." : "Updating claim...");
        try {
            const result = await updateClaimedReward(claim._id, parsed.data);
            if (result?.success) {
                toast.success(result.message || "Reward claim updated successfully.", { id: toastId });
                onClose();
                onSuccess?.();
            } else {
                // e.g. 409 REWARD_CLAIM_STATUS_INVALID states the current and requested status
                toast.error(result?.message || "Failed to update claim", { id: toastId });
            }
        } finally {
            onPendingChange(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div
                className="rounded-xl border bg-gray-50/60 p-3 text-sm space-y-1"
                style={{ borderColor: "#DC317320" }}
            >
                <div className="flex justify-between gap-4">
                    <span className="text-gray-400">{t("claimed_by") || "Claimed by"}</span>
                    <span className="font-medium text-gray-800 text-right">{holder.name}</span>
                </div>
                <div className="flex justify-between gap-4">
                    <span className="text-gray-400">{t("product") || "Product"}</span>
                    <span className="font-medium text-gray-800 text-right">
                        {claim.productId?.name ?? "—"}
                    </span>
                </div>
                <div className="flex justify-between gap-4">
                    <span className="text-gray-400">{t("points_spent") || "Points"}</span>
                    <span className="font-medium text-gray-800">{claim.pointsSpent.toLocaleString()} pts</span>
                </div>
                <div className="flex justify-between gap-4">
                    <span className="text-gray-400">{t("cash_to_collect") || "Cash at pickup"}</span>
                    <span className="font-medium text-gray-800">€{claim.cashAmount.toFixed(2)}</span>
                </div>
            </div>

            {isCancel && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                    {t("cancel_refund_note") ||
                        "Cancelling refunds the points to the user automatically. This can't be undone."}
                </p>
            )}

            <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">
                    {isCancel
                        ? t("cancel_reason") || "Reason for cancelling"
                        : t("remarks") || "Remarks"}{" "}
                    <span className="text-gray-400 font-normal">(optional)</span>
                </Label>
                <Textarea
                    {...register("remarks")}
                    maxLength={500}
                    placeholder={
                        isCancel ? "e.g. Item out of stock" : "e.g. Handed over at the office"
                    }
                    className="min-h-20 resize-none"
                    disabled={isSubmitting}
                />
                {errors.remarks && <p className="text-xs text-red-500">{errors.remarks.message}</p>}
            </div>

            <div className="flex justify-end gap-2 border-t pt-4" style={{ borderColor: "#DC317315" }}>
                <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
                    {isCancel ? t("keep_claim") || "Keep claim" : t("cancel") || "Cancel"}
                </Button>
                <Button
                    type="submit"
                    size="sm"
                    disabled={isSubmitting}
                    variant={isCancel ? "destructive" : "default"}
                    className="font-medium text-white"
                    style={isCancel ? undefined : { backgroundColor: "#DC3173" }}
                >
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isCancel ? t("cancel_claim") || "Cancel claim" : t("mark_collected") || "Mark collected"}
                </Button>
            </div>
        </form>
    );
}

export default function UpdateClaimStatusModal({ claim, action, open, onOpenChange, onSuccess }: IProps) {
    const { t } = useTranslation();
    const [isPending, setIsPending] = useState(false);
    const isCancel = action === "CANCELLED";

    return (
        <Dialog open={open} onOpenChange={(o) => !isPending && onOpenChange(o)}>
            <DialogContent className="w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto p-6">
                <DialogHeader className="pb-2">
                    <DialogTitle
                        className="flex items-center gap-2"
                        style={{ color: isCancel ? "#dc2626" : "#DC3173" }}
                    >
                        {isCancel ? <XCircle size={18} /> : <CheckCircle2 size={18} />}
                        {isCancel
                            ? t("cancel_claim") || "Cancel claim"
                            : t("mark_collected") || "Mark collected"}
                    </DialogTitle>
                    <DialogDescription>
                        {isCancel
                            ? t("cancel_claim_desc") || "The user won't be able to collect this reward."
                            : t("mark_collected_desc") || "Confirm the user has picked up this reward."}
                    </DialogDescription>
                </DialogHeader>

                {claim && action && (
                    <ClaimStatusForm
                        key={`${claim._id}-${action}`}
                        claim={claim}
                        action={action}
                        onClose={() => onOpenChange(false)}
                        onSuccess={onSuccess}
                        onPendingChange={setIsPending}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}