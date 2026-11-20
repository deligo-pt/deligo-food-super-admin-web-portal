"use client";

/**
 * "Delete selected" in the vendor's Manage Products select mode (PRODUCT_BULK_AND_IMPORT_FRONTEND_GUIDE §4).
 *
 * Confirm → delete in batches of 100 (the API's limit), one after the other,
 * with progress → close on full success, or list what was not deleted and why.
 * Products in an active order can't be deleted; they stay selected so the
 * admin can try again later. A 429 stops the run and says how long to wait.
 */

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
import { adminBulkDeleteProductsReq } from "@/services/dashboard/product/product-bulk.service";
import type { TBulkDeleteFailedItem } from "@/types/product-bulk.type";
import {
  BULK_DELETE_DONE_CODES,
  bulkErrorText,
  bulkRequestErrorText,
  countText,
  fillVars,
} from "@/utils/bulkErrors";
import { AlertTriangle, LoaderCircle, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const BATCH_SIZE = 100;

type TPhase =
  | { step: "confirm" }
  | { step: "running"; done: number; total: number }
  | {
      step: "result";
      deleted: number;
      total: number;
      failed: TBulkDeleteFailedItem[];
      /** Why the run stopped early (429, network…), if it did. */
      stopped: string | null;
    };

interface IProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** How many products are selected (shown before the codes are read). */
  count: number;
  /** The `PROD-` codes to delete; `null` when they couldn't be read. */
  resolveIds: () => Promise<string[] | null>;
  /** Product name for a code, for the "not deleted" list. */
  nameFor: (code: string) => string | undefined;
  /** After a run: what was deleted, and what failed (it stays selected). */
  onFinished: (result: { deleted: string[]; failed: string[] }) => void;
  t: (key: string) => string;
}

const BulkDeleteDialog = ({ open, onOpenChange, count, resolveIds, nameFor, onFinished, t }: IProps) => {
  const [phase, setPhase] = useState<TPhase>({ step: "confirm" });
  const running = phase.step === "running";

  const close = (next: boolean) => {
    if (running) return; // a run can't be abandoned halfway
    onOpenChange(next);
    if (!next) setPhase({ step: "confirm" });
  };

  const run = async () => {
    setPhase({ step: "running", done: 0, total: count });
    const ids = await resolveIds();
    if (!ids) {
      setPhase({ step: "confirm" });
      toast.error(t("bulk_delete_read_failed"));
      return;
    }

    const deleted: string[] = [];
    const failed: TBulkDeleteFailedItem[] = [];
    let stopped: string | null = null;
    setPhase({ step: "running", done: 0, total: ids.length });

    for (let start = 0; start < ids.length; start += BATCH_SIZE) {
      const batch = ids.slice(start, start + BATCH_SIZE);
      const res = await adminBulkDeleteProductsReq(batch);

      if (!res.data) {
        // The whole request was refused: nothing in this batch or later ones ran.
        stopped = bulkRequestErrorText(t, res);
        break;
      }
      deleted.push(...res.data.deleted);
      for (const item of res.data.failed) {
        // Already deleted is what the admin wanted.
        if (BULK_DELETE_DONE_CODES.has(item.code)) deleted.push(item.productId);
        else failed.push(item);
      }
      setPhase({ step: "running", done: Math.min(start + batch.length, ids.length), total: ids.length });
    }

    onFinished({ deleted, failed: failed.map((f) => f.productId) });

    if (!failed.length && !stopped) {
      toast.success(countText(t, "bulk_delete_done", deleted.length));
      onOpenChange(false);
      setPhase({ step: "confirm" });
      return;
    }
    setPhase({ step: "result", deleted: deleted.length, total: ids.length, failed, stopped });
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent
        className="sm:max-w-lg"
        showCloseButton={!running}
        onInteractOutside={(e) => running && e.preventDefault()}
        onEscapeKeyDown={(e) => running && e.preventDefault()}
      >
        {phase.step === "confirm" && (
          <>
            <DialogHeader>
              <DialogTitle>{countText(t, "bulk_delete_title", count)}</DialogTitle>
              <DialogDescription>{t("bulk_delete_description")}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  {t("cancel")}
                </Button>
              </DialogClose>
              <Button type="button" variant="destructive" onClick={run}>
                <Trash2 className="h-4 w-4" />
                {t("bulk_delete_confirm")}
              </Button>
            </DialogFooter>
          </>
        )}

        {phase.step === "running" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <LoaderCircle className="h-5 w-5 animate-spin text-[#DC3173]" aria-hidden />
                {t("bulk_delete_running_title")}
              </DialogTitle>
              <DialogDescription>
                {fillVars(t("bulk_delete_progress"), { done: phase.done, total: phase.total })}
              </DialogDescription>
            </DialogHeader>
            <div
              className="h-2 w-full overflow-hidden rounded-full bg-gray-100"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={phase.total}
              aria-valuenow={phase.done}
            >
              <div
                className="h-full rounded-full bg-[#DC3173] transition-all"
                style={{ width: `${phase.total ? Math.round((phase.done / phase.total) * 100) : 0}%` }}
              />
            </div>
          </>
        )}

        {phase.step === "result" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" aria-hidden />
                {fillVars(t("bulk_delete_partial_title"), {
                  deleted: phase.deleted,
                  failed: phase.total - phase.deleted,
                })}
              </DialogTitle>
              <DialogDescription>
                {phase.stopped ?? t("bulk_delete_failed_hint")}
              </DialogDescription>
            </DialogHeader>

            {phase.failed.length > 0 && (
              <ul className="max-h-64 space-y-2 overflow-y-auto pr-1">
                {phase.failed.map((item) => (
                  <li
                    key={item.productId}
                    className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
                  >
                    <p className="font-medium text-gray-800">
                      {nameFor(item.productId) ?? item.productId}
                    </p>
                    <p className="text-red-600">{bulkErrorText(t, item.code, item.message)}</p>
                  </li>
                ))}
              </ul>
            )}

            {phase.stopped && phase.failed.length > 0 && (
              <p className="text-sm text-gray-500">{t("bulk_delete_failed_hint")}</p>
            )}

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" className="bg-[#DC3173] text-white hover:bg-[#c71d62]">
                  {t("bulk_close")}
                </Button>
              </DialogClose>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BulkDeleteDialog;
