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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";
import {
  deleteBusinessCategoryReq,
  updateBusinessCategoryReq,
} from "@/services/dashboard/category/business-category";
import { TMeta } from "@/types";
import { TBusinessCategory } from "@/types/category.type";
import { getSortOptions } from "@/utils/sortOptions";
import { motion } from "framer-motion";
import {
  CircleCheckBig,
  Cog,
  InfoIcon,
  ListIcon,
  MoreVertical,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface IProps {
  categoriesResult: {
    data: TBusinessCategory[];
    meta?: TMeta;
    isLoading: boolean;
  };
}

export default function CategoryTable({ categoriesResult }: IProps) {
  const { t } = useTranslation();
  const sortOptions = getSortOptions(t);
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

  const updateActiveStatus = async () => {
    const toastId = toast.loading("Updating active status...");

    const result = await updateBusinessCategoryReq(statusInfo.categoryId, {
      isActive: statusInfo.isActive,
    });

    if (result?.success) {
      toast.success(result.message || "Active Status updated successfully!", {
        id: toastId,
      });
      router.refresh();
      setStatusInfo((prevStatusInfo) => ({
        ...prevStatusInfo,
        categoryId: "",
        field: "",
      }));
      return;
    }

    toast.error(result.message || "Active Status update failed", {
      id: toastId,
    });
    console.log(result);
  };

  const softDeleteCategory = async () => {
    const toastId = toast.loading("Deleting category...");

    const result = await deleteBusinessCategoryReq(statusInfo.categoryId);

    if (result?.success) {
      toast.success(result.message || "Category deleted successfully!", {
        id: toastId,
      });
      setStatusInfo((prevStatusInfo) => ({
        ...prevStatusInfo,
        categoryId: "",
        field: "",
      }));
      router.refresh();
      return;
    }

    toast.error(result?.message || "Category delete failed", {
      id: toastId,
    });
    console.log(result);
  };

  return (
    <>
      <AllFilters sortOptions={sortOptions} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-md rounded-2xl p-4 md:p-6 mb-2 overflow-x-auto"
      >
        <Table className="max-w-full">
          <TableHeader>
            <TableRow>
              <TableHead>
                <div className="text-[#DC3173] flex gap-2 items-center">
                  <ListIcon className="w-4" />
                  {t("name")}
                </div>
              </TableHead>
              <TableHead>
                <div className="text-[#DC3173] flex gap-2 items-center">
                  <InfoIcon className="w-4" />
                  {t("description")}
                </div>
              </TableHead>
              <TableHead>
                <div className="text-[#DC3173] flex gap-2 items-center">
                  <CircleCheckBig className="w-4" />
                  {t("status")}
                </div>
              </TableHead>
              <TableHead className="text-right text-[#DC3173] flex gap-2 items-center justify-end">
                <Cog className="w-4" />
                {t("actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categoriesResult.isLoading && (
              <TableRow>
                <TableCell
                  className="text-center text-lg text-[#DC3173]"
                  colSpan={5}
                >
                  {t("loading")}
                </TableCell>
              </TableRow>
            )}
            {!categoriesResult.isLoading &&
              categoriesResult?.data?.map((category) => (
                <TableRow key={category._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {category.icon && (
                        <div>
                          <Image
                            className="w-8 h-8 rounded-full object-cover"
                            src={category.icon}
                            alt={category.name}
                            width={32}
                            height={32}
                          />
                        </div>
                      )}
                      <p>{category.name}</p>
                    </div>
                  </TableCell>
                  <TableCell>{category.description}</TableCell>
                  <TableCell
                    className={cn(
                      category.isDeleted
                        ? "text-red-500"
                        : category.isActive
                          ? "text-green-500"
                          : "text-yellow-500",
                    )}
                  >
                    {category.isDeleted
                      ? t("deleted")
                      : category.isActive
                        ? t("active")
                        : t("inactive")}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <MoreVertical className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          className=""
                          onClick={() =>
                            router.push(
                              "/admin/business-categories/" + category._id,
                            )
                          }
                        >
                          {t("view")}
                        </DropdownMenuItem>
                        {category.isDeleted ? (
                          <DropdownMenuItem className="text-red-500">
                            {t("deleted")}
                          </DropdownMenuItem>
                        ) : (
                          <>
                            {!category.isDeleted && (
                              <DropdownMenuItem
                                onClick={() =>
                                  setStatusInfo({
                                    categoryId: category._id as string,
                                    isDeleted: true,
                                    field: "isDeleted",
                                  })
                                }
                              >
                                {t("delete")}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() =>
                                setStatusInfo({
                                  categoryId: category._id as string,
                                  isActive: !category.isActive,
                                  field: "isActive",
                                })
                              }
                            >
                              {category.isActive ? t("deactivate") : t("activate")}
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            {!categoriesResult.isLoading &&
              categoriesResult?.meta?.total === 0 && (
                <TableRow>
                  <TableCell
                    className="text-center text-lg text-[#DC3173]"
                    colSpan={5}
                  >
                    {t("no_categories_found")}
                  </TableCell>
                </TableRow>
              )}
          </TableBody>
        </Table>
      </motion.div>

      {!!categoriesResult?.meta?.total && categoriesResult?.meta?.total > 0 && (
        <div className="px-6 mt-4">
          <PaginationComponent
            totalPages={categoriesResult?.meta?.totalPage || 0}
          />
        </div>
      )}

      <Dialog
        open={statusInfo?.categoryId?.length > 0}
        onOpenChange={() =>
          setStatusInfo((prevStatusInfo) => ({
            ...prevStatusInfo,
            categoryId: "",
            field: "",
          }))
        }
      >
        <form>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {statusInfo.field === "isDeleted"
                  ? t("delete")
                  : !statusInfo.isActive
                    ? t("deactivate")
                    : t("activate")}{" "}
                {t("category")}
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
                <Button variant="destructive" onClick={softDeleteCategory}>
                  {t("delete")}
                </Button>
              ) : !statusInfo.isActive ? (
                <Button
                  onClick={updateActiveStatus}
                  className="bg-yellow-600 hover:bg-yellow-500"
                >
                  {t("deactivate")}
                </Button>
              ) : (
                <Button
                  onClick={updateActiveStatus}
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
