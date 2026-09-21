"use client";

import { useState } from "react";
import { Plus, Edit, LayersIcon, } from "lucide-react";
import AddAddonGroupModal from "./AddAddonGroupModal";
import { TAddonGroup } from "@/types/add-ons.type";
import { TTax } from "@/types/tax.type";
import { TMeta } from "@/types";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { motion } from 'framer-motion';
import PaginationComponent from "@/components/Filtering/PaginationComponent";

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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [actionType, setActionType] = useState<"create" | "edit">("create");
    const [selectedGroup, setSelectedGroup] = useState<TAddonGroup | undefined>(undefined);

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
                                        {t("min")}: {group.minSelectable} &bull; {t("max")}: {group.maxSelectable}
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
                                                        {option.name?.en || option.name?.pt}
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-4">
                                                    <span className="text-xs text-gray-600 font-medium">
                                                        €{option.price?.toFixed(2)}
                                                        {taxObj ? ` (${t("inc_vat")}: ${taxObj.taxRate}%)` : ` (${t("inc_vat")}: 0%)`}
                                                    </span>
                                                    <span className="text-emerald-600 bg-emerald-50 p-1 rounded-full">
                                                        {/* Active/Valid check icon */}
                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </span>
                                                    {/* Optional inline delete if needed or handled through edit modal */}
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
        </div>
    );
}