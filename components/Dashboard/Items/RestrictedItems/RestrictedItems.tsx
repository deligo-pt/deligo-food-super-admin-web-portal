"use client";

import CreateRestrictedItemModal from "@/components/Dashboard/Items/RestrictedItems/CreateRestrictedItemModal";
import EditRestrictedItemModal from "@/components/Dashboard/Items/RestrictedItems/EditRestrictedItemModal";
import RestrictedItemTable from "@/components/Dashboard/Items/RestrictedItems/RestrictedItemTable";
import AllFilters from "@/components/Filtering/AllFilters";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import DeleteModal from "@/components/Modals/DeleteModal";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { TMeta } from "@/types";
import { TRestrictedItem } from "@/types/product.type";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";

interface IProps {
  restrictedItemsData: { data: TRestrictedItem[]; meta?: TMeta };
}

const sortOptions = [
  { label: "Newest First", value: "-createdAt" },
  { label: "Oldest First", value: "createdAt" },
  { label: "Name (A-Z)", value: "name.firstName" },
  { label: "Name (Z-A)", value: "-name.lastName" },
];

export default function RestrictedItems({ restrictedItemsData }: IProps) {
  // const router = useRouter();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<TRestrictedItem | null>(null);
  const [deleteId, setDeleteId] = useState("");

  const deleteItem = async () => {
    const toastId = toast.loading("Deleting Item...");

    setTimeout(() => {
      toast.success("Restricted item deleted successfully!", {
        id: toastId,
      });
      setDeleteId("");
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-full">
      {/* Page Title */}
      <TitleHeader
        title="Restricted Items"
        subtitle="Manage items vendors are not allowed to sell on Deligo"
        buttonInfo={{
          text: "Add Item",
          onClick: () => setIsAddModalOpen(true),
        }}
      />

      {/* Filters */}
      <AllFilters sortOptions={sortOptions} />

      {/* Item Table */}
      <RestrictedItemTable
        restrictedItems={restrictedItemsData?.data || []}
        onEdit={(item) => setEditItem(item)}
        onDelete={(id) => setDeleteId(id)}
      />

      {/* Pagination */}
      {!!restrictedItemsData?.meta?.totalPage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 md:px-6"
        >
          <PaginationComponent
            totalPages={restrictedItemsData?.meta?.totalPage as number}
          />
        </motion.div>
      )}

      {/* Create Restricted Item Modal */}
      {isAddModalOpen && (
        <CreateRestrictedItemModal
          open={isAddModalOpen}
          onOpenChange={(open) => !open && setIsAddModalOpen(false)}
        />
      )}

      {/* Edit Restricted Item Modal */}
      {editItem && (
        <EditRestrictedItemModal
          open={!!editItem}
          onOpenChange={(open) => !open && setEditItem(null)}
          prevValues={editItem}
        />
      )}

      {/* Delete Modal */}
      <DeleteModal
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId("")}
        onConfirm={deleteItem}
      />
    </div>
  );
}
