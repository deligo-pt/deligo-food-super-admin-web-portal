"use client";

import AllFilters from "@/components/Filtering/AllFilters";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import DeleteModal from "@/components/Modals/DeleteModal";
import EditTaxModal from "@/components/Tax/AllTaxes/EditTaxModal";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
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
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteTaxReq, updateTaxReq } from "@/services/dashboard/tax/tax";
import { TMeta } from "@/types";
import { TTax } from "@/types/tax.type";
import {
  CheckCircle,
  MoreVerticalIcon,
  PlusCircle,
  XCircle,
} from "lucide-react";
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

export default function AllTaxes({ taxesResult }: IProps) {
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

      {/* List */}
      <div className="overflow-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-white">
              <TableCell className="pl-6">Name</TableCell>
              <TableCell>Tax Code</TableCell>
              <TableCell>Rate</TableCell>
              <TableCell>Country ID</TableCell>
              <TableCell>Active</TableCell>
              <TableCell className="text-right pr-6">Actions</TableCell>
            </TableRow>
          </TableHeader>

          <TableBody>
            {taxesResult?.data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <div className="py-12 text-center text-slate-500">
                    No taxes found.
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              taxesResult?.data?.map((tax) => (
                <TableRow key={tax._id} className="bg-white">
                  <TableCell className="pl-6">{tax.taxName}</TableCell>

                  <TableCell>{tax.taxCode}</TableCell>

                  <TableCell>{tax.taxRate}</TableCell>

                  <TableCell>{tax.countryID}</TableCell>

                  <TableCell>
                    {tax.isActive ? (
                      <CheckCircle className="text-green-500" size={16} />
                    ) : (
                      <XCircle className="text-destructive" size={16} />
                    )}
                  </TableCell>

                  <TableCell className="text-right pr-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <MoreVerticalIcon className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          className=""
                          onClick={() =>
                            router.push(`/admin/all-taxes/${tax._id}`)
                          }
                        >
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-[#DC3173]"
                          onClick={() => setEditTax(tax)}
                        >
                          Edit
                        </DropdownMenuItem>
                        {tax.isActive && (
                          <DropdownMenuItem
                            className="text-yellow-600"
                            onClick={() => handleUpdateStatus(tax._id, false)}
                          >
                            Deactivate
                          </DropdownMenuItem>
                        )}
                        {!tax.isActive && (
                          <>
                            <DropdownMenuItem
                              className="text-green-600"
                              onClick={() => handleUpdateStatus(tax._id, true)}
                            >
                              Activate
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setDeleteId(tax._id)}
                            >
                              Delete
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

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
