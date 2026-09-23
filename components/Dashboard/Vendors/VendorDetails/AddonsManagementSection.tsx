"use client";

import { useState } from "react";
import { Plus, Edit, LayersIcon, Trash2, Loader2 } from "lucide-react";
import AddAddonGroupModal from "./AddAddonGroupModal";
import { TAddonGroup } from "@/types/add-ons.type";
import { TTax } from "@/types/tax.type";
import { TMeta } from "@/types";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { motion } from 'framer-motion';
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import DeleteModal from "@/components/Modals/DeleteModal";
import { deleteAddOnOption, toggleAddOnOptionStatus } from "@/services/dashboard/product/product.service";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/store";

interface IProps {
    addonGroupsResult: {
        data: TAddonGroup[];
        meta?: TMeta;
    };
    vendorId: string;
    taxes: TTax[];
    t: (key: string) => string;
}

export default function AddOnsManagementSection({
    addonGroupsResult,
    vendorId,
    taxes,
    t,
}: IProps) {
    const { lang } = useStore();
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [actionType, setActionType] = useState<"create" | "edit">("create");
    const [selectedGroup, setSelectedGroup] = useState<TAddonGroup | undefined>(undefined);

    // States for Delete Option modal
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [targetDeleteData, setTargetDeleteData] = useState<{ addonGroupId: string; optionSku: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // State for tracking toggle loading states per option SKU
    const [togglingSku, setTogglingSku] = useState<string | null>(null);

    // Handler to open modal for creating a brand new Add-on Group
    const handleOpenCreateModal = () => {
        setActionType("create");
        setSelectedGroup(undefined);
        setIsModalOpen(true);
    };

    // Handler to open modal for editing group details or adding options (`+ Add Add-On`)
    const handleOpenEditModal = (group: TAddonGroup) => {
        setActionType("edit");
        setSelectedGroup(group);
        setIsModalOpen(true);
    };

    // Handler to trigger the Delete Modal
    const handleOpenDeleteModal = (addonGroupId: string, optionSku?: string) => {
        if (!optionSku) {
            toast.error("Option SKU is missing for deletion.");
            return;
        }
        setTargetDeleteData({ addonGroupId, optionSku });
        setIsDeleteModalOpen(true);
    };

    // Confirm Option Deletion API Request
    const handleConfirmDeleteOption = async () => {
        if (!targetDeleteData) return;
        setIsDeleting(true);
        const toastId = toast.loading(t("deleting_option") || "Deleting option...");

        try {
            const result = await deleteAddOnOption(
                targetDeleteData.addonGroupId,
                { optionSku: targetDeleteData.optionSku },
                vendorId
            );

            if (result.success) {
                toast.success(result.message || "Option deleted successfully", { id: toastId });
                setIsDeleteModalOpen(false);
                router.refresh();
            } else {
                toast.error(result.message || "Failed to delete option", { id: toastId });
            }
        } catch (error) {
            toast.error("An unexpected error occurred", { id: toastId });
        } finally {
            setIsDeleting(false);
            setTargetDeleteData(null);
        }
    };

    // Handler to Toggle Option Status API Request
    const handleToggleOptionStatus = async (addonGroupId: string, optionSku?: string) => {
        if (!optionSku) return;
        setTogglingSku(optionSku);
        const toastId = toast.loading(t("updating_status") || "Updating status...");

        try {
            const result = await toggleAddOnOptionStatus(
                addonGroupId,
                { optionSku },
                vendorId
            );

            if (result.success) {
                toast.success(result.message || "Status updated successfully", { id: toastId });
                router.refresh();
            } else {
                toast.error(result.message || "Failed to update status", { id: toastId });
            }
        } catch (error) {
            toast.error("An unexpected error occurred", { id: toastId });
        } finally {
            setTogglingSku(null);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border p-2 my-4 space-y-6">
            {/* Top Header Banner matching the UI */}
            <TitleHeader
                title={t("add_ons_extras")}
                subtitle={t("manage_your_add_on_groups_options")}
                buttonInfo={{
                    text: t("add_group"),
                    icon: Plus,
                    onClick: handleOpenCreateModal
                }}
            />

            {/* Add-on Groups List Cards */}
            <div className="space-y-4">
                {addonGroupsResult?.data && addonGroupsResult.data.length > 0 ? (
                    addonGroupsResult.data.map((group) => (
                        <div
                            key={group._id}
                            className="border rounded-xl p-5 bg-white shadow-sm hover:shadow transition space-y-4"
                        >
                            {/* Group Title and Top Action Buttons */}
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-800">
                                        {group.title?.en || group.title?.pt}
                                    </h2>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        {t("min_lg")}: {group.minSelectable} &bull; {t("max")}: {group.maxSelectable}
                                    </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => handleOpenEditModal(group)}
                                        className="flex items-center text-xs border border-gray-200 text-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-50 transition font-medium"
                                    >
                                        <Plus className="w-3.5 h-3.5 mr-1 text-[#DC3173]" /> {t("add_addon") || "Add Add-On"}
                                    </button>
                                    <button
                                        onClick={() => handleOpenEditModal(group)}
                                        className="flex items-center text-xs border border-gray-200 text-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-50 transition font-medium"
                                    >
                                        <Edit className="w-3.5 h-3.5 mr-1 text-gray-500" /> {t("edit") || "Edit"}
                                    </button>
                                </div>
                            </div>

                            {/* Options Items Sub-cards */}
                            <div className="space-y-2 pt-2">
                                {group.options && group.options.length > 0 ? (
                                    group.options.map((option, idx) => {
                                        const taxObj = taxes.find(
                                            (tx) => tx._id === (typeof option.tax === "string" ? option.tax : option.tax?._id)
                                        );
                                        return (
                                            <div
                                                key={idx}
                                                className="flex justify-between items-center border border-gray-100 bg-gray-50/50 px-4 py-2.5 rounded-lg text-sm"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#DC3173]"></span>
                                                    <span className="font-medium text-gray-700">
                                                        {option.name?.[lang]}
                                                    </span>
                                                    {option.sku && (
                                                        <span className="text-[10px] text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded">
                                                            {option.sku}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center space-x-4">
                                                    <span className="text-xs text-gray-600 font-medium">
                                                        €{option.price?.toFixed(2)}
                                                        {taxObj ? ` (${t("inc_vat")}: ${taxObj.taxRate}%)` : ` (${t("inc_vat")}: 0%)`}
                                                    </span>

                                                    {/* Toggle Status Switch */}
                                                    <div className="flex items-center space-x-2">
                                                        <div className="flex items-center space-x-2">
                                                            {togglingSku === option.sku ? (
                                                                <Loader2 className="w-4 h-4 animate-spin text-[#DC3173]" />
                                                            ) : (
                                                                <Switch
                                                                    checked={option.isActive ?? true}
                                                                    onCheckedChange={() => handleToggleOptionStatus(group._id, option.sku)}
                                                                    className="data-[state=checked]:bg-[#DC3173]"
                                                                />
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Trash Button to Open Delete Modal */}
                                                    <button
                                                        onClick={() => handleOpenDeleteModal(group._id, option.sku)}
                                                        className="text-gray-400 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 transition"
                                                        title={t("delete_option") || "Delete Option"}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="text-xs text-gray-400 italic">{t("no_options_added")}</p>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 border rounded-xl bg-gray-50">
                        <LayersIcon className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                        <p className="text-sm text-gray-500">{t("no_addon_groups_found") || "No add-on groups found."}</p>
                    </div>
                )}
            </div>

            {!!addonGroupsResult?.meta?.totalPage && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="px-4 md:px-6 py-4"
                >
                    <PaginationComponent
                        totalPages={addonGroupsResult?.meta?.totalPage as number}
                    />
                </motion.div>
            )}

            {/* Modal Integration */}
            <AddAddonGroupModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                vendorId={vendorId}
                prevValues={selectedGroup}
                taxes={taxes}
                actionType={actionType}
                t={t}
            />

            {/* Reused Delete Modal for Option Deletion */}
            <DeleteModal
                open={isDeleteModalOpen}
                onOpenChange={setIsDeleteModalOpen}
                onConfirm={handleConfirmDeleteOption}
                isDeleting={isDeleting}
            />
        </div>
    );
}