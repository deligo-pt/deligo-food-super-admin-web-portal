import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation } from "@/hooks/use-translation";

interface IProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    isSubmitting: boolean;
    title?: string;
    description?: string;
}

const RefundModal = ({ open, onOpenChange, onConfirm, isSubmitting }: IProps) => {
    const { t } = useTranslation();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <form>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("are_you_absolutely_sure")}</DialogTitle>
                        {/* <DialogDescription>
                            {t("this_action_cannot_be_undone")}
                        </DialogDescription> */}
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" disabled={isSubmitting} variant="outline">
                                {t("cancel")}
                            </Button>
                        </DialogClose>
                        <Button variant="outline" disabled={isSubmitting} onClick={onConfirm} type="submit">
                            {t("refund")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    );
};

export default RefundModal;
