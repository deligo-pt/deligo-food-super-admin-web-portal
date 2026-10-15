"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Building2, Loader2 } from "lucide-react";

export type Branch = {
    _id?: string;
    userId?: string;
    businessDetails?: {
        businessName?: string;
    };
    name?: string;
};

interface CopyToBranchModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    branches: Branch[];
    selectedBranchIds: Set<string>;
    onToggleBranch: (id: string) => void;
    onSelectAllBranches: () => void;
    onClearAllBranches: () => void;
    onCopy: () => void;
    isLoadingBranches: boolean;
    isCopying: boolean;
    t: (key: string) => string;
}

export default function CopyToBranchModal({
    open,
    onOpenChange,
    branches,
    selectedBranchIds,
    onToggleBranch,
    onSelectAllBranches,
    onClearAllBranches,
    onCopy,
    isLoadingBranches,
    isCopying,
    t,
}: CopyToBranchModalProps) {
    const allSelected =
        branches.length > 0 && selectedBranchIds.size === branches.length;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
                <DialogHeader className="bg-[#DC3173] text-white px-6 py-5">
                    <DialogTitle className="text-white text-lg font-semibold">
                        {t("copy_to_branch") || "Copy to Branch"}
                    </DialogTitle>
                    <p className="text-white/80 text-sm mt-0.5">
                        {t("select_a_branch_to_copy") ||
                            "Select a branch to copy this product"}
                    </p>
                </DialogHeader>

                <div className="p-4 max-h-[50vh] overflow-y-auto space-y-2">
                    {isLoadingBranches ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="h-6 w-6 animate-spin text-[#DC3173]" />
                        </div>
                    ) : branches.length === 0 ? (
                        <p className="text-center text-sm text-gray-400 py-8">
                            {t("no_branches_found") || "No branches found"}
                        </p>
                    ) : (
                        <>
                            {/* Select All / Clear All */}
                            <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-1">
                                <span className="text-xs text-gray-500">
                                    {selectedBranchIds.size} of {branches.length}{" "}
                                    {t("selected") || "selected"}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (allSelected) onClearAllBranches();
                                        else onSelectAllBranches();
                                    }}
                                    className="text-xs font-medium text-[#DC3173] hover:underline"
                                >
                                    {allSelected
                                        ? t("clear_all") || "Clear all"
                                        : t("select_all") || "Select all"}
                                </button>
                            </div>

                            {branches.map((branch) => {
                                const bid = branch.userId || branch._id || "";
                                const name =
                                    branch.businessDetails?.businessName ||
                                    branch.name ||
                                    "Branch";
                                const isSelected = selectedBranchIds.has(bid);

                                return (
                                    <button
                                        key={bid}
                                        type="button"
                                        onClick={() => onToggleBranch(bid)}
                                        className={cn(
                                            "w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                                            isSelected
                                                ? "border-[#DC3173] bg-[#DC3173]/5"
                                                : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                                                isSelected ? "bg-[#DC3173]/10" : "bg-gray-100"
                                            )}
                                        >
                                            <Building2
                                                className={cn(
                                                    "w-4 h-4",
                                                    isSelected ? "text-[#DC3173]" : "text-gray-500"
                                                )}
                                            />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="font-medium text-sm text-gray-900 truncate">
                                                {name}
                                            </div>
                                            <div className="text-[11px] text-gray-400 font-mono">
                                                ID: {bid}
                                            </div>
                                        </div>
                                        <div
                                            className={cn(
                                                "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                                                isSelected
                                                    ? "border-[#DC3173] bg-[#DC3173]"
                                                    : "border-gray-300"
                                            )}
                                        >
                                            {isSelected && (
                                                <svg
                                                    className="w-3 h-3 text-white"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    strokeWidth={3}
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M5 13l4 4L19 7"
                                                    />
                                                </svg>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </>
                    )}
                </div>

                <DialogFooter className="px-4 py-3 border-t bg-gray-50 gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isCopying}
                    >
                        {t("cancel") || "Cancel"}
                    </Button>
                    <Button
                        onClick={onCopy}
                        disabled={selectedBranchIds.size === 0 || isCopying}
                        className="bg-[#DC3173] hover:bg-[#DC3173]/90 text-white"
                    >
                        {isCopying && (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        )}
                        {t("copy_product") || "Copy Product"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}