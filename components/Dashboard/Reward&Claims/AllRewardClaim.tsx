// src/components/Dashboard/Reward&Claims/AllRewardClaims.tsx
"use client";

import AllFilters from "@/components/Filtering/AllFilters";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import ReusableTable from "@/components/common/ReusableTable";
import { useTranslation } from "@/hooks/use-translation";
import { TMeta } from "@/types";
import { IRewardClaim, RewardClaimListResponse } from "@/types/reward-claim.type";
import { CLAIM_STATUSES, ClaimUiAction } from "@/validations/reward-claim/reward-claim.validation";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useRewardClaimColumns } from "./GetRewardClaimColumns";
import UpdateClaimStatusModal from "./UpdateClaimStatusModal";

interface IProps {
    datas: RewardClaimListResponse;
}

export default function AllRewardClaims({ datas }: IProps) {
    const { t } = useTranslation();
    const router = useRouter();

    const [modalOpen, setModalOpen] = useState(false);
    const [activeClaim, setActiveClaim] = useState<IRewardClaim | null>(null);
    const [activeAction, setActiveAction] = useState<ClaimUiAction | null>(null);

    // Backend supports ?status=PENDING|SCHEDULED|COLLECTED|CANCELLED (anything else is a 400)
    const filterOptions = [
        {
            label: t("status") || "Status",
            key: "status",
            placeholder: "Select status",
            type: "select",
            items: CLAIM_STATUSES.map((s) => ({ label: s, value: s })),
        },
    ];

    const { columns } = useRewardClaimColumns({
        t,
        onAction: (claim, action) => {
            setActiveClaim(claim);
            setActiveAction(action);
            setModalOpen(true);
        },
    });

    const claims = datas?.data ?? [];
    const meta = datas?.meta;

    return (
        <div className="min-h-screen space-y-6">
            <TitleHeader
                title={t("reward_claims") || "Reward claims"}
                subtitle={t("manage_reward_claims") || "Review claims and confirm pickups"}
            />

            {/* Claims are always newest-first from the API, so no sort options here */}
            <AllFilters {...{ filterOptions }} />

            <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="bg-white shadow-md rounded-2xl p-4 md:p-6 mb-2 overflow-x-auto"
            >
                <ReusableTable
                    data={claims}
                    meta={meta as TMeta}
                    columns={columns}
                    getRowKey={(row) => row._id}
                    emptyMessage={t("no_reward_claims_found") || "No reward claims found"}
                />
            </motion.div>

            {!!meta?.total && meta.total > 0 && (
                <div className="pt-2">
                    <PaginationComponent totalPages={meta.totalPage || 0} />
                </div>
            )}

            <UpdateClaimStatusModal
                claim={activeClaim}
                action={activeAction}
                open={modalOpen}
                onOpenChange={setModalOpen}
                onSuccess={() => router.refresh()}
            />
        </div>
    );
}