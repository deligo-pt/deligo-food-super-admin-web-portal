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

interface IProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

const DeleteModal = ({
  open,
  onOpenChange,
  onConfirm,
  isDeleting,
  title,
  description,
  confirmText,
  variant = "destructive",
}: IProps) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title ? title : t("are_you_absolutely_sure")}</DialogTitle>
          <DialogDescription>
            {description ? description : t("this_action_cannot_be_undone")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              {t("cancel")}
            </Button>
          </DialogClose>
          <Button
            variant={variant}
            disabled={isDeleting}
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            type="button"
          >
            {confirmText || t("delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteModal;