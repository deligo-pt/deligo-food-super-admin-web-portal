
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { TProduct } from "@/types/product.type";
import { EditProductForm } from "./EditProductForm";


interface IProps {
    open: boolean;
    onOpenChange: () => void;
    prevData: TProduct;
    businessTypeSlug: string;
}

const EditProductDialog = ({
    open,
    onOpenChange,
    prevData,
    businessTypeSlug,
}: IProps) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <form>
                <DialogContent className="w-full! sm:max-w-6xl overflow-y-auto h-11/12! max-h-11/12 p-0!">
                    <DialogTitle className="hidden">Edit Product</DialogTitle>

                    <EditProductForm
                        prevData={prevData}
                        closeModal={onOpenChange}
                        businessTypeSlug={businessTypeSlug}
                    />
                </DialogContent>
            </form>
        </Dialog>
    );
};

export default EditProductDialog;
