"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { useState } from "react";

import { Ban, CheckCircle, Eye } from "lucide-react";

import AllFilters from "@/components/Filtering/AllFilters";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import ApproveOrRejectModal from "@/components/Modals/ApproveOrRejectModal";
import { TMeta } from "@/types";
import { TAgent } from "@/types/user.type";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/use-translation";
import { getSortOptions } from "@/utils/sortOptions";

const DELIGO = "#DC3173";

interface IProps {
  agentsResult: { data: TAgent[]; meta?: TMeta };
}


export default function BlockedFleetManagers({ agentsResult }: IProps) {
  const { t } = useTranslation();
  const sortOptions = getSortOptions(t);
  const router = useRouter();
  const [statusInfo, setStatusInfo] = useState({
    agentId: "",
    agentName: "",
  });

  return (
    <div className="min-h-screen p-6 bg-slate-50">
      {/* HEADER */}
      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-extrabold mb-6 flex items-center gap-3"
      >
        <Ban className="w-8 h-8" style={{ color: DELIGO }} /> {t("blocked_fleet_managers")}
      </motion.h1>

      {/* SEARCH */}
      <AllFilters sortOptions={sortOptions} />

      {/* LIST CARD */}
      <Card className="p-6 bg-white shadow-sm rounded-2xl">
        <h2 className="text-xl font-semibold mb-4">
          {t("blocked_managers")}: {agentsResult?.meta?.total}
        </h2>
        <Separator className="mb-4" />

        <div className="space-y-4">
          {agentsResult?.data?.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              {t("no_blocked_managers_found")}
            </div>
          ) : (
            agentsResult?.data?.map((f) => (
              <motion.div
                key={f._id}
                whileHover={{ scale: 1.01 }}
                className="p-4 bg-slate-50 rounded-xl border flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={f.profilePhoto} />
                    <AvatarFallback>
                      {f.name?.firstName || f.name?.lastName
                        ? `${f.name?.firstName?.charAt(
                          0
                        )}${f.name?.lastName?.charAt(0)}`
                        : ""}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <div className="font-semibold text-lg">
                      {f.name?.firstName} {f.name?.lastName}
                    </div>
                    <div className="text-xs text-slate-500">{f.email}</div>
                    <div className="text-xs text-slate-500">
                      {t("city")}: {f.businessLocation?.city}
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="destructive">{t("blocked")}</Badge>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-semibold text-slate-600 text-sm">
                    {t("blocked")}:{" "}
                    {f.approvedOrRejectedOrBlockedAt
                      ? format(f.approvedOrRejectedOrBlockedAt, "dd/MM/yyyy")
                      : "N/A"}
                  </p>

                  <div className="flex items-center gap-2 justify-end mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/admin/agent/${f.userId}`)}
                    >
                      <Eye className="w-4 h-4 mr-1" /> {t("details")}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() =>
                        setStatusInfo({
                          agentId: f.userId,
                          agentName: `${f.name?.firstName} ${f.name?.lastName}`,
                        })
                      }
                    >
                      <CheckCircle className="w-4 h-4 mr-1" /> {t("unblock")}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </Card>

      {!!agentsResult?.meta?.total && agentsResult?.meta?.total > 0 && (
        <div className="px-6 mt-4">
          <PaginationComponent
            totalPages={agentsResult?.meta?.totalPage || 0}
          />
        </div>
      )}

      <ApproveOrRejectModal
        open={statusInfo?.agentId?.length > 0}
        onOpenChange={() => setStatusInfo({ agentId: "", agentName: "" })}
        status="UNBLOCKED"
        userId={statusInfo?.agentId}
        userName={statusInfo?.agentName}
      />
    </div>
  );
}
