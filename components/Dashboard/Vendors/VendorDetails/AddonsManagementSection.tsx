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
import { groupLabel, presentText } from "@/utils/addonGroup";

/** Option rows and their header: name · price · VAT · on/off · delete. */
const OPTION_GRID = "grid grid-cols-[minmax(0,1fr)_4.5rem_2.75rem_2.75rem_2rem] items-center gap-2 sm:grid-cols-[minmax(0,1fr)_6rem_4rem_3.5rem_2.5rem] sm:gap-3";

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
                            className="flex gap-3 rounded-xl border bg-white p-4 shadow-sm transition hover:shadow sm:gap-4 sm:p-5"
                        >
                            {/* One left edge: the group's switch has its own column, and the
                                name, details, divider and options all start to its right —
                                it controls everything in that column. Off here turns every
                                option off for customers; each option keeps its own state. */}
                            <div className="flex h-7 shrink-0 items-center">
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
                            </div>

                            <div className="min-w-0 flex-1">
                                {/* Name and details, buttons on the right (under them on phones) */}
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="min-w-0">
                                        <h2 className="text-lg font-bold leading-7 text-gray-900 wrap-anywhere">
                                            {/* The vendor's own name; the title when it has none. */}
                                            {groupLabel(group, lang)}
                                        </h2>
                                        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
                                            {/* With a name as the heading, the title customers see. */}
                                            {presentText(group.name) && (
                                                <>
                                                    <span className="wrap-anywhere" data-testid="addon-group-title">
                                                        {t("addon_customers_see")}:{" "}
                                                        <span className="text-gray-700">
                                                            {group.title?.[lang] || group.title?.en || group.title?.pt}
                                                        </span>
                                                    </span>
                                                    <span aria-hidden className="text-gray-300">·</span>
                                                </>
                                            )}
                                            <span>
                                                {t("min_lg")} <span className="font-medium text-gray-700">{group.minSelectable}</span>
                                            </span>
                                            <span aria-hidden className="text-gray-300">·</span>
                                            <span>
                                                {t("max")} <span className="font-medium text-gray-700">{group.maxSelectable}</span>
                                            </span>
                                            <span aria-hidden className="text-gray-300">·</span>
                                            <span
                                                className={groupActive(group) ? "font-medium text-[#DC3173]" : "font-medium text-gray-500"}
                                                data-testid="addon-group-status"
                                            >
                                                {groupActive(group) ? t("addon_active") : t("addon_inactive")}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                                        {/* Edit → only group settings */}
                                        <button
                                            onClick={() => handleOpenEditModal(group)}
                                            className="flex h-8 items-center rounded-md border border-gray-200 px-3 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
                                        >
                                            <Edit className="mr-1 h-3.5 w-3.5 text-gray-500" />
                                            {t("edit") || "Edit"}
                                        </button>
                                        {/* Clone → the create form, filled from this group (plan.md §11.5) */}
                                        <button
                                            onClick={() => {
                                                setSelectedGroup(group);
                                                setActionType("clone");
                                                setIsModalOpen(true);
                                            }}
                                            className="flex h-8 items-center rounded-md border border-gray-200 px-3 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
                                        >
                                            <Copy className="mr-1 h-3.5 w-3.5 text-gray-500" />
                                            {t("addon_clone")}
                                        </button>
                                    </div>
                                </div>

                                <div className="my-4 border-t" />

                                {/* A group that is off hides all its options from customers.
                                    Each option keeps its own saved on/off (the API doesn't
                                    change it — checked 28 Nov 2026), so turning the group
                                    back on brings back exactly the options that were on. */}
                                {!groupActive(group) && (group.options?.length ?? 0) > 0 && (
                                    <p className="mb-3 rounded-lg bg-gray-100 px-3 py-2 text-xs text-gray-600" data-testid="addon-group-off-note">
                                        {t("addon_group_off_note")}
                                    </p>
                                )}

                                {/* Options: fixed columns so prices, VAT and switches line up */}
                                {group.options && group.options.length > 0 ? (
                                    <div className={groupActive(group) ? "space-y-2" : "space-y-2 opacity-60"}>
                                        <div className={`${OPTION_GRID} px-3 text-[11px] font-medium uppercase tracking-wide text-gray-400`}>
                                            <span>{t("addon_col_option")}</span>
                                            <span className="text-right">{t("addon_col_price")}</span>
                                            <span className="text-right">{t("addon_col_vat")}</span>
                                            <span className="sr-only">{t("addon_option_status")}</span>
                                            <span className="sr-only">{t("delete_option") || "Delete Option"}</span>
                                        </div>
                                        {group.options.map((option, idx) => {
                                            const taxObj = taxes.find(
                                                (tx) =>
                                                    tx._id ===
                                                    (typeof option.tax === "string" ? option.tax : option.tax?._id),
                                            );
                                            const hasSdr = option.sdr?.applicable === true;
                                            const containerCount = option.sdr?.containerCount ?? 0;
                                            const on = groupActive(group) && optionActive(option);

                                            return (
                                                <div
                                                    key={option._id || option.sku || idx}
                                                    className={`${OPTION_GRID} rounded-lg border border-gray-100 bg-white px-3 py-2 text-sm transition-colors hover:bg-gray-50`}
                                                >
                                                    <div className="min-w-0">
                                                        <div className="flex min-w-0 items-center gap-2">
                                                            <span className={on ? "font-medium text-gray-800 wrap-anywhere" : "font-medium text-gray-400 line-through wrap-anywhere"}>
                                                                {option.name?.[lang]}
                                                            </span>
                                                            {hasSdr && (
                                                                <span
                                                                    className="shrink-0 rounded border border-[#DC3173]/20 bg-[#DC3173]/5 px-1.5 py-0.5 text-[10px] font-semibold text-[#DC3173]"
                                                                    title={
                                                                        t("sdr_container_deposit") ||
                                                                        "This option participates in the SDR deposit system"
                                                                    }
                                                                >
                                                                    SDR · {containerCount}{" "}
                                                                    {containerCount === 1
                                                                        ? t("container") || "container"
                                                                        : t("containers") || "containers"}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {option.sku && (
                                                            <p className="mt-0.5 truncate font-mono text-[10px] text-gray-400">{option.sku}</p>
                                                        )}
                                                    </div>
                                                    <span className="text-right font-semibold tabular-nums text-gray-800">
                                                        €{option.price?.toFixed(2)}
                                                    </span>
                                                    <span className="text-right text-xs tabular-nums text-gray-500">
                                                        {taxObj ? `${taxObj.taxRate}%` : "0%"}
                                                    </span>
                                                    <div className="flex justify-center">
                                                        {option.sku && (
                                                            <Switch
                                                                // Off and locked while the group is off; its own
                                                                // state shows again when the group is back on.
                                                                checked={on}
                                                                disabled={!groupActive(group) || !!saving[option.sku]}
                                                                title={groupActive(group) ? undefined : t("addon_group_off_hint")}
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
                                                    </div>
                                                    <button
                                                        onClick={() => handleOpenDeleteModal(group._id, option.sku)}
                                                        className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                                                        title={t("delete_option") || "Delete Option"}
                                                        aria-label={t("delete_option") || "Delete Option"}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-xs italic text-gray-400">{t("no_options_added")}</p>
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