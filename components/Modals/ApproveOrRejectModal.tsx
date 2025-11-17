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
import { TResponse } from "@/types";
import { getCookie } from "@/utils/cookies";
import { updateData } from "@/utils/requests";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface IProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  status: "APPROVED" | "REJECTED";
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
      status === "APPROVED" ? "Approving..." : "Rejecting..."
    );
    try {
      const updateStatus = {
        status,
        remarks,
      };
      const result = (await updateData(
        `/auth/${userId}/approved-rejected-user`,
        updateStatus,
        {
          headers: { authorization: getCookie("accessToken") },
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      )) as unknown as TResponse<any>;
      if (result?.success) {
        setRemarks("");
        onOpenChange(false);
        toast.success(
          status === "APPROVED"
            ? "Approved successfully!"
            : "Rejected successfully!",
          { id: toastId }
        );
        router.refresh();
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.log(error);
      toast.error(
        error?.response?.data?.message ||
          (status === "APPROVED" ? "Approving failed" : "Rejecting failed"),
        { id: toastId }
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <form>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {status === "APPROVED" ? "Approve" : "Reject"} {userName}
            </DialogTitle>
            <DialogDescription>
              Let them know why you are{" "}
              {status === "APPROVED" ? "approving" : "rejecting"}
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
            {status === "APPROVED" ? (
              <Button
                form="remarksForm"
                type="submit"
                className="bg-green-600 hover:bg-green-500"
              >
                Approve
              </Button>
            ) : (
              <Button form="remarksForm" type="submit" variant="destructive">
                Reject
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
