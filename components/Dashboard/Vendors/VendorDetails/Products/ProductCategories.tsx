'use client';

import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { useTranslation } from "@/hooks/use-translation";
import { TProductCategoryResponse } from "@/types/category.type";
import { useState } from "react";
import AddCategoryModal from "../AddCategoryModal";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import ReusableTable from "@/components/common/ReusableTable";
import { Plus } from "lucide-react";
import { TMeta } from "@/types";
import { useRouter } from "next/navigation";
import { getProductCategoryColumns } from "@/components/ProductCategories/productCategoryColumns";
import { TVendor } from "@/types/user.type";
import { motion } from 'framer-motion';

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
                buttonInfo={{
                    text: t("add_category"),
                    icon: Plus,
                    onClick: handleOpenCreate
                }}
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