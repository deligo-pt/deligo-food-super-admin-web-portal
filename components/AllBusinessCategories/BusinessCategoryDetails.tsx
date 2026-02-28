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
import { useTranslation } from "@/hooks/use-translation";
import {
  deleteBusinessCategoryReq,
  updateBusinessCategoryReq,
} from "@/services/dashboard/category/business-category";
import { TBusinessCategory } from "@/types/category.type";
import { format } from "date-fns";
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
  const { t } = useTranslation();
  const [showEditModal, setShowEditModal] = useState(false);
  const [updateField, setUpdateField] = useState("");
  const router = useRouter();

  const onEditModalClose = () => {
    setShowEditModal(false);
  };

  const updateActiveStatus = async () => {
    const toastId = toast.loading("Updating active status...");

    const result = await updateBusinessCategoryReq(category._id, {
      isActive: !category.isActive,
    });

    if (result?.success) {
      toast.success(result.message || "Active Status updated successfully!", {
        id: toastId,
      });
      setUpdateField("");
      router.refresh();
      return;
    }

    toast.error(result.message || "Active Status update failed", {
      id: toastId,
    });
    console.log(result);
  };

  const softDeleteCategory = async () => {
    const toastId = toast.loading("Deleting category...");

    const result = await deleteBusinessCategoryReq(category?._id);

    if (result?.success) {
      toast.success(result.message || "Category deleted successfully!", {
        id: toastId,
      });
      setUpdateField("");
      router.refresh();
      return;
    }

    toast.error(result?.message || "Category delete failed", {
      id: toastId,
    });
    console.log(result);
  };

  return (
    <div className="">
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
          {t("back_to_categories")}
        </Link>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-bold text-[#DC3173]">
            {t("business_category_details")}
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
              {t("edit")}
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
                {t("deleted")}
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
                {t("deactivate")}
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
                  {t("activate")}
                </motion.button>
                <motion.button
                  whileHover={{
                    scale: 1.05,
                  }}
                  whileTap={{
                    scale: 0.95,
                  }}
                  onClick={() => setUpdateField("isDeleted")}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-600/90"
                >
                  <TrashIcon size={16} />
                  {t("delete")}
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
        className="bg-white rounded-xl shadow-lg overflow-hidden relative"
      >
        {category.icon && (
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
            className="w-full h-64"
          >
            <Image
              src={category.icon}
              alt={category.name}
              className="w-full h-full object-cover"
              width={500}
              height={500}
            />
          </motion.div>
        )}

        <div className="absolute top-4 right-4">
          <BusinessCategoryStatusBadge
            isActive={category.isActive}
            isDeleted={category.isDeleted}
          />
        </div>
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
                  {t("created")}: {format(category.createdAt as Date, "do MMM yyyy")}
                </span>
              </div>
              <div className="flex items-center text-gray-600">
                <CalendarIcon size={16} className="mr-2" />
                <span>
                  {t("updated")}: {format(category.updatedAt as Date, "do MMM yyyy")}
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
                    ? t("delete")
                    : category.isActive
                      ? t("deactivate")
                      : t("activate")}{" "}
                  {t("category_lg")}
                </DialogTitle>
                <DialogDescription>
                  {t("are_you_sure_want_to")}{" "}
                  {updateField === "isDeleted"
                    ? "delete"
                    : category.isActive
                      ? "deactivate"
                      : "activate"}{" "}
                  {t("this_category")}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">{t("cancel")}</Button>
                </DialogClose>

                {updateField === "isDeleted" ? (
                  <Button variant="destructive" onClick={softDeleteCategory}>
                    {t("delete")}
                  </Button>
                ) : category.isActive ? (
                  <Button
                    onClick={updateActiveStatus}
                    className="bg-yellow-500 hover:bg-opacity-90"
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
      </motion.div>
    </div>
  );
}
