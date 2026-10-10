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
import { useTranslation } from "@/hooks/use-translation";
import {
  approveOrRejectReq,
  blockUnblockUser,
} from "@/services/auth/approve-or-reject.service";
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
  const { t } = useTranslation();
  const [remarks, setRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // unmount completely when closed / no data
  if (!open || !userId || !status) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    const isBlockAction = status === "BLOCKED" || status === "UNBLOCKED";

    const toastId = toast.loading(
      status === "APPROVED"
        ? "Approving..."
        : status === "REJECTED"
          ? "Rejecting..."
          : status === "BLOCKED"
            ? "Blocking..."
            : "Unblocking..."
    );

    try {
      let result;

      if (isBlockAction) {
        result = await blockUnblockUser(userId, {
          expectedAction: status === "BLOCKED" ? "BLOCK" : "UNBLOCK",
          remarks: remarks.trim() || undefined,
        });
      } else {
        result = await approveOrRejectReq(userId, {
          status,
          remarks,
        });
      }

      if (result?.success) {
        setRemarks("");
        toast.success(
          result.message ||
          (status === "APPROVED"
            ? "Approved successfully!"
            : status === "REJECTED"
              ? "Rejected successfully!"
              : status === "BLOCKED"
                ? "Blocked successfully!"
                : "Unblocked successfully!"),
          { id: toastId }
        );

        onOpenChange(false);
        router.refresh();
        return;
      }

      if (result?.data?.errorSources?.length) {
        result.data.errorSources.forEach(
          (err: { path: string; message: string }) =>
            toast.error(err.message, { id: toastId })
        );
      } else {
        toast.error(
          result?.message ||
          (status === "APPROVED"
            ? "Approving failed"
            : status === "REJECTED"
              ? "Rejecting failed"
              : status === "BLOCKED"
                ? "Blocking failed"
                : "Unblocking failed"),
          { id: toastId }
        );
      }
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={true}
      onOpenChange={(next) => {
        if (!next) onOpenChange(false);
      }}
    >
      <DialogContent className="sm:max-w-106.25">
        <form onSubmit={handleSubmit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>
              {status === "APPROVED" && t("approve")}
              {status === "REJECTED" && t("reject")}
              {status === "BLOCKED" && t("block")}
              {status === "UNBLOCKED" && t("unblock")}
              {userName ? ` - ${userName}` : ""}
            </DialogTitle>
            <DialogDescription>
              {status === "APPROVED"
                ? t("are_you_sure_want_approve")
                : `${t("let_them_know_why_you_are")} `}
              {status === "REJECTED" && t("rejecting")}
              {status === "BLOCKED" && t("blocking")}
              {status === "UNBLOCKED" && t("unblocking")}
            </DialogDescription>
          </DialogHeader>

          {status !== "APPROVED" && (
            <div className="grid gap-3">
              <Label htmlFor="remarks">{t("remarks")}</Label>
              <Input
                id="remarks"
                name="remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isSubmitting}>
                {t("cancel")}
              </Button>
            </DialogClose>

            {status === "APPROVED" && (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-500"
              >
                {t("approve")}
              </Button>
            )}
            {status === "REJECTED" && (
              <Button type="submit" disabled={isSubmitting} variant="destructive">
                {t("reject")}
              </Button>
            )}
            {status === "BLOCKED" && (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-yellow-500 hover:bg-yellow-600"
              >
                {t("block")}
              </Button>
            )}
            {status === "UNBLOCKED" && (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#DC3173] hover:bg-[#DC3173]/90"
              >
                {t("unblock")}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}