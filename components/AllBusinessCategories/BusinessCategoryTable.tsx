"use client";

import AllFilters from "@/components/Filtering/AllFilters";
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
import {
  deleteBusinessCategoryReq,
  updateBusinessCategoryReq,
} from "@/services/dashboard/category/business-category";
import { TMeta } from "@/types";
import { TBusinessCategory } from "@/types/category.type";
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
import PaginationComponent from "../Filtering/PaginationComponent";

interface IProps {
  categoriesResult: {
    data: TBusinessCategory[];
    meta?: TMeta;
    isLoading: boolean;
  };
}

const sortOptions = [
  { label: "Newest First", value: "-createdAt" },
  { label: "Oldest First", value: "createdAt" },
  { label: "Name (A-Z)", value: "name.firstName" },
  { label: "Name (Z-A)", value: "-name.lastName" },
];

export default function CategoryTable({ categoriesResult }: IProps) {
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
                  Name
                </div>
              </TableHead>
              <TableHead>
                <div className="text-[#DC3173] flex gap-2 items-center">
                  <InfoIcon className="w-4" />
                  Description
                </div>
              </TableHead>
              <TableHead>
                <div className="text-[#DC3173] flex gap-2 items-center">
                  <CircleCheckBig className="w-4" />
                  Status
                </div>
              </TableHead>
              <TableHead className="text-right text-[#DC3173] flex gap-2 items-center justify-end">
                <Cog className="w-4" />
                Actions
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
                  Loading...
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
                  <TableCell>
                    {category.isActive && !category.isDeleted
                      ? "Active"
                      : "Inactive"}
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
                              "/admin/business-categories/" + category._id
                            )
                          }
                        >
                          View
                        </DropdownMenuItem>
                        {category.isDeleted ? (
                          <DropdownMenuItem className="text-red-500">
                            Deleted
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
                                Delete
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
                              {category.isActive ? "Inactive" : "Active"}
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
                    No categorys found
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
                  ? "Delete"
                  : !statusInfo.isActive
                  ? "Inactive"
                  : "Active"}{" "}
                category
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to{" "}
                {statusInfo.field === "isDeleted"
                  ? "selete"
                  : !statusInfo.isActive
                  ? "inactive"
                  : "active"}{" "}
                this category?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>

              {statusInfo.field === "isDeleted" ? (
                <Button variant="destructive" onClick={softDeleteCategory}>
                  Delete
                </Button>
              ) : !statusInfo.isActive ? (
                <Button
                  onClick={updateActiveStatus}
                  className="bg-yellow-600 hover:bg-yellow-500"
                >
                  Inactive
                </Button>
              ) : (
                <Button
                  onClick={updateActiveStatus}
                  className="bg-[#DC3173] hover:bg-[#DC3173]/90"
                >
                  Active
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </form>
      </Dialog>
    </>
  );
}
