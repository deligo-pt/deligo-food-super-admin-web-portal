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
import { TUserQueryParams, TVendor } from "@/types/user.type";
import { getCookie } from "@/utils/cookies";
import { fetchData, updateData } from "@/utils/requests";
import { motion } from "framer-motion";
import { MoreVertical } from "lucide-react";
import { useEffect, useState } from "react";

export default function VendorTable() {
  const [vendorsResult, setVendorsResult] = useState<TResponse<
    TVendor[]
  > | null>(null);
  const [statusInfo, setStatusInfo] = useState({
    vendorId: "",
    status: "",
    remarks: "",
  });
  const [queryParams, setQueryParams] = useState<TUserQueryParams>({
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
        `/auth/${statusInfo.vendorId}/approved-rejected-user`,
        updateStatus,
        {
          headers: { authorization: getCookie("accessToken") },
        }
      )) as unknown as TResponse<TVendor[]>;
      if (result?.success) {
        // fetchVendors();
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
  console.log("Fetching");

  useEffect(() => {
    let ignore = false;
    console.log("Fetching vendors for params:", queryParams);

    const fetchVendors = async () => {
      setIsLoading(true);
      try {
        const data = (await fetchData("/vendors", {
          params: queryParams,
          headers: { authorization: getCookie("accessToken") },
        })) as unknown as TResponse<TVendor[]>;

        if (!ignore && data?.success) {
          setVendorsResult(data);
        }
      } catch (error) {
        console.log(error);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    fetchVendors();

    return () => {
      ignore = true;
    };
  }, [queryParams]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-md rounded-2xl p-4 md:p-6 mb-2"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-[#DC3173]">Name</TableHead>
              <TableHead className="text-[#DC3173]">Email</TableHead>
              <TableHead className="text-[#DC3173]">Phone</TableHead>
              {/* <TableHead className="text-[#DC3173]">Business Name</TableHead>
              <TableHead className="text-[#DC3173]">Business License</TableHead>
              <TableHead className="text-[#DC3173]">Business Address</TableHead> */}
              <TableHead className="text-[#DC3173]">Status</TableHead>
              <TableHead className="text-right text-[#DC3173]">
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
              vendorsResult &&
              vendorsResult?.data?.length > 0 &&
              vendorsResult?.data?.map((vendor) => (
                <TableRow key={vendor._id}>
                  <TableCell>
                    {vendor.name?.firstName} {vendor.name?.lastName}
                  </TableCell>
                  <TableCell>{vendor.email}</TableCell>
                  <TableCell>{vendor.contactNumber}</TableCell>
                  {/* <TableCell>{vendor.companyDetails?.companyName}</TableCell>
                  <TableCell>
                    {vendor.companyDetails?.companyLicenseNumber}
                  </TableCell>
                  <TableCell>
                    {vendor?.companyLocation?.streetAddress},{" "}
                    {vendor?.companyLocation?.streetNumber},{" "}
                    {vendor?.companyLocation?.city},{" "}
                    {vendor?.companyLocation?.postalCode}
                  </TableCell> */}
                  <TableCell>{vendor.status}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <MoreVertical className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
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
                          {vendor.status === "APPROVED"
                            ? "Approved"
                            : "Approve"}
                        </DropdownMenuItem>
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
                          {vendor.status === "REJECTED" ? "Rejected" : "Reject"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            {!isLoading && vendorsResult?.data?.length === 0 && (
              <TableRow>
                <TableCell>No vendors found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </motion.div>
      {vendorsResult?.meta?.page && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 md:px-6"
        >
          <PaginationCard
            currentPage={vendorsResult?.meta?.page as number}
            totalPages={vendorsResult?.meta?.totalPage as number}
            paginationItemsToDisplay={vendorsResult?.meta?.limit}
            setQueryParams={setQueryParams}
          />
        </motion.div>
      )}
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
