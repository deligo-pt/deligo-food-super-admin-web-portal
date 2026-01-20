"use client";

import AllFilters from "@/components/Filtering/AllFilters";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import ApproveOrRejectModal from "@/components/Modals/ApproveOrRejectModal";
import DeleteModal from "@/components/Modals/DeleteModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/use-translation";
import { userSoftDeleteReq } from "@/services/auth/deleteUser";
import { TMeta } from "@/types";
import { TAdmin } from "@/types/admin.type";
import { getSortOptions } from "@/utils/sortOptions";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Ban, Check, Eye, PlusCircle, Trash } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";
import { toast } from "sonner";

// Admin type
type Role = "ADMIN" | "SUPER_ADMIN";

interface IProps {
  adminsResult: { data: TAdmin[]; meta?: TMeta };
}

export default function AllAdmins({ adminsResult }: IProps) {
  const { t } = useTranslation();
  const sortOptions = getSortOptions(t);
  const filterOptions = [
    {
      label: t("status"),
      key: "status",
      placeholder: t("select_status"),
      type: "select",
      items: [
        {
          label: t("pending"),
          value: "PENDING",
        },
        {
          label: t("submitted"),
          value: "SUBMITTED",
        },
        {
          label: t("approved"),
          value: "APPROVED",
        },
        {
          label: t("rejected"),
          value: "REJECTED",
        },
        {
          label: t("blocked"),
          value: "BLOCKED",
        },
      ],
    },
  ];
  const router = useRouter();
  const [statusInfo, setStatusInfo] = useState({
    adminId: "",
    adminName: "",
    status: "",
    remarks: "",
  });
  const [deleteId, setDeleteId] = useState("");

  const showingInfo = useMemo(() => {
    const page = adminsResult?.meta?.page || 1;
    const limit = adminsResult?.meta?.limit || 10;
    const total = adminsResult?.meta?.total || 0;

    const first = (page - 1) * limit + 1;
    const last = Math.min(page * limit, total);
    return {
      first,
      last,
    };
  }, [adminsResult]);

  const closeDeleteModal = (open: boolean) => {
    if (!open) {
      setDeleteId("");
    }
  };

  const deleteAdmin = async () => {
    const toastId = toast.loading("Deleting Admin...");

    const result = await userSoftDeleteReq(deleteId);

    if (result?.success) {
      router.refresh();
      setDeleteId("");
      toast.success(result.message || "Admin deleted successfully!", {
        id: toastId,
      });
      return;
    }

    toast.error(result.message || "Admin deletion failed", {
      id: toastId,
    });
    console.log(result);
  };

  // Small UI helpers
  const RoleBadge: React.FC<{ role: Role }> = ({ role }) => {
    const base =
      "inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ring-1 ring-inset";
    if (role === "SUPER_ADMIN")
      return (
        <span
          className={`${base} bg-[rgba(220,49,115,0.12)] text-[#DC3173] ring-[#F7D6E0] animate-pulse`}
        >
          {role}
        </span>
      );
    if (role === "ADMIN")
      return (
        <span className={`${base} bg-gray-100 text-gray-800 ring-gray-200`}>
          {role}
        </span>
      );
    return (
      <span className={`${base} bg-yellow-50 text-yellow-800 ring-yellow-100`}>
        {role}
      </span>
    );
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 6 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.03 },
    }),
  };

  return (
    <div className="min-h-screen p-6 lg:p-10 bg-linear-to-b from-white via-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-3 mb-6"
        >
          <div>
            <h1 className="text-3xl font-extrabold text-[#DC3173]">
              {t("all_admins")}
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              {t("manage_users_who_can_access_administer")}
            </p>
          </div>
          <Link href="/admin/add-admin">
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-[#DC3173] to-[#e84b93] text-white font-semibold shadow-lg transform hover:-translate-y-0.5 transition"
            >
              <PlusCircle size={18} /> {t("create")}
            </motion.button>
          </Link>
        </motion.div>

        <AllFilters sortOptions={sortOptions} filterOptions={filterOptions} />

        {/* card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.36 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
        >
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2>{t("total_admins")}: {adminsResult?.meta?.total}</h2>
            </div>

            <div className="text-sm text-gray-500">
              {t("showing")}{" "}
              <span className="font-medium text-gray-700">
                {showingInfo?.first}
              </span>{" "}
              -{" "}
              <span className="font-medium text-gray-700">
                {showingInfo?.last}
              </span>{" "}
              {t("of")}{" "}
              <span className="font-medium">{adminsResult?.meta?.total}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("admin")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("role")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("status")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("created")}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("actions")}
                  </th>
                </tr>
              </thead>

              <motion.tbody initial="hidden" animate="visible">
                {adminsResult?.data?.map((a, idx) => (
                  <motion.tr
                    key={a._id}
                    custom={idx}
                    variants={rowVariants}
                    whileHover={{ scale: 1.005 }}
                    className="hover:bg-gray-50 transition"
                    style={{ cursor: "default" }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-linear-to-br from-gray-100 to-gray-50 flex items-center justify-center text-gray-600 font-bold text-sm overflow-hidden">
                          <Avatar className="w-11 h-11">
                            <AvatarImage
                              src={a?.profilePhoto}
                              alt={`${a.name?.firstName} ${a.name?.lastName}`}
                            />
                            <AvatarFallback>
                              {a.name?.firstName?.charAt(0)}
                              {a.name?.lastName?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        </div>

                        <div>
                          <div className="font-semibold">
                            {a.name?.firstName} {a.name?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{a.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <RoleBadge role={a.role} />
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${a.status === "APPROVED"
                          ? "bg-green-50 text-green-800"
                          : "bg-red-50 text-red-800"
                          }`}
                      >
                        {a.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {a.createdAt ? format(a.createdAt, "dd/MM/yyyy") : "-"}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {a.role !== "SUPER_ADMIN" && (
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost">
                            <Eye size={14} /> {t("view")}
                          </Button>
                          {/* <Button className="bg-[#DC3173] hover:bg-[#DC3173]/90">
                            <Edit2 size={14} /> Edit
                          </Button> */}
                          {a.status === "APPROVED" && (
                            <Button
                              onClick={() =>
                                setStatusInfo({
                                  adminId: a.userId as string,
                                  adminName: `${a.name?.firstName} ${a.name?.lastName}`,
                                  status: "BLOCKED",
                                  remarks: "",
                                })
                              }
                              className="bg-yellow-500 hover:bg-yellow-600"
                            >
                              <Ban size={14} /> {t("block")}
                            </Button>
                          )}
                          {a.status === "BLOCKED" && (
                            <Button
                              onClick={() =>
                                setStatusInfo({
                                  adminId: a.userId as string,
                                  adminName: `${a.name?.firstName} ${a.name?.lastName}`,
                                  status: "UNBLOCKED",
                                  remarks: "",
                                })
                              }
                              className="bg-green-500 hover:bg-green-600"
                            >
                              <Check size={14} /> {t("unblock")}
                            </Button>
                          )}
                          {!a.isDeleted && (
                            <Button
                              onClick={() => setDeleteId(a.userId as string)}
                              variant="destructive"
                            >
                              <Trash size={14} /> {t("delete")}
                            </Button>
                          )}
                        </div>
                      )}
                    </td>
                  </motion.tr>
                ))}

                {adminsResult?.meta?.total === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      {t("no_admins_found_match")}
                    </td>
                  </tr>
                )}
              </motion.tbody>
            </table>
          </div>

          {!!adminsResult?.meta?.total && adminsResult?.meta?.total > 0 && (
            <div className="px-6 pb-4">
              <PaginationComponent
                totalPages={adminsResult?.meta?.totalPage || 0}
              />
            </div>
          )}
        </motion.div>
      </div>

      <DeleteModal
        open={!!deleteId}
        onOpenChange={closeDeleteModal}
        onConfirm={deleteAdmin}
      />

      <ApproveOrRejectModal
        open={statusInfo.adminId?.length > 0}
        onOpenChange={() =>
          setStatusInfo({
            adminId: "",
            adminName: "",
            status: "",
            remarks: "",
          })
        }
        status={statusInfo.status as "BLOCKED" | "UNBLOCKED"}
        userName={statusInfo.adminName}
        userId={statusInfo.adminId}
      />
    </div>
  );
}
