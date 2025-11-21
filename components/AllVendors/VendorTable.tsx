"use client";

import AllFilters from "@/components/Filtering/AllFilters";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import DeleteModal from "@/components/Modals/DeleteModal";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { deleteData, updateData } from "@/utils/requests";
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
    ],
  },
];

export default function VendorTable({ vendorsResult }: IProps) {
  const router = useRouter();
  const [statusInfo, setStatusInfo] = useState({
    vendorId: "",
    status: "",
    remarks: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [deleteId, setDeleteId] = useState("");

  const approveOrReject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const updateStatus = {
        status: statusInfo.status,
        remarks: statusInfo.remarks,
      };
      const result = (await updateData(
        `/auth/${statusInfo.vendorId}/approved-rejected-user`,
        updateStatus,
        {
          headers: { authorization: getCookie("accessToken") },
        }
      )) as unknown as TResponse<TVendor>;
      if (result?.success) {
        router.refresh();
        setStatusInfo({
          vendorId: "",
          status: "",
          remarks: "",
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

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
            {isLoading && (
              <TableRow>
                <TableCell
                  className="text-[#DC3173] text-lg text-center"
                  colSpan={5}
                >
                  Loading...
                </TableCell>
              </TableRow>
            )}
            {!isLoading &&
              vendorsResult &&
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
                              className=""
                              onClick={() =>
                                setStatusInfo({
                                  vendorId: vendor.userId as string,
                                  status: "APPROVED",
                                  remarks: "",
                                })
                              }
                            >
                              Approve
                            </DropdownMenuItem>
                          )}
                          {(vendor.status === "PENDING" ||
                            vendor.status === "SUBMITTED") && (
                            <DropdownMenuItem
                              className=""
                              onClick={() =>
                                setStatusInfo({
                                  vendorId: vendor.userId as string,
                                  status: "REJECTED",
                                  remarks: "",
                                })
                              }
                            >
                              Reject
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className=""
                            onClick={() =>
                              setStatusInfo({
                                vendorId: vendor.userId as string,
                                status: "REJECTED",
                                remarks: "",
                              })
                            }
                          >
                            Reject
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            {!isLoading && vendorsResult?.data?.length === 0 && (
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
      {
        <Dialog
          open={statusInfo?.vendorId?.length > 0}
          onOpenChange={() =>
            setStatusInfo({ vendorId: "", status: "", remarks: "" })
          }
        >
          <form>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {statusInfo.status === "APPROVED" ? "Approve" : "Reject"}{" "}
                  {statusInfo?.vendorId}
                  Vendor
                </DialogTitle>
                <DialogDescription>
                  Let them know why you are{" "}
                  {statusInfo.status === "APPROVED" ? "approving" : "rejecting"}
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={approveOrReject}
                id="remarksForm"
                className="grid gap-4"
              >
                <div className="grid gap-3">
                  <Label htmlFor="remarks">Remarks</Label>
                  <Input
                    id="remarks"
                    name="remarks"
                    onBlur={(e) =>
                      setStatusInfo({ ...statusInfo, remarks: e.target.value })
                    }
                  />
                </div>
              </form>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                {statusInfo.status === "APPROVED" ? (
                  <Button
                    form="remarksForm"
                    type="submit"
                    className="bg-green-600 hover:bg-green-500"
                  >
                    Approve
                  </Button>
                ) : (
                  <Button
                    form="remarksForm"
                    type="submit"
                    variant="destructive"
                  >
                    Reject
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </form>
        </Dialog>
      }
    </>
  );
}
