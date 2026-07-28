"use client";

import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
    CalendarIcon,
    CheckCircle2,
    Clock,
    FileTextIcon,
    ImageIcon,
    ToggleLeft,
    Trash2,
    ArrowLeft
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { TCuisine } from "@/types/cuisine.type";
import { useStore } from "@/store/store";

interface IProps {
    cuisine: TCuisine;
}

const CuisineDetails = ({ cuisine }: IProps) => {
    const { t } = useTranslation();
    const { lang } = useStore();
    const router = useRouter();

    // Formatting timestamps cleanly for layout timelines
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="space-y-6">
            {/* Navigation Row */}
            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    className="flex items-center gap-2 text-gray-600 hover:text-[#DC3173]"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="w-4 h-4" />
                    {t("back_to_list")}
                </Button>
            </div>

            {/* Main Content Wrapper */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100"
            >
                {/* Brand Identity Accent Header */}
                <div className="bg-linear-to-r from-[#DC3173] to-[#E95A9E] p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <span className="text-xs font-semibold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full text-white">
                            {t("id")}: {cuisine._id}
                        </span>
                        <h1 className="text-3xl font-bold mt-2 uppercase tracking-wide">
                            {cuisine?.name?.[lang]}
                        </h1>
                        <p className="text-pink-100 mt-1 text-sm font-mono">
                            {t("slug")}: {cuisine.slug}
                        </p>
                    </div>

                    {/* Status Badge Array */}
                    <div className="flex flex-wrap gap-2">
                        <span className={cn(
                            "px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-xs",
                            cuisine.isActive ? "bg-green-500 text-white" : "bg-amber-500 text-white"
                        )}>
                            <ToggleLeft className="w-3.5 h-3.5" />
                            {cuisine.isActive ? t("active") : t("inactive")}
                        </span>

                        {cuisine.isDeleted && (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500 text-white flex items-center gap-1.5 shadow-xs">
                                <Trash2 className="w-3.5 h-3.5" />
                                {t("soft_deleted")}
                            </span>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6">
                    {/* Left Column: Visual Media Presenter */}
                    <div className="md:col-span-5 flex flex-col space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                            <ImageIcon className="w-3.5 h-3.5" />
                            {t("cuisine_asset_preview")}
                        </label>

                        <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-gray-50 border border-gray-200 shadow-inner flex items-center justify-center">
                            {cuisine.imageUrl ? (
                                <Image
                                    src={cuisine.imageUrl}
                                    alt={cuisine?.name?.[lang]}
                                    fill
                                    className="object-cover transition-transform duration-300 hover:scale-105"
                                    sizes="(max-w-768s) 100vw, 33vw"
                                    priority
                                />
                            ) : (
                                <div className="text-center p-6 text-gray-400">
                                    <ImageIcon className="w-12 h-12 mx-auto stroke-1 mb-2" />
                                    <p className="text-sm">{t("no_image_uploaded")}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Key Details & Audit Logs */}
                    <div className="md:col-span-7 flex flex-col justify-between space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5 border-b border-gray-100 pb-2">
                                <FileTextIcon className="w-4 h-4 text-[#DC3173]" />
                                {t("properties")}
                            </h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <p className="text-xs text-gray-400 uppercase">{t("url_status_check")}</p>
                                    <p className="text-sm font-semibold text-emerald-600 mt-0.5 truncate max-w-full">
                                        {cuisine.imageUrl ? t("valid_asset_path") : t("empty_source_reference")}
                                    </p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-[#DC3173]" />
                                        {t("audit_timelines")}
                                    </h3>

                                    <div className="space-y-2.5 text-sm text-gray-600">
                                        <div className="flex items-center gap-3">
                                            <CalendarIcon className="w-4 h-4 text-gray-400 shrink-0" />
                                            <div>
                                                <p className="text-xs text-gray-400">{t("created_on")}</p>
                                                <p className="font-medium text-gray-700">{formatDate(cuisine.createdAt)}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                                            <div>
                                                <p className="text-xs text-gray-400">{t("last_updated")}</p>
                                                <p className="font-medium text-gray-700">{formatDate(cuisine.updatedAt)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default CuisineDetails;