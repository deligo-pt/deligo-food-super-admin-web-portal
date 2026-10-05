"use client";

import { useTranslation } from "@/hooks/use-translation";
import { TDeliveryException, TExceptionAction } from "@/types/delivery-exception.type";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { getDeliveryExceptionColumns } from "./DeliveryExceptionColumns";
import ReusableTable from "@/components/common/ReusableTable";
import { TMeta } from "@/types";
import { useState } from "react";
import { toast } from "sonner";
import {
    acknowledgeExceptionReq,
    resolveExceptionReq,
    replacePartnerReq,
    faultCancelReq,
    resetDeliveryOtpReq,
} from "@/services/dashboard/order/order.service";

// Modals
import AcknowledgeModal from "@/components/Modals/AcknowledgeModal";
import ResolveModal from "@/components/Modals/ResolveModal";
import ReplaceRiderModal from "@/components/Modals/ReplaceRiderModal";
import FaultCancelModal from "@/components/Modals/FaultCancelModal";
import ResetOtpModal from "@/components/Modals/ResetOtpModal";

interface IProps {
    exceptions: TDeliveryException[];
    meta: TMeta;
}

export default function DeliveryExceptionTable({ exceptions, meta }: IProps) {
    const { t } = useTranslation();
    const router = useRouter();
    const [action, setAction] = useState<TExceptionAction | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const close = () => setAction(null);

    const handleAcknowledge = async () => {
        if (!action || action.type !== "acknowledge") return;
        const toastId = toast.loading(t("acknowledging") || "Acknowledging...");
        setIsSubmitting(true);
        try {
            const res = await acknowledgeExceptionReq(action.orderId);
            if (res?.success) {
                toast.success(res.message || "Acknowledged", { id: toastId });
                router.refresh();
                close();
                return;
            }

            if (res?.data?.errorSources) {
                res.data.errorSources.forEach(
                    (err: { path: string; message: string }) =>
                        toast.error(err?.message, { id: toastId })
                );
                return;
            }

            toast.error(res.message || "Acknowledge failed", {
                id: toastId,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResolve = async (payload: {
        resolution: "RIDER_CONTINUES" | "FALSE_ALARM";
        note?: string;
    }) => {
        if (!action || action.type !== "resolve") return;
        const toastId = toast.loading("Resolving...");
        setIsSubmitting(true);
        try {
            const res = await resolveExceptionReq(action.orderId, payload);
            if (res?.success) {
                toast.success(res.message || "Resolved", { id: toastId });
                router.refresh();
                close();
                return;
            }

            if (res?.data?.errorSources) {
                res.data.errorSources.forEach(
                    (err: { path: string; message: string }) =>
                        toast.error(err?.message, { id: toastId })
                );
                return;
            }

            toast.error(res.message || "Resolve failed", {
                id: toastId,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReplace = async (payload: {
        deliveryPartnerId: string;
        note?: string;
    }) => {
        if (!action || action.type !== "replace") return;
        const toastId = toast.loading("Replacing rider...");
        setIsSubmitting(true);
        try {
            const res = await replacePartnerReq(action.orderId, payload);
            if (res?.success) {
                toast.success(res.message || "Rider replaced", { id: toastId });
                router.refresh();
                close();
                return;
            }

            if (res?.data?.errorSources) {
                res.data.errorSources.forEach(
                    (err: { path: string; message: string }) =>
                        toast.error(err?.message, { id: toastId })
                );
                return;
            }

            toast.error(res.message || "Replacing rider failed", {
                id: toastId,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFaultCancel = async (payload: { reason: string }) => {
        if (!action || action.type !== "faultCancel") return;
        const toastId = toast.loading("Cancelling...");
        setIsSubmitting(true);
        try {
            const res = await faultCancelReq(action.orderId, payload);
            if (res?.success) {
                toast.success(res.message || "Order fault-cancelled", { id: toastId });
                router.refresh();
                close();
                return;
            }

            if (res?.data?.errorSources) {
                res.data.errorSources.forEach(
                    (err: { path: string; message: string }) =>
                        toast.error(err?.message, { id: toastId })
                );
                return;
            }

            toast.error(res.message || "Fault Cancel failed", {
                id: toastId,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResetOtp = async (payload: { reason: string }) => {
        if (!action || action.type !== "resetOtp") return;

        const toastId = toast.loading("Resetting OTP...");
        setIsSubmitting(true);

        try {
            const res = await resetDeliveryOtpReq(action.orderId, payload);
            if (res?.success) {
                toast.success(res.message || "OTP reset", { id: toastId });
                router.refresh();
                close();
                return;
            }


            if (res?.data?.errorSources) {
                res.data.errorSources.forEach(
                    (err: { path: string; message: string }) =>
                        toast.error(err?.message, { id: toastId })
                );
                return;
            }

            toast.error(res.message || "Reset otp failed", {
                id: toastId,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const columns = getDeliveryExceptionColumns({
        t,
        router,
        setAction,
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white shadow-md rounded-2xl p-4 md:p-6 mb-2 overflow-x-auto"
        >
            <ReusableTable
                data={exceptions}
                meta={meta}
                columns={columns}
                getRowKey={(row) => row.orderId}
                emptyMessage={t("no_delivery_exceptions_found")}
            />

            {/* Modals */}
            <AcknowledgeModal
                open={action?.type === "acknowledge"}
                onOpenChange={(open) => !open && close()}
                onConfirm={handleAcknowledge}
                isSubmitting={isSubmitting}
            />

            <ResolveModal
                open={action?.type === "resolve"}
                onOpenChange={(open) => !open && close()}
                onConfirm={handleResolve}
                isSubmitting={isSubmitting}
            />

            <ReplaceRiderModal
                open={action?.type === "replace"}
                orderId={action?.type === "replace" ? action.orderId : ""}
                onOpenChange={(open) => !open && close()}
                onConfirm={handleReplace}
                isSubmitting={isSubmitting}
            />

            <FaultCancelModal
                open={action?.type === "faultCancel"}
                onOpenChange={(open) => !open && close()}
                onConfirm={handleFaultCancel}
                isSubmitting={isSubmitting}
            />

            <ResetOtpModal
                open={action?.type === "resetOtp"}
                onOpenChange={(open) => !open && close()}
                onConfirm={handleResetOtp}
                isSubmitting={isSubmitting}
            />
        </motion.div>
    );
}