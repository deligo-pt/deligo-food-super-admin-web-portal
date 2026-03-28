"use client";

import EditTaxModal from "@/components/Dashboard/Taxes/Taxes/EditTaxModal";
import TaxTable from "@/components/Dashboard/Taxes/Taxes/TaxTable";
import AllFilters from "@/components/Filtering/AllFilters";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import DeleteModal from "@/components/Modals/DeleteModal";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import {
  deleteTaxReq,
  updateTaxReq,
} from "@/services/dashboard/tax/tax.service";
import { TMeta } from "@/types";
import { TTax } from "@/types/tax.type";
import { PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface IProps {
  taxesResult: { data: TTax[]; meta?: TMeta };
}

const sortOptions = [
  { label: "Newest First", value: "-createdAt" },
  { label: "Oldest First", value: "createdAt" },
  { label: "Name (A-Z)", value: "taxName" },
  { label: "Name (Z-A)", value: "-taxName" },
];

export default function Taxes({ taxesResult }: IProps) {
  const [editTax, setEditTax] = useState<TTax | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const router = useRouter();

  const handleUpdateStatus = async (id: string, isActive: boolean) => {
    const toastId = toast.loading(
      isActive ? "Activating Tax..." : "Deactivating Tax...",
    );

    const result = await updateTaxReq(id, { isActive });

    if (result.success) {
      router.refresh();
      toast.success(
        `Tax ${isActive ? "activated" : "deactivated"} successfully!`,
        {
          id: toastId,
        },
      );
      return;
    }

    toast.error(
      result.message || `Failed to ${isActive ? "activate" : "deactivate"} tax`,
      {
        id: toastId,
      },
    );
    console.log(result);
  };

  const handleDeleteTax = async () => {
    const toastId = toast.loading("Deleting Tax...");

    const result = await deleteTaxReq(deleteId as string);

    if (result.success) {
      router.push("/admin/all-taxes");
      toast.success(result.message || "Tax deleted successfully!", {
        id: toastId,
      });
      setDeleteId(null);
      return;
    }

    toast.error(result.message || "Failed to delete tax", {
      id: toastId,
    });
    console.log(result);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <TitleHeader
        title="All Taxes"
        subtitle="Manage all the taxes in the system"
        buttonInfo={{
          text: "Create",
          icon: PlusCircle,
          onClick: () => router.push("/admin/create-tax"),
        }}
      />

      <AllFilters sortOptions={sortOptions} />

      {/* Tax Table */}
      <TaxTable
        taxes={taxesResult?.data}
        onEditClick={(tax: TTax) => setEditTax(tax)}
        onStatusChange={handleUpdateStatus}
        onDeleteClick={(id: string) => setDeleteId(id)}
      />

      {!!taxesResult?.meta?.total && taxesResult?.meta?.total > 0 && (
        <div className="mt-2">
          <PaginationComponent totalPages={taxesResult?.meta?.totalPage || 0} />
        </div>
      )}

      {/* Edit Tax Modal */}
      <EditTaxModal
        open={!!editTax}
        onOpenChange={(open) => !open && setEditTax(null)}
        prevTax={editTax}
      />

      {/* Delete Tax Modal */}
      <DeleteModal
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDeleteTax}
      />
    </div>
  );
}
