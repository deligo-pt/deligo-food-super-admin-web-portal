'use client';

import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { useTranslation } from "@/hooks/use-translation";
import { TProductCategoryResponse } from "@/types/category.type";
import { useState } from "react";
import AddCategoryModal from "../AddCategoryModal";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import ReusableTable from "@/components/common/ReusableTable";
import { ChevronDown } from "lucide-react";
import { TMeta } from "@/types";
import { useRouter } from "next/navigation";
import { getProductCategoryColumns } from "@/components/ProductCategories/productCategoryColumns";
import { TVendor } from "@/types/user.type";
import { motion } from 'framer-motion';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface IProps {
    vendor: TVendor;
    categoriesResult: {
        data: TProductCategoryResponse[];
        meta: TMeta;
    };
}

const ProductCategories = ({ vendor, categoriesResult }: IProps) => {
    const { t, lang } = useTranslation();
    const router = useRouter();
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<TProductCategoryResponse | null>(null);


    // Open modal for Creation
    const handleOpenCreate = () => {
        setSelectedCategory(null);
        setIsCategoryModalOpen(true);
    };

    // Open modal for Editing
    const handleOpenEdit = (category: TProductCategoryResponse) => {
        setSelectedCategory(category);
        setIsCategoryModalOpen(true);
    };

    const categoryColumns = getProductCategoryColumns({
        t,
        lang,
        router,
        onEdit: handleOpenEdit,
    });

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
                            <DropdownMenuItem
                                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer"
                            >
                                <motion.button
                                    whileHover={{
                                        scale: 1.05,
                                    }}
                                    whileTap={{
                                        scale: 0.98,
                                    }}
                                    type="button"
                                    onClick={handleOpenCreate}
                                >
                                    <span>{t("add_category")}</span>
                                </motion.button>
                            </DropdownMenuItem>

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
            />
            <div className="bg-white rounded-xl shadow-sm border p-4 my-4">
                <div className="overflow-x-auto">
                    <ReusableTable
                        data={categoriesResult?.data || []}
                        meta={categoriesResult?.meta as TMeta}
                        columns={categoryColumns}
                        getRowKey={(row) => row._id}
                        emptyMessage={t("no_categories_found")}
                    />
                </div>

                {!!categoriesResult?.meta?.totalPage && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="px-4 md:px-6 pt-6 pb-2"
                    >
                        <PaginationComponent
                            totalPages={categoriesResult?.meta?.totalPage as number}
                        />
                    </motion.div>
                )}
            </div>

            {/* Reused Modal for Add & Edit */}
            <AddCategoryModal
                isOpen={isCategoryModalOpen}
                onClose={() => {
                    setIsCategoryModalOpen(false);
                    setSelectedCategory(null);
                }}
                vendorId={vendor?._id}
                initialData={selectedCategory}
                onSuccess={() => router.refresh()}
            />
        </>
    );
};

export default ProductCategories;