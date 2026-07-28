"use client";


import AllFilters from "@/components/Filtering/AllFilters";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
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
import {
  deleteProductCategoryReq,
  updateProductCategoryReq,
} from "@/services/dashboard/category/product-category.service";
import { useStore } from "@/store/store";
import { TMeta } from "@/types";
import { TProductCategoryResponse } from "@/types/category.type";
import { getSortOptions, SortOptionKey } from "@/utils/sortOptions";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { getProductCategoryColumns } from "./productCategoryColumns";
import ReusableTable from "../common/ReusableTable";

interface IProps {
  categoriesResult: {
    data: TProductCategoryResponse[];
    meta?: TMeta;
  };
}

const sortFields = ["newest", "oldest", "nameAZ", "nameZA"] as SortOptionKey[];

export default function CategoryTable({ categoriesResult }: IProps) {
  const { t } = useTranslation();
  const { lang } = useStore();
  const sortOptions = getSortOptions(t, sortFields);
  const router = useRouter();

  const [statusInfo, setStatusInfo] = useState<{
    categoryId: string;
    isActive?: boolean;
    isDeleted?: boolean;
    field: "isActive" | "isDeleted" | "";
  }>({
    categoryId: "",
    isActive: true,
    isDeleted: false,
    field: "",
  });
  const [buttonDisabled, setButtonDisabled] = useState(0);

  const updateActiveStatus = async () => {
    const toastId = toast.loading("Updating active status...");
    setButtonDisabled(2);

    const result = await updateProductCategoryReq(statusInfo.categoryId, {
      isActive: statusInfo.isActive,
    });

    if (result?.success) {
      toast.success(result.message || "Active Status updated successfully!", {
        id: toastId,
      });
      router.refresh();
      setStatusInfo((prev) => ({ ...prev, categoryId: "", field: "" }));
      return;
    }

    toast.error(result.message || "Active Status update failed", { id: toastId });
    setButtonDisabled(0);
  };

  const softDeleteCategory = async () => {
    const toastId = toast.loading("Deleting category...");
    setButtonDisabled(1);

    const result = await deleteProductCategoryReq(statusInfo.categoryId);

    if (result?.success) {
      toast.success("Category deleted successfully!", { id: toastId });
      router.refresh();
      setStatusInfo((prev) => ({ ...prev, categoryId: "", field: "" }));
      return;
    }

    toast.error(result?.message || "Category delete failed", { id: toastId });
    setButtonDisabled(0);
  };

  const columns = getProductCategoryColumns({
    t,
    lang,
    router,
    setStatusInfo,
  });

  return (
    <>
      <AllFilters sortOptions={sortOptions} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-md rounded-2xl p-4 md:p-6 mb-2 overflow-x-auto"
      >
        <ReusableTable
          data={categoriesResult?.data || []}
          columns={columns}
          getRowKey={(row) => row._id}
          emptyMessage={t("no_categories_found")}
        />
      </motion.div>

      {!!categoriesResult?.meta?.total && categoriesResult.meta.total > 0 && (
        <div className="px-6 mt-4">
          <PaginationComponent
            totalPages={categoriesResult?.meta?.totalPage || 0}
          />
        </div>
      )}

      <Dialog
        open={statusInfo?.categoryId?.length > 0}
        onOpenChange={() =>
          setStatusInfo((prev) => ({ ...prev, categoryId: "", field: "" }))
        }
      >
        <form>
          <DialogContent className="sm:max-w-106.25">
            <DialogHeader>
              <DialogTitle>
                {statusInfo.field === "isDeleted"
                  ? t("delete")
                  : !statusInfo.isActive
                    ? t("deactivate")
                    : t("activate")}{" "}
                {t("category_lg")}
              </DialogTitle>
              <DialogDescription>
                {t("are_you_sure_want_to")}{" "}
                {statusInfo.field === "isDeleted"
                  ? "delete"
                  : !statusInfo.isActive
                    ? "deactivate"
                    : "activate"}{" "}
                {t("this_category")}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">{t("cancel")}</Button>
              </DialogClose>

              {statusInfo.field === "isDeleted" ? (
                <Button
                  variant="destructive"
                  disabled={buttonDisabled === 1}
                  onClick={softDeleteCategory}
                >
                  {t("delete")}
                </Button>
              ) : !statusInfo.isActive ? (
                <Button
                  onClick={updateActiveStatus}
                  disabled={buttonDisabled === 2}
                  className="bg-yellow-600 hover:bg-yellow-500"
                >
                  {t("deactivate")}
                </Button>
              ) : (
                <Button
                  onClick={updateActiveStatus}
                  disabled={buttonDisabled === 2}
                  className="bg-[#DC3173] hover:bg-[#DC3173]/90"
                >
                  {t("activate")}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </form>
      </Dialog>
    </>
  );
}