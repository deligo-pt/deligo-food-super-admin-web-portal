// src/components/Dashboard/Reward&Claims/AllRewardProducts.tsx
"use client";

import AllFilters from "@/components/Filtering/AllFilters";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import ReusableTable from "@/components/common/ReusableTable";
import { useTranslation } from "@/hooks/use-translation";
import { TMeta } from "@/types";
import { IRewardProduct, RewardProductListResponse } from "@/types/reward-claim.type";
import { getSortOptions, SortOptionKey } from "@/utils/sortOptions";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useRewardProductColumns } from "./GetRewardProductColumns";
import EditRewardProductModal from "./EditRewardProductModal";

interface IProps {
    datas: RewardProductListResponse;
}

const sortFields = ["newest", "oldest", "nameAZ", "nameZA"] as SortOptionKey[];

export default function AllRewardProducts({ datas }: IProps) {
    const { t } = useTranslation();
    const router = useRouter();
    const sortOptions = getSortOptions(t, sortFields);

    const [editOpen, setEditOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<IRewardProduct | null>(null);

    const filterOptions = [
        {
            label: t("target_role") || "Target role",
            key: "targetRole",
            placeholder: "Select role",
            type: "select",
            items: [
                { label: "Customer", value: "Customer" },
                { label: "Rider", value: "Rider" },
                { label: "Vendor", value: "Vendor" },
            ],
        },
        {
            label: t("status") || "Status",
            key: "isActive",
            placeholder: "Select status",
            type: "select",
            items: [
                { label: "Active", value: "true" },
                { label: "Inactive", value: "false" },
            ],
        },
    ];

    const { columns, renderModal } = useRewardProductColumns({
        t,
        onRefresh: () => router.refresh(),
        onEdit: (product) => {
            setEditingProduct(product);
            setEditOpen(true);
        },
    });

    const products = datas?.data ?? [];
    const meta = datas?.meta;

    return (
        <div className="min-h-screen space-y-6">
            <TitleHeader
                title={t("reward_products") || "Reward products"}
                subtitle={t("manage_reward_products") || "Manage the rewards users can claim with points"}
                buttonInfo={{
                    text: t("create_product") || "Create product",
                    icon: Plus,
                    onClick: () => router.push("/admin/reward/product/create"),
                }}
            />

            <AllFilters sortOptions={sortOptions} {...(filterOptions && { filterOptions })} />

            <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="bg-white shadow-md rounded-2xl p-4 md:p-6 mb-2 overflow-x-auto"
            >
                <ReusableTable
                    data={products}
                    meta={meta as TMeta}
                    columns={columns}
                    getRowKey={(row) => row._id}
                    emptyMessage={t("no_reward_products_found") || "No reward products found"}
                />
            </motion.div>

            {!!meta?.total && meta.total > 0 && (
                <div className="pt-2">
                    <PaginationComponent totalPages={meta.totalPage || 0} />
                </div>
            )}

            {renderModal}

            <EditRewardProductModal
                product={editingProduct}
                open={editOpen}
                onOpenChange={setEditOpen}
                onSuccess={() => router.refresh()}
            />
        </div>
    );
}