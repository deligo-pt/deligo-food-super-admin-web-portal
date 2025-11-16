"use client";

import PaginationCard from "@/components/PaginationCard/PaginationCard";
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
import { TMeta, TResponse } from "@/types";
import {
  TProductCategory,
  TProductCategoryQueryParams,
} from "@/types/category.type";
import { getCookie } from "@/utils/cookies";
import { deleteData, fetchData, updateData } from "@/utils/requests";
import { motion } from "framer-motion";
import {
  CircleCheckBig,
  Cog,
  FileCheckIcon,
  InfoIcon,
  ListIcon,
  MoreVertical,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function CategoryTable() {
  const router = useRouter();
  const [productCategoriesResult, setProductCategoriesResult] = useState<{
    data: TProductCategory[];
    meta: TMeta;
  } | null>(null);
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
  const [queryParams, setQueryParams] = useState<TProductCategoryQueryParams>({
    limit: 10,
    page: 1,
  });
  const [isLoading, setIsLoading] = useState(false);

  const updateActiveStatus = async () => {
    const toastId = toast.loading("Updating active status...");
    setIsLoading(true);
    try {
      const result = (await updateData(
        `/categories/productCategory/${statusInfo.categoryId}`,
        {
          isActive: statusInfo.isActive,
        },
        {
          headers: { authorization: getCookie("accessToken") },
        }
      )) as unknown as TResponse<TProductCategory[]>;
      if (result?.success) {
        toast.success("Active Status updated successfully!", { id: toastId });
        fetchCategories();
        setStatusInfo((prevStatusInfo) => ({
          ...prevStatusInfo,
          categoryId: "",
          field: "",
        }));
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.log(error);
      toast.error(
        error?.response?.data?.message || "Active Status update failed",
        { id: toastId }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const softDeleteCategory = async () => {
    const toastId = toast.loading("Deleting category...");
    setIsLoading(true);
    try {
      const result = (await deleteData(
        `/categories/productCategory/soft-delete/${statusInfo.categoryId}`,
        {
          headers: { authorization: getCookie("accessToken") },
        }
      )) as unknown as TResponse<TProductCategory[]>;
      if (result?.success) {
        toast.success("Category deleted successfully!", { id: toastId });
        fetchCategories();
        setStatusInfo((prevStatusInfo) => ({
          ...prevStatusInfo,
          categoryId: "",
          field: "",
        }));
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Category delete failed", {
        id: toastId,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async (
    queries: TProductCategoryQueryParams = queryParams
  ) => {
    let params: Partial<TProductCategoryQueryParams> = {};

    if (queries) {
      queries = Object.fromEntries(
        Object.entries(queries).filter((q) => !!q?.[1])
      );
    } else {
      params = Object.fromEntries(
        Object.entries(queryParams).filter((q) => !!q?.[1])
      );
    }

    setIsLoading(true);

    try {
      const data = (await fetchData("/categories/productCategory", {
        params: params || queryParams,
        headers: { authorization: getCookie("accessToken") },
      })) as unknown as TResponse<{ data: TProductCategory[]; meta: TMeta }>;

      if (data?.success) {
        setProductCategoriesResult(data?.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    (() => fetchCategories())();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
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
                  <FileCheckIcon className="w-4" />
                  Icon
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
            {isLoading && (
              <TableRow>
                <TableCell
                  className="text-center text-lg text-[#DC3173]"
                  colSpan={5}
                >
                  Loading...
                </TableCell>
              </TableRow>
            )}
            {!isLoading &&
              productCategoriesResult &&
              productCategoriesResult?.data?.length > 0 &&
              productCategoriesResult?.data?.map((category) => (
                <TableRow key={category._id}>
                  <TableCell>{category.name}</TableCell>
                  <TableCell>{category.description}</TableCell>
                  <TableCell>{category.image}</TableCell>
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
                              "/admin/product-categories/" + category._id
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
            {!isLoading && productCategoriesResult?.data?.length === 0 && (
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
      {productCategoriesResult?.data &&
        productCategoriesResult?.data?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 md:px-6"
          >
            <PaginationCard
              currentPage={productCategoriesResult?.meta?.page as number}
              totalPages={productCategoriesResult?.meta?.totalPage as number}
              paginationItemsToDisplay={productCategoriesResult?.meta?.limit}
              setQueryParams={setQueryParams}
            />
          </motion.div>
        )}
      {
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
                    : statusInfo.isActive
                    ? "Inactive"
                    : "Active"}{" "}
                  category
                </DialogTitle>
                <DialogDescription>
                  Are you sure you want to{" "}
                  {statusInfo.field === "isDeleted"
                    ? "delete"
                    : statusInfo.isActive
                    ? "inactive"
                    : "active"} this category?
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
                ) : statusInfo.isActive ? (
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
      }
    </>
  );
}
