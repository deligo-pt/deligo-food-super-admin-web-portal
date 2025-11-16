"use client";

import PaginationCard from "@/components/PaginationCard/PaginationCard";
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
import { TResponse } from "@/types";
import {
  TDeliveryPartner,
  TDeliveryPartnersQueryParams,
} from "@/types/delivery-partner.type";
import { getCookie } from "@/utils/cookies";
import { fetchData, updateData } from "@/utils/requests";
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
import { useEffect, useState } from "react";

export default function DeliveryPartnerTable() {
  const router = useRouter();
  const [deliveryPartnersResult, setDeliveryPartnersResult] =
    useState<TResponse<TDeliveryPartner[]> | null>(null);
  const [statusInfo, setStatusInfo] = useState({
    deliveryPartnerId: "",
    status: "",
    remarks: "",
  });
  const [queryParams, setQueryParams] = useState<TDeliveryPartnersQueryParams>({
    limit: 10,
    page: 1,
  });
  const [isLoading, setIsLoading] = useState(false);

  const approveOrReject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const updateStatus = {
        status: statusInfo.status,
        remarks: statusInfo.remarks,
      };
      const result = (await updateData(
        `/auth/${statusInfo.deliveryPartnerId}/approved-rejected-user`,
        updateStatus,
        {
          headers: { authorization: getCookie("accessToken") },
        }
      )) as unknown as TResponse<TDeliveryPartner[]>;
      if (result?.success) {
        // fetchDeliveryPartners();
        setStatusInfo({
          deliveryPartnerId: "",
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

  const fetchDeliveryPartners = async (
    queries: TDeliveryPartnersQueryParams = queryParams
  ) => {
    let params: Partial<TDeliveryPartnersQueryParams> = {};

    if (queries) {
      queries = Object.fromEntries(
        Object.entries(queries).filter((q) => !!q?.[1])
      );
    } else {
      params = Object.fromEntries(
        Object.entries(queryParams).filter((q) => !!q?.[1])
      );
    }

    setIsLoading(true);

    try {
      const data = (await fetchData("/delivery-partners", {
        params: params || queryParams,
        headers: { authorization: getCookie("accessToken") },
      })) as unknown as TResponse<TDeliveryPartner[]>;

      if (data?.success) {
        setDeliveryPartnersResult(data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    (() => fetchDeliveryPartners())();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
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
                <TableCell>Loading...</TableCell>
              </TableRow>
            )}
            {!isLoading &&
              deliveryPartnersResult &&
              deliveryPartnersResult?.data?.length > 0 &&
              deliveryPartnersResult?.data?.map((deliveryPartner) => (
                <TableRow key={deliveryPartner?._id}>
                  <TableCell>
                    {deliveryPartner?.personalInfo?.Name?.firstName}{" "}
                    {deliveryPartner?.personalInfo?.Name?.lastName}
                  </TableCell>
                  <TableCell>{deliveryPartner?.email}</TableCell>
                  <TableCell>
                    {deliveryPartner?.personalInfo?.contactNumber}
                  </TableCell>
                  <TableCell>{deliveryPartner?.status}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <MoreVertical className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          className=""
                          onClick={() =>
                            router.push(
                              "/admin/all-delivery-partners/" +
                                deliveryPartner?.userId
                            )
                          }
                        >
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className=""
                          onClick={() =>
                            setStatusInfo({
                              deliveryPartnerId:
                                deliveryPartner?.userId as string,
                              status: "APPROVED",
                              remarks: "",
                            })
                          }
                        >
                          {deliveryPartner?.status === "APPROVED"
                            ? "Approved"
                            : "Approve"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className=""
                          onClick={() =>
                            setStatusInfo({
                              deliveryPartnerId:
                                deliveryPartner?.userId as string,
                              status: "REJECTED",
                              remarks: "",
                            })
                          }
                        >
                          {deliveryPartner?.status === "REJECTED"
                            ? "Rejected"
                            : "Reject"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            {!isLoading && deliveryPartnersResult?.data?.length === 0 && (
              <TableRow>
                <TableCell>No deliveryPartners found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </motion.div>
      {deliveryPartnersResult?.meta?.page && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 md:px-6"
        >
          <PaginationCard
            currentPage={deliveryPartnersResult?.meta?.page as number}
            totalPages={deliveryPartnersResult?.meta?.totalPage as number}
            paginationItemsToDisplay={deliveryPartnersResult?.meta?.limit}
            setQueryParams={setQueryParams}
          />
        </motion.div>
      )}
      {
        <Dialog
          open={statusInfo?.deliveryPartnerId?.length > 0}
          onOpenChange={() =>
            setStatusInfo({ deliveryPartnerId: "", status: "", remarks: "" })
          }
        >
          <form>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {statusInfo.status === "APPROVED" ? "Approve" : "Reject"}{" "}
                  {statusInfo?.deliveryPartnerId}
                  DeliveryPartner
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
