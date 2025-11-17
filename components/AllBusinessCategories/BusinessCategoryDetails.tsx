"use client";

import BusinessCategoryStatusBadge from "@/components/AllBusinessCategories/BusinessCategoryStatusBadge";
import EditBusinessCategoryModal from "@/components/AllBusinessCategories/EditCategoryModal";
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
import { TResponse } from "@/types";
import { TBusinessCategory } from "@/types/category.type";
import { getCookie } from "@/utils/cookies";
import { deleteData, updateData } from "@/utils/requests";
import { motion } from "framer-motion";
import {
  ArrowLeftIcon,
  BanIcon,
  CalendarIcon,
  Edit2Icon,
  FileTextIcon,
  ShieldCheckIcon,
  ShieldXIcon,
  TagIcon,
  TrashIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function BusinessCategoryDetails({
  category,
}: {
  category: TBusinessCategory;
}) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [updateField, setUpdateField] = useState("");
  const router = useRouter();

  const onEditModalClose = () => {
    setShowEditModal(false);
  };

  const handleToggleStatus = () => {};

  const updateActiveStatus = async () => {
    const toastId = toast.loading("Updating active status...");
    try {
      const result = (await updateData(
        `/categories/businessCategory/${category._id}`,
        {
          isActive: !category.isActive,
        },
        {
          headers: { authorization: getCookie("accessToken") },
        }
      )) as unknown as TResponse<TBusinessCategory[]>;
      if (result?.success) {
        toast.success("Active Status updated successfully!", { id: toastId });
        setUpdateField("");
        router.refresh();
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.log(error);
      toast.error(
        error?.response?.data?.message || "Active Status update failed",
        { id: toastId }
      );
    }
  };

  const softDeleteCategory = async () => {
    const toastId = toast.loading("Deleting category...");

    try {
      const result = (await deleteData(
        `/categories/businessCategory/soft-delete/${category?._id}`,
        {
          headers: { authorization: getCookie("accessToken") },
        }
      )) as unknown as TResponse<TBusinessCategory[]>;
      if (result?.success) {
        toast.success("Category deleted successfully!", { id: toastId });
        // fetchCategories();
        setUpdateField("");
        router.refresh();
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Category delete failed", {
        id: toastId,
      });
    }
  };

  return (
    <div className="p-4 md:p-6">
      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.5,
        }}
        className="mb-6"
      >
        <Link
          href="/admin/business-categories"
          className="text-[#DC3173] hover:text-[#DC3173]/90 flex items-center gap-2 mb-4"
        >
          <ArrowLeftIcon size={16} />
          Back to Categories
        </Link>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-bold text-[#DC3173]">
            Business Category Details
          </h1>
          <div className="flex gap-2">
            <motion.button
              whileHover={{
                scale: 1.05,
              }}
              whileTap={{
                scale: 0.95,
              }}
              onClick={() => setShowEditModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#DC3173] text-white rounded-lg shadow-md hover:bg-[#DC3173]/90"
            >
              <Edit2Icon size={16} />
              Edit
            </motion.button>
            {category?.isDeleted ? (
              <motion.button
                whileHover={{
                  scale: 1.05,
                }}
                whileTap={{
                  scale: 0.95,
                }}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg shadow-md cursor-not-allowed"
              >
                <BanIcon size={16} />
                Deleted
              </motion.button>
            ) : category?.isActive ? (
              <motion.button
                whileHover={{
                  scale: 1.05,
                }}
                whileTap={{
                  scale: 0.95,
                }}
                onClick={() => setUpdateField("isActive")}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg shadow-md hover:bg-yellow-500/90"
              >
                <ShieldXIcon size={16} />
                Inactive
              </motion.button>
            ) : (
              <>
                <motion.button
                  whileHover={{
                    scale: 1.05,
                  }}
                  whileTap={{
                    scale: 0.95,
                  }}
                  onClick={() => setUpdateField("isActive")}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-600/90"
                >
                  <ShieldCheckIcon size={16} />
                  Active
                </motion.button>
                <motion.button
                  whileHover={{
                    scale: 1.05,
                  }}
                  whileTap={{
                    scale: 0.95,
                  }}
                  onClick={() => setUpdateField("isDelete")}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-600/90"
                >
                  <TrashIcon size={16} />
                  Delete
                </motion.button>
              </>
            )}
          </div>
        </div>
      </motion.div>
      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.5,
          delay: 0.1,
        }}
        className="bg-white rounded-xl shadow-lg overflow-hidden"
      >
        {category.image && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              duration: 0.8,
            }}
            className="w-full h-64 relative"
          >
            <Image
              src={category.image}
              alt={category.name}
              className="w-full h-full object-cover"
              width={500}
              height={500}
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4">
              <BusinessCategoryStatusBadge
                isActive={category.isActive}
                onClick={handleToggleStatus}
              />
            </div>
          </motion.div>
        )}
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-1">{category.name}</h2>
            <div className="flex items-center text-gray-500 mb-4">
              <TagIcon size={16} className="mr-2" />
              <span>{category.slug}</span>
            </div>
            {category.description && (
              <div className="flex gap-2 text-gray-700 mb-4">
                <FileTextIcon size={18} className="shrink-0 mt-1" />
                <p>{category.description}</p>
              </div>
            )}
          </div>
          <div className="border-t border-gray-200 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center text-gray-600">
                <CalendarIcon size={16} className="mr-2" />
                <span>
                  Created:{" "}
                  {new Date(
                    category.createdAt as unknown as string
                  )?.toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center text-gray-600">
                <CalendarIcon size={16} className="mr-2" />
                <span>
                  Updated:{" "}
                  {new Date(
                    category.updatedAt as unknown as string
                  )?.toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <EditBusinessCategoryModal
        category={category}
        isOpen={showEditModal}
        onClose={onEditModalClose}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Dialog open={!!updateField} onOpenChange={() => setUpdateField("")}>
          <form>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {updateField === "isDeleted"
                    ? "Delete"
                    : category.isActive
                    ? "Inactive"
                    : "Active"}{" "}
                  Category
                </DialogTitle>
                <DialogDescription>
                  Are you sure you want to{" "}
                  {updateField === "isDeleted"
                    ? "delete"
                    : category.isActive
                    ? "inactive"
                    : "active"}{" "}
                  this category?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>

                {updateField === "isDeleted" ? (
                  <Button variant="destructive" onClick={softDeleteCategory}>
                    Delete
                  </Button>
                ) : category.isActive ? (
                  <Button
                    onClick={updateActiveStatus}
                    className="bg-yellow-500 hover:bg-opacity-90"
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
      </motion.div>
    </div>
  );
}
