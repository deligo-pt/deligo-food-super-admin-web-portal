"use client";

import { motion } from "framer-motion";
import { Terminal, Info, Calendar} from "lucide-react";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { TSystemPermission } from "@/types/permission.type";
import TitleHeader from "@/components/TitleHeader/TitleHeader";

interface PermissionDetailsProps {
    permission: TSystemPermission & {
        createdBy?: string | { name: string };
        createdAt?: string;
        updatedAt?: string;
    };
}

export default function PermissionDetails({ permission }: PermissionDetailsProps) {
    const router = useRouter();

    if (!permission) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
        >
            {/* HEADER META CARD */}
            <TitleHeader
                title={permission.name}
                subtitle={permission.module}
                 onBackClick={() => router.back()}
            />

            {/* CORE CONFIGURATION SPECIFICATIONS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* LEFT COLUMN: IDENTIFIER METRICS MAP */}
                <div className="md:col-span-2 space-y-6">
                    <Card className="rounded-3xl border border-gray-100 shadow-sm bg-white p-6 space-y-6">
                        <div className="flex items-center gap-2 pb-3 border-b border-gray-50">
                            <Terminal className="w-4 h-4 text-[#DC3173]" />
                            <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wider">Technical Bindings</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                                    Access Runtime String Key
                                </label>
                                <div className="bg-gray-50 border border-gray-100 font-mono text-sm text-gray-800 p-3 rounded-xl select-all">
                                    {permission.action}
                                </div>
                            </div>

                            <div>
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                                    UI Render Display Alias
                                </label>
                                <p className="text-gray-900 font-semibold text-base">
                                    {permission.displayName || "Not specified"}
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* DESCRIPTION BLOCK */}
                    <Card className="rounded-3xl border border-gray-100 shadow-sm bg-white p-6 space-y-3">
                        <div className="flex items-center gap-2 pb-1">
                            <Info className="w-4 h-4 text-[#DC3173]" />
                            <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wider">Functional Intent</h3>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            {permission.description || "No documentation narrative provided for this permission block entry."}
                        </p>
                    </Card>
                </div>

                {/* RIGHT COLUMN: REVENUE STATUS & AUDIT TRAIL LOGS */}
                <div className="space-y-6">
                    <Card className="rounded-3xl border border-gray-100 shadow-sm bg-white p-6 space-y-5">
                        <div className="space-y-4">
                            <div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                                    Operational Lifecycle
                                </span>
                                <div className="flex items-center gap-2">
                                    <div className={`w-2.5 h-2.5 rounded-full ${permission.isActive ? "bg-green-500 animate-pulse" : "bg-red-400"}`} />
                                    <span className="font-bold text-sm text-gray-800">
                                        {permission.isActive ? "Active Strategy Entry" : "Disabled Rule Configuration"}
                                    </span>
                                </div>
                            </div>

                            <hr className="border-gray-50" />

                            {/* AUDIT LOG TIMESTAMPS */}
                            <div className="space-y-3 pt-1">
                                <div className="flex items-start gap-2.5 text-xs text-gray-500">
                                    <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                                    <div>
                                        <span className="block font-medium text-gray-400">Created Temporal Point</span>
                                        <span className="font-semibold text-gray-800">
                                            {permission.createdAt ? new Date(permission.createdAt).toLocaleString() : "N/A"}
                                        </span>
                                    </div>
                                </div>

                                {/* <div className="flex items-start gap-2.5 text-xs text-gray-500">
                                    <User className="w-4 h-4 text-gray-400 mt-0.5" />
                                    <div>
                                        <span className="block font-medium text-gray-400">Origin Author Identity</span>
                                        <span className="font-semibold text-gray-800 font-mono text-[11px]">
                                            {typeof permission.createdBy === 'object' ? permission.createdBy?.name : permission.createdBy || "System Boot Engine"}
                                        </span>
                                    </div>
                                </div> */}
                            </div>

                        </div>
                    </Card>
                </div>

            </div>
        </motion.div>
    );
}