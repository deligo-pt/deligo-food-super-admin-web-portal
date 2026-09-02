"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/use-translation";
import { IAgreementVersion } from "@/types/agreement.type";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft,
    Edit,
    Eye,
    Send,
    FileText,
    Calendar,
    User,
    CheckCircle2,
} from "lucide-react";

interface IProps {
    agreeVersion: IAgreementVersion;
}

export default function AgreementVersionsDetails({ agreeVersion }: IProps) {
    const { t } = useTranslation();
    const router = useRouter();

    const [isPublishing, setIsPublishing] = useState(false);
    const [isPreviewing, setIsPreviewing] = useState(false);

    // Formatting helpers
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

    // API Call Handlers
    const handlePublish = async () => {
        try {
            setIsPublishing(true);
            // TODO: Call publish API endpoint
            // await publishAgreementVersion(agreeVersion._id);
            console.log("Publishing agreement version:", agreeVersion._id);
        } catch (error) {
            console.error("Failed to publish agreement version:", error);
        } finally {
            setIsPublishing(false);
        }
    };

    const handlePreview = async () => {
        try {
            setIsPreviewing(true);
            // TODO: Handle modal open or navigation for preview
            console.log("Previewing agreement version:", agreeVersion._id);
        } catch (error) {
            console.error("Failed to load preview:", error);
        } finally {
            setIsPreviewing(false);
        }
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Back Navigation Button */}
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

            {/* Main Brand Colored Header Card */}
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
                            {agreeVersion.versionNumber ? ` • v${agreeVersion.versionNumber}` : ""}
                        </p>
                    </div>
                </div>

                {/* Status Badge */}
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

            {/* Top Action Row: Edit Button below Header */}
            <div className="flex justify-end">
                <Button
                    onClick={() => router.push(`/admin/agreements/edit/${agreeVersion._id}/edit`)}
                    className="bg-[#DC3173] hover:bg-[#c22863] text-white gap-2 px-5 py-2 shadow-xs"
                >
                    <Edit className="w-4 h-4" />
                    {t("edit")}
                </Button>
            </div>

            {/* Basic Metadata Details Card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-gray-100 text-[#DC3173] font-semibold text-lg">
                    <FileText className="w-5 h-5" />
                    <h2>{t("agreement_overview")}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div>
                        <p className="text-xs text-gray-500 font-medium mb-1">{t("document_title")}</p>
                        <p className="text-sm font-semibold text-gray-900">
                            {agreeVersion.documentTitle || "N/A"}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-gray-500 font-medium mb-1">{t("agreement_type")}</p>
                        <p className="text-sm font-semibold text-gray-900 capitalize">
                            {formatType(agreeVersion.agreementType)}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-gray-500 font-medium mb-1">{t("is_current")}</p>
                        <p className="text-sm font-semibold text-gray-900">
                            {agreeVersion.isCurrent ? (
                                <span className="text-emerald-600 flex items-center gap-1">
                                    <CheckCircle2 className="w-4 h-4" /> Yes
                                </span>
                            ) : (
                                <span className="text-gray-500">No</span>
                            )}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-gray-500 font-medium mb-1">{t("version_number")}</p>
                        <p className="text-sm font-semibold text-gray-900">
                            {agreeVersion.versionNumber ? `v${agreeVersion.versionNumber}` : "N/A"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Lifecycle & Dates Information Card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-gray-100 text-[#DC3173] font-semibold text-lg">
                    <Calendar className="w-5 h-5" />
                    <h2>{t("lifecycle_details")}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div>
                        <p className="text-xs text-gray-500 font-medium mb-1">{t("created_at")}</p>
                        <p className="text-sm font-semibold text-gray-900">
                            {formatDate(agreeVersion.createdAt)}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-gray-500 font-medium mb-1">{t("effective_from")}</p>
                        <p className="text-sm font-semibold text-gray-900">
                            {agreeVersion.effectiveFrom ? formatDate(agreeVersion.effectiveFrom) : "N/A"}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-gray-500 font-medium mb-1">{t("published_at")}</p>
                        <p className="text-sm font-semibold text-gray-900">
                            {agreeVersion.publishedAt ? formatDate(agreeVersion.publishedAt) : "N/A"}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-gray-500 font-medium mb-1">{t("archived_at")}</p>
                        <p className="text-sm font-semibold text-gray-900">
                            {agreeVersion.archivedAt ? formatDate(agreeVersion.archivedAt) : "N/A"}
                        </p>
                    </div>
                </div>
            </div>

            {/* User Actions & Audit Info Card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-gray-100 text-[#DC3173] font-semibold text-lg">
                    <User className="w-5 h-5" />
                    <h2>{t("audit_info")}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div>
                        <p className="text-xs text-gray-500 font-medium mb-1">{t("created_by")}</p>
                        <p className="text-sm font-semibold text-gray-900">
                            {agreeVersion.createdBy?.email ? agreeVersion?.createdBy?.name?.firstName + "" + agreeVersion?.createdBy?.name?.lastName : "N/A"}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-gray-500 font-medium mb-1">{t("published_by")}</p>
                        <p className="text-sm font-semibold text-gray-900">
                            {agreeVersion.publishedBy?.email ? agreeVersion?.publishedBy?.name?.firstName + "" + agreeVersion?.publishedBy?.name?.lastName : "N/A"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Bottom Actions Row: Preview & Publish Buttons */}
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
                        onClick={handlePublish}
                        disabled={isPublishing}
                        className="bg-[#DC3173] hover:bg-[#c22863] text-white gap-2 px-6 py-2 rounded-xl shadow-xs"
                    >
                        <Send className="w-4 h-4" />
                        {isPublishing ? t("publishing") : t("publish")}
                    </Button>
                )}
            </div>
        </div>
    );
}