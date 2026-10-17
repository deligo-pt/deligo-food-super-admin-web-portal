"use client";

import TitleHeader from "@/components/TitleHeader/TitleHeader";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";
import { catchAsync } from "@/utils/catchAsync";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { sdrDepositValidation, TSdrDepositForm } from "@/validations/sdr-deposits/sdr-deposits.validation";
import { createSdrDeposit, CreateSdrDepositPayload } from "@/services/dashboard/sdr-deposits/sdr-deposits.service";
import { getTodayDateString } from "@/utils/formatTime";

export default function CreateSdrDeposit() {
    const { t } = useTranslation();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<TSdrDepositForm>({
        resolver: zodResolver(sdrDepositValidation),
        defaultValues: {
            depositAmount: 0,
            isActive: false,
            effectiveFrom: "",
            note: "",
        },
    });

    const onSubmit = async (data: TSdrDepositForm) => {
        setIsSubmitting(true);
        const toastId = toast.loading("Creating SDR Deposit...");

        const payload: CreateSdrDepositPayload = {
            depositAmount: data.depositAmount,
            isActive: data.isActive,
            ...(data.effectiveFrom && {
                effectiveFrom: new Date(data.effectiveFrom + "T00:00:00.000Z").toISOString(),
            }),
            ...(data.note && data.note.trim() && { note: data.note.trim() }),
        };

        const result = await catchAsync(async () => {
            return await createSdrDeposit(payload);
        });

        if (result.success) {
            toast.success(result.message || "SDR Deposit created successfully!", {
                id: toastId,
            });
            form.reset();
            setIsSubmitting(false);
            router.push("/admin/sdr/all");
            return;
        }

        toast.error(result.message || "Failed to create SDR Deposit", {
            id: toastId,
        });
        setIsSubmitting(false);
    };

    return (
        <div className="">
            <TitleHeader
                title={t("create_sdr_deposit") || "Create SDR Deposit"}
                subtitle={
                    t("create_a_new_sdr_deposit") ||
                    "Set deposit amount and activation rules"
                }
            />

            <div className="mt-6 max-w-2xl mx-auto">
                <Card className="border shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">
                            {t("create_sdr_deposit") || "Create SDR Deposit"}
                        </CardTitle>
                        <CardDescription>
                            {t("create_a_new_sdr_deposit_desc") ||
                                "Define the deposit amount, effective date and activation status"}
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="space-y-5"
                            >
                                {/* Deposit Amount */}
                                <FormField
                                    control={form.control}
                                    name="depositAmount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                {t("deposit_amount") || "Deposit Amount"}{" "}
                                                <span className="text-red-600">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    min={0}
                                                    max={5}
                                                    placeholder="e.g. 0.15"
                                                    {...field}
                                                    value={field.value}
                                                    onChange={(e) => {
                                                        const val =
                                                            e.target.value === ""
                                                                ? 0
                                                                : parseFloat(e.target.value);
                                                        field.onChange(isNaN(val) ? 0 : val);
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Effective From (date only) */}
                                <FormField
                                    control={form.control}
                                    name="effectiveFrom"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                {t("effective_from") || "Effective From"}{" "}
                                                <span className="text-gray-400 font-normal">
                                                    (Optional)
                                                </span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="date"
                                                    min={getTodayDateString()}
                                                    value={field.value || ""}
                                                    onChange={(e) => field.onChange(e.target.value)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Note */}
                                <FormField
                                    control={form.control}
                                    name="note"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                {t("note") || "Note"}{" "}
                                                <span className="text-gray-400 font-normal">
                                                    (Optional)
                                                </span>
                                            </FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="e.g. Postman SDR Phase 1 - active upcoming"
                                                    className="resize-none"
                                                    rows={3}
                                                    {...field}
                                                    value={field.value || ""}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Active Status */}
                                <FormField
                                    control={form.control}
                                    name="isActive"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <FormLabel>
                                                    {t("active_status") || "Active Status"}
                                                </FormLabel>
                                                <p className="text-sm text-muted-foreground">
                                                    {t("active_status_desc") ||
                                                        "If enabled, deposit amount must be greater than 0"}
                                                </p>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                    className="data-[state=checked]:bg-[#DC3173]"
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={isSubmitting}
                                    type="submit"
                                    className={cn(
                                        "w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-[#DC3173] shadow-lg transition-all",
                                        isSubmitting ? "cursor-wait" : "hover:bg-[#DC3173]/90"
                                    )}
                                >
                                    {isSubmitting ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Plus size={20} />
                                            {t("create_sdr_deposit") || "Create SDR Deposit"}
                                        </>
                                    )}
                                </motion.button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}