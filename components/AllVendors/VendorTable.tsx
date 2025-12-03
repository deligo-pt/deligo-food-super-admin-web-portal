"use client";

import AllFilters from "@/components/Filtering/AllFilters";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import ApproveOrRejectModal from "@/components/Modals/ApproveOrRejectModal";
import DeleteModal from "@/components/Modals/DeleteModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TMeta, TResponse } from "@/types";
import { TVendor } from "@/types/user.type";
import { getCookie } from "@/utils/cookies";
import { deleteData } from "@/utils/requests";
import { motion } from "framer-motion";
import {
  CircleCheckBig,
  Cog,
  IdCard,
  Mail,
  MoreVertical,
  Phone,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface IProps {
  vendorsResult: { data: TVendor[]; meta?: TMeta };
}

const sortOptions = [
  { label: "Newest First", value: "-createdAt" },
  { label: "Oldest First", value: "createdAt" },
  { label: "Name (A-Z)", value: "name.firstName" },
  { label: "Name (Z-A)", value: "-name.lastName" },
];

const filterOptions = [
  {
    label: "Status",
    key: "status",
    placeholder: "Select Status",
    type: "select",
    items: [
      {
        label: "Pending",
        value: "PENDING",
      },
      {
        label: "Submitted",
        value: "SUBMITTED",
      },
      {
        label: "Approved",
        value: "APPROVED",
      },
      {
        label: "Rejected",
        value: "REJECTED",
      },
      {
        label: "Blocked",
        value: "BLOCKED",
      },
    ],
  },
];

export default function VendorTable({ vendorsResult }: IProps) {
  const router = useRouter();
  const [statusInfo, setStatusInfo] = useState({
    vendorId: "",
    vendorName: "",
    status: "",
  });
  const [deleteId, setDeleteId] = useState("");

  const closeDeleteModal = (open: boolean) => {
    if (!open) {
      setDeleteId("");
    }
  };

  const deleteVendor = async () => {
    const toastId = toast.loading("Deleting Vendor...");

    try {
      const result = (await deleteData(`/auth/soft-delete/${deleteId}`, {
        headers: { authorization: getCookie("accessToken") },
      })) as unknown as TResponse<null>;

      if (result?.success) {
        router.refresh();
        setDeleteId("");
        toast.success(result.message || "Vendor deleted successfully!", {
          id: toastId,
        });
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Vendor delete failed", {
        id: toastId,
      });
    }
  };

  return (
    <>
      <AllFilters sortOptions={sortOptions} filterOptions={filterOptions} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-md rounded-2xl p-4 md:p-6 mb-2 overflow-x-auto"
      >
        <Table className="max-w-full">
          <TableHeader>
            <TableRow>
              <TableHead>
                <div className="text-[#DC3173] flex gap-2 items-center">
                  <IdCard className="w-4" />
                  Name
                </div>
              </TableHead>
              <TableHead>
                <div className="text-[#DC3173] flex gap-2 items-center">
                  <Mail className="w-4" />
                  Email
                </div>
              </TableHead>
              <TableHead>
                <div className="text-[#DC3173] flex gap-2 items-center">
                  <Phone className="w-4" />
                  Phone
                </div>
              </TableHead>
              <TableHead>
                <div className="text-[#DC3173] flex gap-2 items-center">
                  <CircleCheckBig className="w-4" />
                  Status
                </div>
              </TableHead>
              <TableHead className="text-right text-[#DC3173] flex gap-2 items-center justify-end">
                <Cog className="w-4" />
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vendorsResult &&
              vendorsResult?.data?.length > 0 &&
              vendorsResult?.data?.map((vendor) => (
                <TableRow key={vendor._id}>
                  <TableCell>
                    {vendor.name?.firstName} {vendor.name?.lastName}
                  </TableCell>
                  <TableCell>{vendor.email}</TableCell>
                  <TableCell>{vendor.contactNumber}</TableCell>
                  <TableCell>
                    {vendor.isDeleted ? "Deleted" : vendor.status}
                  </TableCell>
                  <TableCell className="text-right">
                    {!vendor.isDeleted && (
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <MoreVertical className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            className=""
                            onClick={() =>
                              router.push("/admin/vendor/" + vendor.userId)
                            }
                          >
                            View
                          </DropdownMenuItem>
                          {vendor.status === "SUBMITTED" && (
                            <DropdownMenuItem
                              onClick={() =>
                                setStatusInfo({
                                  vendorId: vendor.userId as string,
                                  vendorName: vendor.businessDetails
                                    ?.businessName as string,
                                  status: "APPROVED",
                                })
                              }
                            >
                              Approve
                            </DropdownMenuItem>
                          )}
                          {vendor.status === "SUBMITTED" && (
                            <DropdownMenuItem
                              onClick={() =>
                                setStatusInfo({
                                  vendorId: vendor.userId as string,
                                  vendorName: vendor.businessDetails
                                    ?.businessName as string,
                                  status: "REJECTED",
                                })
                              }
                            >
                              Reject
                            </DropdownMenuItem>
                          )}
                          {vendor.status === "APPROVED" && (
                            <DropdownMenuItem
                              onClick={() =>
                                setStatusInfo({
                                  vendorId: vendor.userId as string,
                                  vendorName: vendor.businessDetails
                                    ?.businessName as string,
                                  status: "BLOCKED",
                                })
                              }
                            >
                              Block
                            </DropdownMenuItem>
                          )}
                          {vendor.status === "BLOCKED" && (
                            <DropdownMenuItem
                              onClick={() =>
                                setStatusInfo({
                                  vendorId: vendor.userId as string,
                                  vendorName: vendor.businessDetails
                                    ?.businessName as string,
                                  status: "UNBLOCKED",
                                })
                              }
                            >
                              Unblock
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeleteId(vendor.userId as string)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            {vendorsResult?.data?.length === 0 && (
              <TableRow>
                <TableCell
                  className="text-[#DC3173] text-lg text-center"
                  colSpan={5}
                >
                  No vendors found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </motion.div>

      {!!vendorsResult?.meta?.totalPage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 md:px-6"
        >
          <PaginationComponent
            totalPages={vendorsResult?.meta?.totalPage as number}
          />
        </motion.div>
      )}

      <DeleteModal
        open={!!deleteId}
        onOpenChange={closeDeleteModal}
        onConfirm={deleteVendor}
      />

      <ApproveOrRejectModal
        open={statusInfo?.vendorId?.length > 0}
        onOpenChange={() =>
          setStatusInfo({ vendorId: "", status: "", vendorName: "" })
        }
        status={
          statusInfo.status as "APPROVED" | "REJECTED" | "BLOCKED" | "UNBLOCKED"
        }
        userId={statusInfo.vendorId}
        userName={statusInfo.vendorName}
      />
    </>
  );
}
