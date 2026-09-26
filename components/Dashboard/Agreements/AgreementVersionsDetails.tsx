/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";

import { useTranslation } from "@/hooks/use-translation";
import { IAgreementVersion, ICommissionRate } from "@/types/agreement.type";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    ArrowLeft,
    Edit,
    Eye,
    Send,
    FileText,
    Calendar,
    User,
    CheckCircle2,
    Loader2,
    Percent,
    RefreshCw,
} from "lucide-react";
import {
    previewAgreementVersion,
    publishDraftAgreement,
    createCommissionRate,
    cancelEffectiveRate,
} from "@/services/dashboard/agreement/agreement.service";
import { toast } from "sonner";
import { TTax } from "@/types/tax.type";
import { TMeta } from "@/types";
import { getCommissionRatesColumns } from "./getCommissionRatesColumns";
import ReusableTable from "@/components/common/ReusableTable";
import DeleteModal from "@/components/Modals/DeleteModal";

interface IProps {
    agreeVersion: IAgreementVersion;
    effectiveRate?: any;
    allCommissionRates: ICommissionRate[] | { data: ICommissionRate[]; meta?: TMeta };
    taxes: TTax[];
}

// Schemas
const publishSchema = z.object({
    effectiveFrom: z.string().refine(
        (val) => {
            if (!val) return false;
            const selectedDate = new Date(val);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return selectedDate > today;
        },
        { message: "Effective date must be in the future" }
    ),
});

type TPublishForm = z.infer<typeof publishSchema>;

const commissionSchema = z.object({
    platformPercent: z.coerce
        .number()
        .min(0, "Must be ≥ 0")
        .max(100, "Must be ≤ 100"),
    platformVatRate: z.coerce
        .number()
        .min(0, "Must be ≥ 0")
        .max(100, "Must be ≤ 100"),
    note: z.string().optional(),
});

type TCommissionForm = z.input<typeof commissionSchema>;
type TCommissionFormOutput = z.output<typeof commissionSchema>;

type ChangeRateStep = "question" | "form";

export default function AgreementVersionsDetails({
    agreeVersion,
    allCommissionRates,
    taxes,
}: IProps) {
    const { t, lang } = useTranslation();
    const router = useRouter();

    // Publish
    const [isPublishOpen, setIsPublishOpen] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);

    // Change Rate flow
    const [isChangeRateOpen, setIsChangeRateOpen] = useState(false);
    const [changeRateStep, setChangeRateStep] = useState<ChangeRateStep>("question");
    const [isSavingCommission, setIsSavingCommission] = useState(false);

    // Preview
    const [isPreviewing, setIsPreviewing] = useState(false);

    // Cancel (DeleteModal)
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [rateToCancel, setRateToCancel] = useState<string | null>(null);
    const [isCancelling, setIsCancelling] = useState(false);

    // Normalize commission rates data (supports both array and { data, meta })
    const ratesData: ICommissionRate[] = Array.isArray(allCommissionRates)
        ? allCommissionRates
        : allCommissionRates?.data ?? [];
    const ratesMeta = {
        page: 1,
        limit: ratesData.length > 0 ? ratesData.length : 10,
        total: ratesData.length,
        totalPage: 1, // Since it's all loaded or a single chunk, total pages is 1
    };

    const getTodayDateString = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    // Can show "Change Rate" when published AND effectiveFrom is still in the future
    const canChangeRate = (() => {
        if (agreeVersion.status !== "PUBLISHED") return false;
        if (!agreeVersion.effectiveFrom) return false;
        const effective = new Date(agreeVersion.effectiveFrom);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return effective > today;
    })();

    const form = useForm<TPublishForm>({
        resolver: zodResolver(publishSchema),
        defaultValues: { effectiveFrom: "" },
    });

    const commissionForm = useForm<TCommissionForm, any, TCommissionFormOutput>({
        resolver: zodResolver(commissionSchema),
        defaultValues: {
            platformPercent: 0,
            platformVatRate: 0,
            note: "",
        },
    });

    const formatDate = (dateString?: string | null) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatType = (type?: string) => {
        if (!type) return "N/A";
        return type.replace(/_/g, " ");
    };

    // Cancel rate (opens DeleteModal)
    const openCancelModal = (id: string) => {
        setRateToCancel(id);
        setShowCancelModal(true);
    };

    const handleConfirmCancel = async () => {
        if (!rateToCancel) return;

        const toastId = toast.loading("Cancelling commission rate...");
        try {
            setIsCancelling(true);
            const res = await cancelEffectiveRate(rateToCancel);

            if (res?.success) {
                toast.success(
                    res?.message || "Commission rate cancelled successfully!",
                    { id: toastId }
                );
                setShowCancelModal(false);
                setRateToCancel(null);
                router.refresh();
                return;
            }

            toast.error(res?.message || "Failed to cancel commission rate", {
                id: toastId,
            });
        } catch (error) {
            console.error(error);
            toast.error("Failed to cancel commission rate", { id: toastId });
        } finally {
            setIsCancelling(false);
        }
    };

    // Publish (only effective-from)
    const handlePublish = async (values: TPublishForm) => {
        const toastId = toast.loading("Publishing agreement version...");
        try {
            setIsPublishing(true);

            const payload = {
                effectiveFrom: new Date(values.effectiveFrom).toISOString(),
            };

            const res = await publishDraftAgreement(payload, agreeVersion._id);

            if (res?.success) {
                toast.success(
                    res?.message || "Agreement version published successfully!",
                    { id: toastId }
                );
                router.refresh();
                form.reset();
                setIsPublishOpen(false);
                return;
            }

            if (res?.data?.errorSources) {
                res.data.errorSources.forEach(
                    (err: { path: string; message: string }) =>
                        toast.error(err?.message, { id: toastId })
                );
                return;
            }

            toast.error(res.message || "Agreement version publish failed", {
                id: toastId,
            });
        } finally {
            form.reset();
            setIsPublishing(false);
        }
    };

    // Create commission rate (Change Rate → Yes)
    const handleCommissionSubmit = async (values: TCommissionFormOutput) => {
        const toastId = toast.loading("Saving commission rate...");
        try {
            setIsSavingCommission(true);

            const payload = {
                agreementVersionId: agreeVersion._id,
                platformPercent: values.platformPercent,
                platformVatRate: values.platformVatRate,
                note: values.note || undefined,
            };

            const res = await createCommissionRate(payload);

            if (res?.success) {
                toast.success(
                    res?.message || "Commission rate saved successfully!",
                    { id: toastId }
                );
                closeChangeRateFlow();
                router.refresh();
                return;
            }

            if (res?.data?.errorSources) {
                res.data.errorSources.forEach(
                    (err: { path: string; message: string }) =>
                        toast.error(err?.message, { id: toastId })
                );
                return;
            }

            toast.error(res?.message || "Failed to save commission rate", {
                id: toastId,
            });
        } catch (error) {
            console.error(error);
            toast.error("Failed to save commission rate", { id: toastId });
        } finally {
            setIsSavingCommission(false);
        }
    };

    // Preview
    const handlePreview = async () => {
        try {
            setIsPreviewing(true);
            const res = await previewAgreementVersion(agreeVersion._id);

            if (res?.success && res?.data) {
                const byteCharacters = atob(res.data);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: res.contentType });
                const blobUrl = URL.createObjectURL(blob);
                window.open(blobUrl, "_blank");
            }
        } catch (error) {
            console.error("Failed to load preview:", error);
        } finally {
            setIsPreviewing(false);
        }
    };

    // Change Rate dialog helpers
    const openChangeRateFlow = () => {
        setChangeRateStep("question");
        commissionForm.reset({
            platformPercent: 0,
            platformVatRate: 0,
            note: "",
        });
        setIsChangeRateOpen(true);
    };

    const closeChangeRateFlow = () => {
        setIsChangeRateOpen(false);
        setChangeRateStep("question");
        commissionForm.reset();
    };

    const handleQuestionAnswer = (changed: boolean) => {
        if (changed) {
            setChangeRateStep("form");
        } else {
            closeChangeRateFlow();
        }
    };

    // Columns – pass openCancelModal instead of direct API call
    const commissionColumns = getCommissionRatesColumns({
        t,
        cancellingId: rateToCancel ?? "",
        handleCancelRate: openCancelModal,
    });

    return (
        <div className="space-y-6 pb-12">
            {/* Back Navigation */}
            <div>
                <Button
                    variant="link"
                    size="sm"
                    onClick={() => router.back()}
                    className="flex items-center gap-1.5 text-sm text-[#DC3173] p-0 hover:bg-transparent"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {t("go_back")}
                </Button>
            </div>

            {/* Header Card */}
            <div className="bg-[#DC3173] text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="bg-white/20 p-3.5 rounded-2xl backdrop-blur-sm">
                        <FileText className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            {agreeVersion.documentTitle || "Untitled Agreement"}
                        </h1>
                        <p className="text-white/80 text-sm mt-1 capitalize">
                            {formatType(agreeVersion.agreementType)}
                            {agreeVersion.versionNumber
                                ? ` • v${agreeVersion.versionNumber}`
                                : ""}
                        </p>
                    </div>
                </div>

                <Badge
                    className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full shadow-xs ${agreeVersion.status === "PUBLISHED"
                        ? "bg-emerald-500 text-white border-0"
                        : agreeVersion.status === "DRAFT"
                            ? "bg-amber-500 text-white border-0"
                            : "bg-gray-500 text-white border-0"
                        }`}
                >
                    {agreeVersion.status || "DRAFT"}
                </Badge>
            </div>

            {/* Top actions: Edit (DRAFT) + Change Rate (when allowed) */}
            <div className="flex justify-end gap-3">
                {agreeVersion?.status === "DRAFT" && (
                    <Button
                        onClick={() =>
                            router.push(`/admin/agreements/edit/${agreeVersion?._id}`)
                        }
                        className="bg-[#DC3173] hover:bg-[#c22863] text-white gap-2 px-5 py-2 shadow-xs"
                    >
                        <Edit className="w-4 h-4" />
                        {t("edit")}
                    </Button>
                )}

                {canChangeRate && (
                    <Button
                        onClick={openChangeRateFlow}
                        variant="outline"
                        className="border-[#DC3173] text-[#DC3173] hover:bg-[#DC3173] hover:text-white gap-2 px-5 py-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        {t("change_rate") || "Change Rate"}
                    </Button>
                )}
            </div>

            {/* Agreement Overview */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-gray-100 text-[#DC3173] font-semibold text-lg">
                    <FileText className="w-5 h-5" />
                    <h2>{t("agreement_overview")}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div>
                        <p className="text-xs text-gray-500 font-medium mb-1">
                            {t("document_title")}
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                            {agreeVersion.documentTitle || "N/A"}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-gray-500 font-medium mb-1">
                            {t("agreement_type")}
                        </p>
                        <p className="text-sm font-semibold text-gray-900 capitalize">
                            {formatType(agreeVersion.agreementType)}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-gray-500 font-medium mb-1">
                            {t("is_current")}
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                            {agreeVersion.isCurrent ? (
                                <span className="text-emerald-600 flex items-center gap-1">
                                    <CheckCircle2 className="w-4 h-4" /> {t("yes")}
                                </span>
                            ) : (
                                <span className="text-gray-500">{t("no")}</span>
                            )}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-gray-500 font-medium mb-1">
                            {t("version_number")}
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                            {agreeVersion.versionNumber
                                ? `v${agreeVersion.versionNumber}`
                                : "N/A"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Commission Rates Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs space-y-4"
            >
                <div className="flex items-center gap-2 pb-3 border-b border-gray-100 text-[#DC3173] font-semibold text-lg">
                    <Percent className="w-5 h-5" />
                    <h2>{t("commission_rates") || "Commission Rates"}</h2>
                </div>

                <ReusableTable
                    data={ratesData}
                    meta={ratesMeta as TMeta}
                    columns={commissionColumns}
                    getRowKey={(row) => row._id}
                    emptyMessage={
                        t("no_commission_rates_found") || "No commission rates found"
                    }
                />
            </motion.div>

            {/* Lifecycle Details */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-gray-100 text-[#DC3173] font-semibold text-lg">
                    <Calendar className="w-5 h-5" />
                    <h2>{t("lifecycle_details")}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div>
                        <p className="text-xs text-gray-500 font-medium mb-1">
                            {t("created_at")}
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                            {formatDate(agreeVersion.createdAt)}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-gray-500 font-medium mb-1">
                            {t("effective_from")}
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                            {agreeVersion.effectiveFrom
                                ? formatDate(agreeVersion.effectiveFrom)
                                : "N/A"}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-gray-500 font-medium mb-1">
                            {t("published_at")}
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                            {agreeVersion.publishedAt
                                ? formatDate(agreeVersion.publishedAt)
                                : "N/A"}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-gray-500 font-medium mb-1">
                            {t("archived_at")}
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                            {agreeVersion.archivedAt
                                ? formatDate(agreeVersion.archivedAt)
                                : "N/A"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Audit Info */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-gray-100 text-[#DC3173] font-semibold text-lg">
                    <User className="w-5 h-5" />
                    <h2>{t("audit_info")}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div>
                        <p className="text-xs text-gray-500 font-medium mb-1">
                            {t("created_by")}
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                            {agreeVersion.createdBy?.email
                                ? `${agreeVersion.createdBy.name?.firstName || ""} ${agreeVersion.createdBy.name?.lastName || ""
                                    }`.trim()
                                : "N/A"}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-gray-500 font-medium mb-1">
                            {t("published_by")}
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                            {agreeVersion.publishedBy?.email
                                ? `${agreeVersion.publishedBy.name?.firstName || ""} ${agreeVersion.publishedBy.name?.lastName || ""
                                    }`.trim()
                                : "N/A"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <Button
                    type="button"
                    variant="outline"
                    onClick={handlePreview}
                    disabled={isPreviewing}
                    className="border-gray-300 hover:bg-gray-50 text-gray-700 gap-2 px-6 py-2 rounded-xl"
                >
                    <Eye className="w-4 h-4 text-gray-500" />
                    {isPreviewing ? t("loading") : t("preview")}
                </Button>

                {agreeVersion.status !== "PUBLISHED" && (
                    <Button
                        type="button"
                        onClick={() => {
                            form.reset();
                            setIsPublishOpen(true);
                        }}
                        className="bg-[#DC3173] hover:bg-[#c22863] text-white gap-2 px-6 py-2 rounded-xl shadow-xs"
                    >
                        <Send className="w-4 h-4" />
                        {t("publish")}
                    </Button>
                )}
            </div>

            {/*PUBLISH DIALOG (effective-from only)*/}
            <Dialog
                open={isPublishOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        setIsPublishOpen(false);
                        form.reset();
                    }
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{t("publish_agreement")}</DialogTitle>
                        <DialogDescription>
                            {t("select_effective_date_description") ||
                                "Select when this agreement version should take effect."}
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(handlePublish)}
                            className="space-y-4 py-2"
                        >
                            <FormField
                                control={form.control}
                                name="effectiveFrom"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {t("effective_from")}{" "}
                                            <span className="text-red-600">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="date"
                                                {...field}
                                                min={getTodayDateString()}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <DialogFooter className="pt-4 gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setIsPublishOpen(false);
                                        form.reset();
                                    }}
                                    disabled={isPublishing}
                                >
                                    {t("cancel")}
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isPublishing}
                                    className="bg-[#DC3173] hover:bg-[#c22863] text-white"
                                >
                                    {isPublishing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                            {t("publishing")}
                                        </>
                                    ) : (
                                        t("confirm_and_publish")
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/*CHANGE RATE DIALOG*/}
            <Dialog
                open={isChangeRateOpen}
                onOpenChange={(open) => !open && closeChangeRateFlow()}
            >
                <DialogContent className="sm:max-w-md">
                    {/* Step 1: Yes / No */}
                    {changeRateStep === "question" && (
                        <>
                            <DialogHeader>
                                <DialogTitle>
                                    {t("commission_rate_changed_title") ||
                                        "Have you changed the commission rate?"}
                                </DialogTitle>
                                <DialogDescription>
                                    {t("commission_rate_changed_desc") ||
                                        "If you want to update the platform commission percentage or VAT rate, choose Yes."}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => handleQuestionAnswer(false)}
                                >
                                    {t("no") || "No"}
                                </Button>
                                <Button
                                    type="button"
                                    className="flex-1 bg-[#DC3173] hover:bg-[#c22863] text-white"
                                    onClick={() => handleQuestionAnswer(true)}
                                >
                                    {t("yes") || "Yes"}
                                </Button>
                            </div>
                        </>
                    )}

                    {/* Step 2: Commission form */}
                    {changeRateStep === "form" && (
                        <>
                            <DialogHeader>
                                <DialogTitle>
                                    {t("update_commission_rate") || "Update Commission Rate"}
                                </DialogTitle>
                                <DialogDescription>
                                    {t("update_commission_rate_desc") ||
                                        "Enter the new platform commission percentage and VAT rate."}
                                </DialogDescription>
                            </DialogHeader>

                            <Form {...commissionForm}>
                                <form
                                    onSubmit={commissionForm.handleSubmit(handleCommissionSubmit)}
                                    className="space-y-4 py-2"
                                >
                                    <FormField
                                        control={commissionForm.control}
                                        name="platformPercent"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    {t("platform_percent") || "Platform Percent"}{" "}
                                                    <span className="text-red-600">*</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        min={0}
                                                        max={100}
                                                        placeholder="e.g. 18"
                                                        {...field}
                                                        value={field.value as number}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={commissionForm.control}
                                        name="platformVatRate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    {t("platform_vat_rate") || "Platform VAT Rate"}{" "}
                                                    <span className="text-red-600">*</span>
                                                </FormLabel>
                                                {taxes && taxes.length > 0 ? (
                                                    <Select
                                                        onValueChange={(val) => field.onChange(Number(val))}
                                                        value={
                                                            field.value !== undefined && field.value !== null
                                                                ? String(field.value)
                                                                : undefined
                                                        }
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select VAT rate" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {taxes.map((tax) => (
                                                                <SelectItem
                                                                    key={tax._id || String(tax.taxRate)}
                                                                    value={String(tax.taxRate)}
                                                                >
                                                                    {tax?.taxName?.[lang]
                                                                        ? `${tax?.taxName?.[lang]} (${tax.taxRate}%)`
                                                                        : `${tax.taxRate}%`}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                ) : (
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            min={0}
                                                            max={100}
                                                            placeholder="e.g. 23"
                                                            {...field}
                                                            value={field.value as number}
                                                        />
                                                    </FormControl>
                                                )}
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={commissionForm.control}
                                        name="note"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    {t("note") || "Note"}{" "}
                                                    <span className="text-gray-400 text-xs">
                                                        (optional)
                                                    </span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="e.g. Raised from 15%"
                                                        rows={2}
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <DialogFooter className="pt-4 gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setChangeRateStep("question")}
                                            disabled={isSavingCommission}
                                        >
                                            {t("back") || "Back"}
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={isSavingCommission}
                                            className="bg-[#DC3173] hover:bg-[#c22863] text-white"
                                        >
                                            {isSavingCommission ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                    {t("saving") || "Saving..."}
                                                </>
                                            ) : (
                                                t("save") || "Save"
                                            )}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </Form>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Cancel confirmation (DeleteModal) */}
            <DeleteModal
                open={showCancelModal}
                onOpenChange={(open) => {
                    setShowCancelModal(open);
                    if (!open) setRateToCancel(null);
                }}
                onConfirm={handleConfirmCancel}
                isDeleting={isCancelling}
            />
        </div>
    );
}