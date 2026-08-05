"use client";


import { useTranslation } from "@/hooks/use-translation";
import { useStore } from "@/store/store";
import { TOffer } from "@/types/offer.type";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { getCampaignColumns } from "./CampaignColumns";
import ReusableTable from "@/components/common/ReusableTable";
import { getCookie } from "@/utils/cookies";
import { jwtDecode } from "jwt-decode";

interface IProps {
  offers: TOffer[];
  handleStatusInfo: (
    offerId: string,
    offerName: string,
    status: boolean,
  ) => void;
  handleOpenEditModal: (offer: TOffer) => void;
  handleDeleteId: (id: string) => void;
}

export default function CampaignTable({
  offers,
  handleStatusInfo,
  handleOpenEditModal,
  handleDeleteId,
}: IProps) {
  const { t } = useTranslation();
  const { lang } = useStore();
  const router = useRouter();
  const accessToken = getCookie("accessToken");

  const { role } = jwtDecode(accessToken as string) as { role: string };

  const columns = getCampaignColumns({
    t,
    lang,
    role,
    router,
    handleStatusInfo,
    handleOpenEditModal,
    handleDeleteId,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white shadow-md rounded-2xl p-4 md:p-6 mb-2 overflow-x-auto"
    >
      <ReusableTable
        data={offers}
        columns={columns}
        getRowKey={(row) => row._id}
        emptyMessage={t("no_offers_found")}
      />
    </motion.div>
  );
}