"use client";

import DeleteModal from "@/components/Modals/DeleteModal";
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
import { TAgent, TUserQueryParams } from "@/types/user.type";
import { getCookie } from "@/utils/cookies";
import { deleteData, fetchData, updateData } from "@/utils/requests";
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
import { toast } from "sonner";

export default function AgentTable() {
  const router = useRouter();
  const [agentsResult, setAgentsResult] = useState<TResponse<TAgent[]> | null>(
    null
  );
  const [statusInfo, setStatusInfo] = useState({
    agentId: "",
    status: "",
    remarks: "",
  });
  const [queryParams, setQueryParams] = useState<TUserQueryParams>({
    limit: 10,
    page: 1,
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
        `/auth/${statusInfo.agentId}/approved-rejected-user`,
        updateStatus,
        {
          headers: { authorization: getCookie("accessToken") },
        }
      )) as unknown as TResponse<TAgent[]>;
      if (result?.success) {
        fetchAgents();
        setStatusInfo({
          agentId: "",
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
    const toastId = toast.loading("Deleting vendor...");
    try {
      const result = (await deleteData(`/auth/soft-delete/${deleteId}`, {
        headers: { authorization: getCookie("accessToken") },
      })) as unknown as TResponse<null>;
      if (result?.success) {
        fetchAgents();
        setDeleteId("");
        toast.success("Vendor deleted successfully!", { id: toastId });
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Vendor delete failed", {
        id: toastId,
      });
    }
  };

  const fetchAgents = async (queries: TUserQueryParams = queryParams) => {
    let params: Partial<TUserQueryParams> = {};

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
      const data = (await fetchData("/fleet-managers", {
        params: params || queryParams,
        headers: { authorization: getCookie("accessToken") },
      })) as unknown as TResponse<TAgent[]>;

      if (data?.success) {
        setAgentsResult(data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    (() => fetchAgents())();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-md rounded-2xl p-4 md:p-6 mb-2"
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
              agentsResult &&
              agentsResult?.data?.length > 0 &&
              agentsResult?.data?.map((agent) => (
                <TableRow key={agent._id}>
                  <TableCell>
                    {agent.name?.firstName} {agent.name?.lastName}
                  </TableCell>
                  <TableCell>{agent.email}</TableCell>
                  <TableCell>{agent.contactNumber}</TableCell>
                  <TableCell>{agent.status}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <MoreVertical className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          className=""
                          onClick={() =>
                            router.push("/admin/agent/" + agent.userId)
                          }
                        >
                          View
                        </DropdownMenuItem>
                        {(agent.status === "PENDING" ||
                          agent.status === "SUBMITTED" ||
                          agent.status === "REJECTED") && (
                          <DropdownMenuItem
                            className=""
                            onClick={() =>
                              setStatusInfo({
                                agentId: agent.userId as string,
                                status: "APPROVED",
                                remarks: "",
                              })
                            }
                          >
                            Approve
                          </DropdownMenuItem>
                        )}
                        {(agent.status === "PENDING" ||
                          agent.status === "SUBMITTED" ||
                          agent.status === "APPROVED") && (
                          <DropdownMenuItem
                            className=""
                            onClick={() =>
                              setStatusInfo({
                                agentId: agent.userId as string,
                                status: "REJECTED",
                                remarks: "",
                              })
                            }
                          >
                            Reject
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            {!isLoading && agentsResult?.data?.length === 0 && (
              <TableRow>
                <TableCell
                  className="text-[#DC3173] text-lg text-center"
                  colSpan={5}
                >
                  No Fleet Manager found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </motion.div>
      {agentsResult?.meta?.page && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 md:px-6"
        >
          <PaginationCard
            currentPage={agentsResult?.meta?.page as number}
            totalPages={agentsResult?.meta?.totalPage as number}
            paginationItemsToDisplay={agentsResult?.meta?.limit}
            setQueryParams={setQueryParams}
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
          open={statusInfo?.agentId?.length > 0}
          onOpenChange={() =>
            setStatusInfo({ agentId: "", status: "", remarks: "" })
          }
        >
          <form>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {statusInfo.status === "APPROVED" ? "Approve" : "Reject"}{" "}
                  {statusInfo?.agentId}
                  Agent
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
