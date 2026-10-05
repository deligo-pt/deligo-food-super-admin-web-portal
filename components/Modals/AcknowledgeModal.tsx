"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/use-translation";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isSubmitting: boolean;
}

export default function AcknowledgeModal({
  open,
  onOpenChange,
  onConfirm,
  isSubmitting,
}: Props) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("acknowledge_exception") || "Acknowledge Exception"}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          {t("acknowledge_exception_desc") ||
            "Mark this RIDER_SOS as acknowledged. The rider can continue delivering."}
        </p>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            {t("cancel")}
          </Button>
          <Button onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting ? t("processing") : t("acknowledge")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}