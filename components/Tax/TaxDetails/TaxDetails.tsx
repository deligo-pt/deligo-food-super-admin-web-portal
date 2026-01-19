"use client";

import DeleteModal from "@/components/Modals/DeleteModal";
import EditTaxModal from "@/components/Tax/AllTaxes/EditTaxModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { deleteTaxReq, updateTaxReq } from "@/services/dashboard/tax/tax";
import { TTax } from "@/types/tax.type";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Globe,
  Hash,
  Pencil,
  Percent,
  ShieldCheck,
  ShieldOff,
  Trash2,
  Utensils,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface IProps {
  tax: TTax;
}

export default function TaxDetails({ tax }: IProps) {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
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

    const result = await deleteTaxReq(tax._id);

    if (result.success) {
      router.refresh();
      toast.success(result.message || "Tax deleted successfully!", {
        id: toastId,
      });
      setDeleteModalOpen(false);
      return;
    }

    toast.error(result.message || "Failed to delete tax", {
      id: toastId,
    });
    console.log(result);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Card className="rounded-2xl shadow-md border-muted">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Utensils className="h-5 w-5 text-[#DC3173]" />
              {tax.taxName}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{tax.description}</p>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="border-[#DC3173] text-[#DC3173]"
            >
              {tax.taxCode}
            </Badge>
            {tax.isActive ? (
              <ShieldCheck className="h-4 w-4 text-green-600" />
            ) : (
              <ShieldOff className="h-4 w-4 text-destructive" />
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <Separator />

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-[#DC3173]" />
              <span className="text-muted-foreground">Tax Rate</span>
              <span className="font-medium">{tax.taxRate}%</span>
            </div>

            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-[#DC3173]" />
              <span className="text-muted-foreground">Country</span>
              <span className="font-medium">{tax.countryID}</span>
            </div>

            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-[#DC3173]" />
              <span className="text-muted-foreground">Tax Group</span>
              <span className="font-medium">{tax.taxGroupID}</span>
            </div>

            {tax.TaxRegionID && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-[#DC3173]" />
                <span className="text-muted-foreground">Region</span>
                <span className="font-medium">{tax.TaxRegionID}</span>
              </div>
            )}
          </div>

          {(tax.taxExemptionCode || tax.taxExemptionReason) && (
            <div className="rounded-xl bg-muted p-3 text-sm space-y-1">
              <div className="flex items-center gap-2 font-medium">
                <ShieldOff className="h-4 w-4 text-[#DC3173]" />
                Tax Exemption
              </div>
              {tax.taxExemptionCode && (
                <p>
                  <span className="text-muted-foreground">Code:</span>{" "}
                  {tax.taxExemptionCode}
                </p>
              )}
              {tax.taxExemptionReason && (
                <p>
                  <span className="text-muted-foreground">Reason:</span>{" "}
                  {tax.taxExemptionReason}
                </p>
              )}
            </div>
          )}

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Active</span>
              {tax.isActive ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-destructive" />
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="bg-[#DC3173] hover:bg-[#DC3173]/90 text-white hover:text-white"
                onClick={() => setEditModalOpen(true)}
              >
                <Pencil className="h-4 w-4 mr-1" />
                Edit
              </Button>
              {tax.isActive && (
                <Button
                  size="sm"
                  className="bg-yellow-500 hover:bg-yellow-500/90"
                  onClick={() => handleUpdateStatus(tax._id, false)}
                >
                  <ShieldOff className="h-4 w-4 mr-1" />
                  Deactivate
                </Button>
              )}
              {!tax.isActive && (
                <>
                  <Button
                    size="sm"
                    className="bg-green-500 hover:bg-green-500/90"
                    onClick={() => handleUpdateStatus(tax._id, true)}
                  >
                    <ShieldCheck className="h-4 w-4 mr-1" />
                    Activate
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setDeleteModalOpen(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <EditTaxModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        prevTax={tax}
      />

      {/* Delete Modal */}
      <DeleteModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={handleDeleteTax}
      />
    </motion.div>
  );
}
