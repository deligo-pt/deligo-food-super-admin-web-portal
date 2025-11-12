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
import { TAgent, TUserQueryParams } from "@/types/user.type";
import { getCookie } from "@/utils/cookies";
import { fetchData, updateData } from "@/utils/requests";
import { motion } from "framer-motion";
import { MoreVertical } from "lucide-react";
import { useEffect, useState } from "react";

export default function AgentTable() {
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

  console.log(agentsResult);

  const fetchAgents = async () => {
    setIsLoading(true);
    try {
      const data = (await fetchData("/fleet-managers", {
        params: queryParams,
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

  useEffect(() => {
    if (queryParams) {
      fetchAgents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell>Loading...</TableCell>
              </TableRow>
            )}
            {!isLoading ? (
              agentsResult &&
              agentsResult?.data?.length > 0 &&
              agentsResult?.data?.map((agent) => (
                <TableRow key={agent._id}>
                  <TableCell>
                    {agent.name?.firstName} {agent.name?.lastName}
                  </TableCell>
                  <TableCell>{agent.status}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <MoreVertical className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          className="text-green-600"
                          onClick={() =>
                            setStatusInfo({
                              agentId: agent.userId as string,
                              status: "APPROVED",
                              remarks: "",
                            })
                          }
                        >
                          {agent.status === "APPROVED" ? "Approved" : "Approve"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() =>
                            setStatusInfo({
                              agentId: agent.userId as string,
                              status: "REJECTED",
                              remarks: "",
                            })
                          }
                        >
                          {agent.status === "REJECTED" ? "Rejected" : "Reject"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell className="text-center text-[#DC3173]">
                  No agents found
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
      {
        <Dialog
          open={!!statusInfo.agentId}
          onOpenChange={() =>
            setStatusInfo({ agentId: "", status: "", remarks: "" })
          }
        >
          <form>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {statusInfo.status === "APPROVED" ? "Approve" : "Reject"}{" "}
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
