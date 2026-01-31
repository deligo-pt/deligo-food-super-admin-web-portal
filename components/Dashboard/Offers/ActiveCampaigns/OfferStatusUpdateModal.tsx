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
import { cn } from "@/lib/utils";

interface IProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  statusInfo: {
    offerId: string;
    offerName: string;
    status: boolean;
  };
}

const OfferStatusUpdateModal = ({
  open,
  onOpenChange,
  onConfirm,
  statusInfo,
}: IProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <form>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {statusInfo.status ? "Activating" : "Deactivating"} Offer:{" "}
              {statusInfo.offerName}
            </DialogTitle>
            <DialogDescription>
              You are about to {statusInfo.status ? "activate" : "deactivate"}{" "}
              this offer
            </DialogDescription>
          </DialogHeader>{" "}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              className={cn(
                "text-white",
                statusInfo.status
                  ? "bg-[#DC3173] hover:bg-[#DC3173]/90"
                  : "bg-yellow-500 hover:bg-yellow-500/90",
              )}
              onClick={onConfirm}
              type="submit"
            >
              {statusInfo.status ? "Activate" : "Deactivate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
};

export default OfferStatusUpdateModal;
