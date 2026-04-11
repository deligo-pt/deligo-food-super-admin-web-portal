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

interface IProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRemove: () => void;
}

export default function ClearSessionModal({
  open,
  onOpenChange,
  onRemove,
}: IProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <form>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Device Limit Exceeded</DialogTitle>
            <DialogDescription>
              You have reached your maximum device limit. Do you want to remove
              an existing session and log in here?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button onClick={onRemove} variant="destructive" type="submit">
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
