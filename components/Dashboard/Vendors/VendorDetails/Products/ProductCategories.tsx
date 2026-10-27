"use client";

import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { useTranslation } from "@/hooks/use-translation";
import { TProductCategoryResponse } from "@/types/category.type";
import { useState, useEffect } from "react";
import AddCategoryModal from "../AddCategoryModal";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import { ChevronDown, PlusIcon, GripVertical } from "lucide-react";
import { TMeta } from "@/types";
import { useRouter } from "next/navigation";
import { getProductCategoryColumns } from "@/components/ProductCategories/productCategoryColumns";
import { TVendor } from "@/types/user.type";
import { motion } from "framer-motion";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { reOrderProductCategory, softDeleteProductCategory } from "@/services/dashboard/category/product-category.service";
import DeleteModal from "@/components/Modals/DeleteModal";

// dnd-kit
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

interface IProps {
    vendor: TVendor;
    categoriesResult: {
        data: TProductCategoryResponse[];
        meta: TMeta;
    };
}

// Sortable Row
function SortableRow({
    category,
    children,
}: {
    category: TProductCategoryResponse;
    children: React.ReactNode;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: category._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 50 : "auto",
    };

    return (
        <tr
            ref={setNodeRef}
            style={style}
            className={`border-b border-gray-100 hover:bg-gray-50/50 ${isDragging ? "bg-rose-50 shadow-md" : ""
                }`}
        >
            <td className="w-10 px-2 py-3">
                <button
                    type="button"
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-[#DC3173]"
                >
                    <GripVertical size={18} />
                </button>
            </td>
            {children}
        </tr>
    );
}

const ProductCategories = ({ vendor, categoriesResult }: IProps) => {
    const { t, lang } = useTranslation();
    const router = useRouter();

    const [modalType, setModalType] = useState("");
    const [selectedCategory, setSelectedCategory] =
        useState<TProductCategoryResponse | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isReordering, setIsReordering] = useState(false);

    // Local state for optimistic UI
    const [categories, setCategories] = useState<TProductCategoryResponse[]>(
        categoriesResult?.data || []
    );

    // Keep local state in sync when server data changes
    useEffect(() => {
        setCategories(categoriesResult?.data || []);
    }, [categoriesResult?.data]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 6 },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleOpenCreate = () => {
        setSelectedCategory(null);
        setModalType("edit");
    };

    const handleOpen = (category: TProductCategoryResponse, type: string) => {
        setSelectedCategory(category);
        setModalType(type);
    };

    const categoryColumns = getProductCategoryColumns({
        t,
        lang,
        router,
        onOpen: handleOpen,
    });

    const softDeleteCategory = async () => {
        if (!selectedCategory) return;

        setIsDeleting(true);
        const toastId = toast.loading("Deleting category...");

        try {
            const result = await softDeleteProductCategory(selectedCategory._id);

            if (result?.success) {
                toast.success(result.message || "Category deleted successfully!", {
                    id: toastId,
                });
                setModalType("");
                setSelectedCategory(null);
                router.refresh();
            } else {
                toast.error(result?.message || "Category delete failed", {
                    id: toastId,
                });
            }
        } catch {
            toast.error("Something went wrong", { id: toastId });
        } finally {
            setIsDeleting(false);
        }
    };

    // Drag & Drop Reorder
    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over || active.id === over.id) return;

        const oldIndex = categories.findIndex((c) => c._id === active.id);
        const newIndex = categories.findIndex((c) => c._id === over.id);

        if (oldIndex === -1 || newIndex === -1) return;

        // Optimistic update
        const newCategories = arrayMove(categories, oldIndex, newIndex);
        setCategories(newCategories);

        // 1-based order expected by backend
        const newOrder = newIndex + 1;
        const categoryId = active.id as string;

        setIsReordering(true);
        const toastId = toast.loading("Updating order...");

        try {
            const result = await reOrderProductCategory({
                categoryId,
                newOrder,
                vendorId: vendor._id,
            });

            if (result?.success) {
                toast.success(result.message || "Category order updated successfully!", {
                    id: toastId,
                });
                router.refresh();
            } else {
                setCategories(categoriesResult?.data || []);
                toast.error(result?.message || "Failed to update order", {
                    id: toastId,
                });
            }
        } finally {
            setIsReordering(false);
        }
    };

    return (
        <>
            <TitleHeader
                title={t("product_categories")}
                subtitle={t("manage_your_all_products_categories")}
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
                            {/* ... keep your existing dropdown items ... */}
                            <DropdownMenuItem
                                onClick={() =>
                                    router.push(`/admin/vendor/${vendor?.userId}/manage-products`)
                                }
                                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer"
                            >
                                {t("manage_products") || "Manage Product"}
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={() =>
                                    router.push(
                                        `/admin/vendor/${vendor?.userId}/products/update-discount`
                                    )
                                }
                                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer"
                            >
                                {t("update_discounts") || "Update Discount"}
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={() =>
                                    router.push(
                                        `/admin/vendor/${vendor?.userId}/products/increase-price`
                                    )
                                }
                                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer"
                            >
                                {t("increase_prices") || "Increase Price"}
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={() =>
                                    router.push(
                                        `/admin/vendor/${vendor?.userId}/products/offers/create-new`
                                    )
                                }
                                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer"
                            >
                                {t("create_new_offer") || "Create New Offer"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="my-1 border-gray-100" />

                            {/* Newly added sections */}
                            <DropdownMenuItem
                                onClick={() =>
                                    router.push(`/admin/vendor/${vendor?.userId}/add-product`)
                                }
                                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer"
                            >
                                {t("add_product") || "Add Product"}
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={() =>
                                    router.push(
                                        `/admin/vendor/${vendor?.userId}/products/add-ons`
                                    )
                                }
                                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer"
                            >
                                {t("add_ons") || "Add-ons"}
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={() =>
                                    router.push(
                                        `/admin/vendor/${vendor?.userId}/products/variation-management`
                                    )
                                }
                                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer"
                            >
                                {/* <Layers className="w-4 h-4 mr-2 text-[#DC3173]" /> */}
                                {t("variation_management") || "Variation Management"}
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={() =>
                                    router.push(
                                        `/admin/vendor/${vendor?.userId}/products/offers`
                                    )
                                }
                                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer"
                            >
                                {t("created_offers") || "Created Offers"}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                }
                buttonInfo={{
                    text: t("add_product_category"),
                    icon: PlusIcon,
                    onClick: handleOpenCreate,
                }}
            />

            <div className="bg-white rounded-xl shadow-sm border p-4 my-4">
                <div className="overflow-x-auto">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                        modifiers={[restrictToVerticalAxis]}
                    >
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="w-10 px-2 py-3" />
                                    {categoryColumns.map((col, i) => (
                                        <th
                                            key={i}
                                            className={`px-4 py-3 text-left ${col.className || ""}`}
                                        >
                                            {col.header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <SortableContext
                                items={categories.map((c) => c._id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <tbody>
                                    {categories.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={categoryColumns.length + 1}
                                                className="text-center py-10 text-gray-500"
                                            >
                                                {t("no_categories_found")}
                                            </td>
                                        </tr>
                                    ) : (
                                        categories.map((category) => (
                                            <SortableRow key={category._id} category={category}>
                                                {categoryColumns.map((col, i) => (
                                                    <td
                                                        key={i}
                                                        className={`px-4 py-3 ${col.className || ""}`}
                                                    >
                                                        {typeof col.accessor === "function"
                                                            ? col.accessor(category)
                                                            : null}
                                                    </td>
                                                ))}
                                            </SortableRow>
                                        ))
                                    )}
                                </tbody>
                            </SortableContext>
                        </table>
                    </DndContext>
                </div>

                {isReordering && (
                    <p className="text-xs text-center text-gray-400 mt-2">
                        Updating order...
                    </p>
                )}

                {!!categoriesResult?.meta?.totalPage && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="px-4 md:px-6 pt-6 pb-2"
                    >
                        <PaginationComponent
                            totalPages={categoriesResult.meta.totalPage as number}
                        />
                    </motion.div>
                )}
            </div>

            {/* Add / Edit Modal */}
            <AddCategoryModal
                isOpen={modalType === "edit"}
                onClose={() => {
                    setModalType("");
                    setSelectedCategory(null);
                }}
                vendorId={vendor?._id}
                initialData={selectedCategory}
                onSuccess={() => router.refresh()}
            />

            {/* Delete Modal */}
            <DeleteModal
                open={modalType === "delete"}
                onOpenChange={(open) => {
                    if (!open) {
                        setModalType("");
                        setSelectedCategory(null);
                    }
                }}
                onConfirm={softDeleteCategory}
                isDeleting={isDeleting}
                variant="destructive"
            />
        </>
    );
};

export default ProductCategories;