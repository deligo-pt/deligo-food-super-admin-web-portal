"use client";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { approveOrRejectReq } from "@/services/auth/approveOrReject";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface IProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  status: "APPROVED" | "REJECTED" | "BLOCKED" | "UNBLOCKED";
  userName: string;
  userId: string;
}

export default function ApproveOrRejectModal({
  open,
  onOpenChange,
  status,
  userName,
  userId,
}: IProps) {
  const [remarks, setRemarks] = useState<string>("");
  const router = useRouter();

  const approveOrReject = async (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading(
      status === "APPROVED"
        ? "Approving..."
        : status === "REJECTED"
        ? "Rejecting..."
        : status === "BLOCKED"
        ? "Blocking..."
        : "Unblocking..."
    );

    const updateStatus = {
      status: status === "UNBLOCKED" ? "APPROVED" : status,
      remarks,
    };

    const result = await approveOrRejectReq(userId, updateStatus);

    if (result?.success) {
      setRemarks("");
      onOpenChange(false);
      toast.success(
        status === "APPROVED"
          ? "Approved successfully!"
          : status === "REJECTED"
          ? "Rejected successfully!"
          : status === "BLOCKED"
          ? "Blocked successfully!"
          : "Unblocked successfully!",
        { id: toastId }
      );
      router.refresh();
      return;
    }

    toast.error(
      result.message ||
        (status === "APPROVED"
          ? "Approving failed"
          : status === "REJECTED"
          ? "Rejecting failed"
          : status === "BLOCKED"
          ? "Blocking failed"
          : "Unblocking failed"),
      { id: toastId }
    );
    console.log(result);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <form>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {status === "APPROVED" && "Approve"}
              {status === "REJECTED" && "Reject"}
              {status === "BLOCKED" && "Block"}
              {status === "UNBLOCKED" && "Unblock"} {userName}
            </DialogTitle>
            <DialogDescription>
              Let them know why you are {status === "APPROVED" && "approving"}
              {status === "REJECTED" && "rejecting"}
              {status === "BLOCKED" && "blocking"}
              {status === "UNBLOCKED" && "unblocking"}
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
                onBlur={(e) => setRemarks(e.target.value)}
              />
            </div>
          </form>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            {status === "APPROVED" && (
              <Button
                form="remarksForm"
                type="submit"
                className="bg-green-600 hover:bg-green-500"
              >
                Approve
              </Button>
            )}
            {status === "REJECTED" && (
              <Button form="remarksForm" type="submit" variant="destructive">
                Reject
              </Button>
            )}
            {status === "BLOCKED" && (
              <Button
                form="remarksForm"
                type="submit"
                className="bg-yellow-500 hover:bg-yellow-600"
              >
                Block
              </Button>
            )}
            {status === "UNBLOCKED" && (
              <Button
                form="remarksForm"
                type="submit"
                className="bg-[#DC3173] hover:bg-[#DC3173]/90"
              >
                Unblock
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
