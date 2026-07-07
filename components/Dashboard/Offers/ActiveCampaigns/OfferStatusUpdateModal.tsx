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
import { useTranslation } from "@/hooks/use-translation";
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
  buttonDisabled: boolean;
}

const OfferStatusUpdateModal = ({
  open,
  onOpenChange,
  onConfirm,
  statusInfo,
  buttonDisabled
}: IProps) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <form>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {statusInfo.status ? t("activating") : t("deactivating")} {t("offer")}:{" "}
              {statusInfo.offerName}
            </DialogTitle>
            <DialogDescription>
              {t("you_are_about_to")} {statusInfo.status ? t("activate") : t("deactivate")}{" "}
              {t("this_offer")}
            </DialogDescription>
          </DialogHeader>{" "}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {t("cancel")}
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
              disabled={buttonDisabled}
            >
              {statusInfo.status ? t("activate") : t("deactivate")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
};

export default OfferStatusUpdateModal;
