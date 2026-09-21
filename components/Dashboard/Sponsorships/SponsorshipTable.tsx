"use client";

import { useTranslation } from "@/hooks/use-translation";
import { TSponsorship } from "@/types/sponsorship.type";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { getSponsorshipColumns } from "./SponsorshipColumns";
import ReusableTable from "@/components/common/ReusableTable";
import { TMeta } from "@/types";

interface IProps {
  sponsorships: TSponsorship[];
  meta: TMeta;
  handleDeleteId: (id: string) => void;
  handleOpenEditModal: (sponsorship: TSponsorship) => void;
}

export default function SponsorshipTable({
  sponsorships,
  meta,
  handleDeleteId,
  handleOpenEditModal,
}: IProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const columns = getSponsorshipColumns({
    t,
    router,
    handleDeleteId,
    handleOpenEditModal,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white shadow-md rounded-2xl p-4 md:p-6 mb-2 overflow-x-auto"
    >
      <ReusableTable
        data={sponsorships}
        meta={meta}
        columns={columns}
        getRowKey={(row) => row._id}
        emptyMessage={t("no_sponsorships_found")}
      />
    </motion.div>
  );
}
