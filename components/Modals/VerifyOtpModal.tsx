"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Clock, RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/use-translation";
import { resendOtpReq, verifyOtpReq } from "@/services/auth/otp.service";
import {
    getExpiryTime,
    removeLocalOtpExpiry,
    setLocalOtpExpiry,
} from "@/utils/localOtpExpiry";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

interface VerifyOtpModalProps {
    email: string;
    role: string;
    userId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function VerifyOtpModal({
    email,
    role,
    userId,
    open,
    onOpenChange,
}: VerifyOtpModalProps) {
    const { t } = useTranslation();
    const router = useRouter();
    const [timer, setTimer] = useState(getExpiryTime() || 0);
    const [otp, setOtp] = useState(["", "", "", ""]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isResendSubmitting, setIsResendSubmitting] = useState(false);
    const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
    const canResend = timer <= 0;

    // Reset OTP when modal opens
    useEffect(() => {
        if (open) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setOtp(["", "", "", ""]);
            setTimer(getExpiryTime() || 0);
            setTimeout(() => {
                inputRefs.current[0]?.focus();
            }, 100);
        }
    }, [open]);

    useEffect(() => {
        if (timer > 0 && open) {
            const interval = setInterval(() => setTimer((t) => t - 1), 1000);
            return () => clearInterval(interval);
        }
    }, [timer, open]);

    const handleChange = (value: string, index: number) => {
        if (/^\d*$/.test(value)) {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);
            if (value && index < 3) inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (
        e: React.KeyboardEvent<HTMLInputElement>,
        index: number,
    ) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const finalOtp = otp.join("");

        setIsSubmitting(true);
        if (finalOtp.length === 4) {
            const toastId = toast.loading("Verifying OTP...");

            const result = await verifyOtpReq({
                email,
                role,
                otp: finalOtp,
            });

            if (result.success) {
                toast.success(result.message || "OTP verified successfully!", {
                    id: toastId,
                });

                removeLocalOtpExpiry();
                onOpenChange(false);
                if (role === "VENDOR") {
                    router.push(`/admin/vendor/edit/${userId}`);
                } else if (role === "DELIVERY_PARTNER") {
                    router.push(`/admin/all-delivery-partners/edit/${userId}`);
                } else if (role === "FLEET_MANAGER") {
                    router.push(`/admin/agent/edit/${userId}`);
                }
                return;
            }

            toast.error(result.message || "OTP verification failed", { id: toastId });
            console.log(result);
        } else {
            toast.error("Please enter a valid 4-digit OTP");
        }
        setIsSubmitting(false);
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").trim();

        if (/^\d+$/.test(pastedData)) {
            const codeDigits = pastedData.slice(0, 4).split("");

            const newOtp = [...otp];
            for (let i = 0; i < 4; i++) {
                newOtp[i] = codeDigits[i] || "";
            }
            setOtp(newOtp);

            const targetIndex = Math.min(codeDigits.length, 3);
            inputRefs.current[targetIndex]?.focus();
        }
    };

    const resendOtp = async () => {
        const toastId = toast.loading("Resending OTP...");

        setIsResendSubmitting(true);
        const result = await resendOtpReq({
            email,
            role,
        });

        if (result.success) {
            setTimer(300);
            setLocalOtpExpiry();
            setIsResendSubmitting(false);

            toast.success(result.message || "OTP resent successfully!", {
                id: toastId,
            });
            return;
        }

        toast.error(result.message || "OTP resend failed", { id: toastId });
        console.log(result);
        setIsResendSubmitting(false);
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60)
            .toString()
            .padStart(2, "0");
        const s = (seconds % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden border border-pink-100 shadow-xl">
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="p-6"
                >
                    <DialogHeader className="text-center space-y-1">
                        <DialogTitle className="text-2xl font-semibold text-[#DC3173]">
                            {t("verifyOTP")}
                        </DialogTitle>
                        <DialogDescription className="text-gray-500 text-sm">
                            {t("otp4DigitCode")}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                        {/* OTP Inputs */}
                        <div className="flex justify-center gap-3 sm:gap-4">
                            {otp.map((digit, index) => (
                                <div
                                    key={index}
                                    className="relative group transition-transform duration-300 hover:scale-105"
                                >
                                    <Input
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleChange(e.target.value, index)}
                                        onKeyDown={(e) => handleKeyDown(e, index)}
                                        onPaste={handlePaste}
                                        ref={(el) => {
                                            inputRefs.current[index] = el;
                                        }}
                                        className="w-12 h-12 sm:w-14 sm:h-14 text-center text-2xl font-bold rounded-xl border border-gray-300 shadow-sm bg-white focus-visible:ring-2 focus-visible:ring-[#DC3173]/70 focus-visible:border-[#DC3173] group-hover:border-[#DC3173]/50 transition-all duration-300"
                                    />
                                    <span className="absolute inset-0 rounded-xl pointer-events-none group-focus-within:shadow-[0_0_12px_#DC3173aa] transition-all duration-300" />
                                </div>
                            ))}
                        </div>

                        {/* Timer & Resend */}
                        <div className="flex justify-between items-center text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4 text-[#DC3173]" />
                                {canResend ? (
                                    <span className="text-gray-500">{t("expired")}</span>
                                ) : (
                                    <span>
                                        {formatTime(timer)} {t("remaining")}
                                    </span>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={resendOtp}
                                disabled={!canResend || isResendSubmitting}
                                className={`flex items-center gap-1 font-medium ${canResend
                                    ? "text-[#DC3173] hover:text-[#a72b5c]"
                                    : "text-gray-400 cursor-not-allowed"
                                    } transition-colors`}
                            >
                                <RefreshCcw className="w-4 h-4" />
                                {t("resendOTP")}
                            </button>
                        </div>

                        {/* Verify Button */}
                        <Button
                            type="submit"
                            disabled={
                                isSubmitting ||
                                isResendSubmitting ||
                                otp.join("").length !== 4
                            }
                            className="w-full bg-[#DC3173] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-[#a72b5c] transition-all duration-300 text-white text-lg font-medium py-2 rounded-lg shadow-md hover:shadow-lg"
                        >
                            {isSubmitting ? "Verifying..." : t("verify")}
                        </Button>
                    </form>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
}