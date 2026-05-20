"use client";

import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { IAgreement } from "@/types/agreement.type";
import {
    Calendar,
    FileCheck,
    ShieldCheck,
    ExternalLinkIcon
} from "lucide-react";
import { useRouter } from "next/navigation";

interface IProps {
    agreement: IAgreement;
}

export default function AgreementDetails({ agreement }: IProps) {
    const router = useRouter();
    const targetingPdfUrl = agreement.signedPdfPath || agreement.draftPdfPath;

    // Custom helper to dynamically style the agreement status indicator text/pills inside the card
    const getStatusStyle = (status: string) => {
        switch (status?.toLowerCase()) {
            case "signed":
                return { text: "text-emerald-600 font-semibold", desc: "Successfully Signed" };
            case "emailed":
                return { text: "text-blue-600 font-semibold", desc: "Sent to Establishment" };
            default:
                return { text: "text-amber-600 font-semibold", desc: "Draft Mode Pending" };
        }
    };

    const statusMeta = getStatusStyle(agreement.status);

    return (
        <div className="space-y-6 max-w-full">
            {/* 1. TitleHeader Integration with Action Buttons */}
            <TitleHeader
                title={agreement.establishmentName || "N/A"}
                subtitle="Comprehensive breakdown and original documentation reference"
                onBackClick={() => router.push("/admin/vendor-agreements")}
                extraComponent={
                    targetingPdfUrl && (
                        <a
                            href={targetingPdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white text-[#DC3173] hover:bg-slate-50 px-4 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 shadow-sm transition-all border border-slate-100"
                        >
                            <ExternalLinkIcon className="h-4 w-4" />
                            Open Original PDF
                        </a>
                    )
                }
            />

            {/* 2. Enhanced Analytics Style Meta Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Card 1: Tax Registration */}
                <div className="bg-white shadow-xs border border-slate-100/80 rounded-2xl p-6 flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-800 tracking-tight">
                            Tax Registration
                        </p>
                        <p className="text-xl font-bold text-slate-900">
                            {agreement.nif || "N/A"}
                        </p>
                        <p className="text-xs text-slate-400 font-medium">Official NIF Reference</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                </div>

                {/* Card 2: Document State Status */}
                <div className="bg-white shadow-xs border border-slate-100/80 rounded-2xl p-6 flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-800 tracking-tight">
                            Document Status
                        </p>
                        <p className={`text-xl capitalize ${statusMeta.text}`}>
                            {agreement.status}
                        </p>
                        <p className="text-xs text-slate-400 font-medium">{statusMeta.desc}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center text-[#DC3173] shrink-0">
                        <FileCheck className="w-6 h-6" />
                    </div>
                </div>

                {/* Card 3: Last Status Update */}
                <div className="bg-white shadow-xs border border-slate-100/80 rounded-2xl p-6 flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-800 tracking-tight">
                            Last Update
                        </p>
                        <p className="text-xl font-bold text-slate-900">
                            {agreement.updatedAt
                                ? new Date(agreement.updatedAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                })
                                : "N/A"}
                        </p>
                        <p className="text-xs text-slate-400 font-medium">System Timestamp</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                        <Calendar className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* 3. PDF Frame View Container Layout */}
            <div className="bg-slate-900 rounded-2xl p-3 md:p-4 shadow-xl border border-slate-800 mt-6">
                <div className="bg-slate-800 rounded-xl overflow-hidden relative min-h-125 h-[75vh] w-full">
                    {targetingPdfUrl ? (
                        <iframe
                            src={`${targetingPdfUrl}#toolbar=1&navpanes=0`}
                            className="w-full h-full border-none"
                            title={`Document space viewer for ${agreement.establishmentName}`}
                            allow="autoplay"
                        />
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-4">
                            <FileCheck className="w-12 h-12 text-slate-600 mb-2" />
                            <p className="font-medium">No printable target path URL found</p>
                            <p className="text-xs text-slate-500 mt-1">
                                Verify asset cloud uploads match object configurations
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}