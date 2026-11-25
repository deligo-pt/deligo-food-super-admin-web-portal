"use client";

import { useState } from "react";
import { Copy, Edit, LayersIcon, Trash2, ChevronDown, SaveIcon } from "lucide-react";
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
import { deleteAddOnOption, toggleAddOnOptionStatus, updateAddOnsGroup } from "@/services/dashboard/product/product.service";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/use-translation";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useVendorTopbarTitle } from "@/hooks/useVendorTopbarTitle";

interface IProps {
    addonGroupsResult: {
        data: TAddonGroup[];
        meta?: TMeta;
    };
    vendorId: string;
    vendorUserId: string;
    taxes: TTax[];
    businessName: string;
    /** Every group of this vendor (all pages), for the duplicate-title check and Clone. */
    allGroups: TAddonGroup[];
}

export default function AddOnsManagementSection({
    addonGroupsResult,
    vendorId,
    vendorUserId,
    taxes,
    businessName,
    allGroups,
}: IProps) {
    const { t, lang } = useTranslation();
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [actionType, setActionType] = useState<"create" | "edit" | "clone">("create");
    const [selectedGroup, setSelectedGroup] = useState<TAddonGroup | undefined>(undefined);

    // States for Delete Option modal
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [targetDeleteData, setTargetDeleteData] = useState<{ addonGroupId: string; optionSku: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // State for tracking toggle loading states per option SKU
    // Active / Inactive, shown at once (key: group id or option sku). The
    // list's data can come back stale after a save (revalidateTag serves the
    // old copy first), so what was chosen here wins until the page reloads.
    const [chosen, setChosen] = useState<Record<string, boolean>>({});
    const [saving, setSaving] = useState<Record<string, boolean>>({});

    // vendor businessname or  branch name
    useVendorTopbarTitle(businessName);

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

    /** Flip at once, save, and flip back with a message if saving fails. */
    const saveStatus = async (key: string, isActive: boolean, save: () => Promise<{ success?: boolean; message?: string }>) => {
        setChosen((c) => ({ ...c, [key]: isActive }));
        setSaving((s) => ({ ...s, [key]: true }));
        try {
            const result = await save();
            if (!result?.success) throw new Error(result?.message);
            router.refresh();
        } catch (error) {
            setChosen((c) => ({ ...c, [key]: !isActive }));
            toast.error((error as Error)?.message || t("addon_status_failed"));
        } finally {
            setSaving((s) => ({ ...s, [key]: false }));
        }
    };
    const groupActive = (group: TAddonGroup) => chosen[group._id] ?? group.isActive !== false;
    const optionActive = (option: TAddonGroup["options"][number]) =>
        (option.sku ? chosen[option.sku] : undefined) ?? option.isActive !== false;

    return (
        <div className="space-y-6">
            {/* Top Header Banner matching the UI */}
            <TitleHeader
                title={t("manage_add_ons")}
                subtitle={t("manage_your_add_on_groups_options")}
                onBackClick={() => router.back()}
                extraComponent={
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button className="bg-[#DC3173] hover:bg-[#DC3173]/90 text-white flex items-center gap-2">
                                {t("actions") || "Actions"}
                                <ChevronDown className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="w-48 bg-white shadow-lg border rounded-lg p-1"
                        >
                            <DropdownMenuItem
                                onClick={() =>
                                    router.push(`/admin/vendor/${vendorUserId}/manage-products`)
                                }
                                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer"
                            >
                                {t("manage_products") || "Manage Product"}
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={() =>
                                    router.push(`/admin/vendor/${vendorUserId}/add-product`)
                                }
                                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer"
                            >
                                {t("add_product") || "Add Product"}
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={() =>
                                    router.push(
                                        `/admin/vendor/${vendorUserId}/products/update-discount`
                                    )
                                }
                                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer"
                            >
                                {t("update_discounts") || "Update Discount"}
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={() =>
                                    router.push(
                                        `/admin/vendor/${vendorUserId}/products/increase-price`
                                    )
                                }
                                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer"
                            >
                                {t("increase_prices") || "Increase Price"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="my-1 border-gray-100" />

                            {/* Newly added sections */}
                            <DropdownMenuItem
                                onClick={() =>
                                    router.push(
                                        `/admin/vendor/${vendorUserId}/products/categories`
                                    )
                                }
                                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer"
                            >
                                {t("manage_categories")}
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={() =>
                                    router.push(
                                        `/admin/vendor/${vendorUserId}/products/offers/create-new`
                                    )
                                }
                                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer"
                            >
                                {t("create_new_offer") || "Create New Offer"}
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={() =>
                                    router.push(
                                        `/admin/vendor/${vendorUserId}/products/variation-management`
                                    )
                                }
                                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer"
                            >
                                {/* <Layers className="w-4 h-4 mr-2 text-[#DC3173]" /> */}
                                {t("manage_variations")}
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={() =>
                                    router.push(
                                        `/admin/vendor/${vendorUserId}/products/offers`
                                    )
                                }
                                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer"
                            >
                                {t("manage_offers")}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                }
                buttonInfo={{
                    text: t("add_group"),
                    icon: SaveIcon,
                    onClick: handleOpenCreateModal,
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
                            {/* Group Title and Top Action Buttons (stacked on phones) */}
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div className="min-w-0">
                                    <h2 className="flex flex-wrap items-center gap-2 text-lg font-bold text-gray-800 wrap-anywhere">
                                        {group.title?.en || group.title?.pt}
                                        {!groupActive(group) && (
                                            <span
                                                className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-600"
                                                data-testid="addon-group-inactive"
                                            >
                                                {t("addon_inactive")}
                                            </span>
                                        )}
                                    </h2>
                                    {/* The optional name, when the group has one. */}
                                    {(group.name?.en || group.name?.pt) && (
                                        <p className="text-sm font-medium text-gray-500 wrap-anywhere" data-testid="addon-group-name">
                                            {group.name?.en || group.name?.pt}
                                        </p>
                                    )}
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        {t("min_lg")}: {group.minSelectable} &bull; {t("max")}: {group.maxSelectable}
                                    </p>
                                </div>
                                <div className="flex shrink-0 flex-wrap items-center gap-2">
                                    {/* Active / Inactive for the whole group, same height as the buttons */}
                                    <label className="flex h-8 cursor-pointer items-center gap-2 rounded-md border border-gray-200 px-3 text-xs font-medium text-gray-700">
                                        <Switch
                                            checked={groupActive(group)}
                                            disabled={!!saving[group._id]}
                                            onCheckedChange={(checked) =>
                                                saveStatus(group._id, checked, () => updateAddOnsGroup(group._id, { isActive: checked }))
                                            }
                                            aria-label={t("addon_group_status")}
                                            data-testid="addon-group-switch"
                                            className="data-[state=checked]:bg-[#DC3173]"
                                        />
                                        {/* fixed width: the buttons beside it don't move when the word changes */}
                                        <span className="w-12">{groupActive(group) ? t("addon_active") : t("addon_inactive")}</span>
                                    </label>
                                    {/* Edit → only group settings */}
                                    <button
                                        onClick={() => handleOpenEditModal(group)}
                                        className="flex h-8 items-center text-xs border border-gray-200 text-gray-700 px-3 rounded-md hover:bg-gray-50 transition font-medium"
                                    >
                                        <Edit className="w-3.5 h-3.5 mr-1 text-gray-500" />
                                        {t("edit") || "Edit"}
                                    </button>
                                    {/* Clone → the create form, filled from this group (plan.md §11.5) */}
                                    <button
                                        onClick={() => {
                                            setSelectedGroup(group);
                                            setActionType("clone");
                                            setIsModalOpen(true);
                                        }}
                                        className="flex h-8 items-center text-xs border border-gray-200 text-gray-700 px-3 rounded-md hover:bg-gray-50 transition font-medium"
                                    >
                                        <Copy className="w-3.5 h-3.5 mr-1 text-gray-500" />
                                        {t("addon_clone")}
                                    </button>
                                </div>
                            </div>

                            {/* Options Items Sub-cards */}
                            <div className="space-y-2 pt-2">
                                {group.options && group.options.length > 0 ? (
                                    group.options.map((option, idx) => {
                                        const taxObj = taxes.find(
                                            (tx) =>
                                                tx._id ===
                                                (typeof option.tax === "string"
                                                    ? option.tax
                                                    : option.tax?._id)
                                        );

                                        const hasSdr = option.sdr?.applicable === true;
                                        const containerCount = option.sdr?.containerCount ?? 0;

                                        return (
                                            <div
                                                key={option._id || option.sku || idx}
                                                className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border border-gray-100 bg-gray-50/50 px-4 py-2.5 rounded-lg text-sm"
                                            >
                                                {/* Left side: keeps at least 10rem, the right side moves under it on phones */}
                                                <div className="flex min-w-0 flex-1 basis-40 items-center gap-2 flex-wrap">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#DC3173] shrink-0" />

                                                    <span className={optionActive(option) ? "font-medium text-gray-700 wrap-anywhere" : "font-medium text-gray-400 line-through wrap-anywhere"}>
                                                        {option.name?.[lang]}
                                                    </span>

                                                    {option.sku && (
                                                        <span className="text-[10px] text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded">
                                                            {option.sku}
                                                        </span>
                                                    )}

                                                    {/* SDR Badge */}
                                                    {hasSdr && (
                                                        <span
                                                            className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded"
                                                            title={
                                                                t("sdr_container_deposit") ||
                                                                "This option participates in the SDR deposit system"
                                                            }
                                                        >
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                            SDR · {containerCount}{" "}
                                                            {containerCount === 1
                                                                ? t("container") || "container"
                                                                : t("containers") || "containers"}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Right side */}
                                                <div className="ml-auto flex shrink-0 items-center gap-3">
                                                    <span className="text-xs text-gray-600 font-medium">
                                                        €{option.price?.toFixed(2)}
                                                        {taxObj
                                                            ? ` (${t("inc_vat")}: ${taxObj.taxRate}%)`
                                                            : ` (${t("inc_vat")}: 0%)`}
                                                    </span>

                                                    {/* Active / Inactive for this option */}
                                                    {option.sku && (
                                                        <Switch
                                                            checked={optionActive(option)}
                                                            disabled={!!saving[option.sku]}
                                                            onCheckedChange={(checked) =>
                                                                saveStatus(option.sku as string, checked, () =>
                                                                    toggleAddOnOptionStatus(group._id, { optionSku: option.sku as string, isActive: checked }, vendorId),
                                                                )
                                                            }
                                                            aria-label={t("addon_option_status")}
                                                            data-testid="addon-option-switch"
                                                            className="data-[state=checked]:bg-[#DC3173]"
                                                        />
                                                    )}

                                                    {/* Delete */}
                                                    <button
                                                        onClick={() =>
                                                            handleOpenDeleteModal(group._id, option.sku)
                                                        }
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
                                    <p className="text-xs text-gray-400 italic">
                                        {t("no_options_added")}
                                    </p>
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
                allGroups={allGroups}
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