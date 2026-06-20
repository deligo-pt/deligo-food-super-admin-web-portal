"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Clock, Edit2, EuroIcon, Package, Trash2, Calendar } from "lucide-react";

import TitleHeader from "@/components/TitleHeader/TitleHeader";
import StatsCard from "@/components/Dashboard/Performance/StatsCard/StatsCard";
import EditIngredientModal from "./EditIngredientModal"; // Adjust path if needed

import { TIngredient } from "@/types/ingredient.type";
import { formatPrice } from "@/utils/formatPrice";
import { TTax } from "@/types/tax.type";
import DeleteModal from "@/components/Modals/DeleteModal";
import { toast } from "sonner";
import { permanentDeleteIngredient, softDeleteIngredient } from "@/services/dashboard/ingredient/ingredient.service";

interface IProps {
  ingredientData: TIngredient;
  taxes: TTax[];
}

export default function IngredientDetails({ ingredientData, taxes }: IProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfig, setDeleteConfig] = useState<{
    id: string;
    type: "soft" | "permanent";
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteIngredient = async () => {
    if (!deleteConfig) return;

    setIsDeleting(true);
    const toastId = toast.loading(
      deleteConfig.type === "soft"
        ? "Moving ingredient to trash..."
        : "Permanently deleting ingredient..."
    );

    // Dynamically fire request based on configuration type
    const result = deleteConfig.type === "soft"
      ? await softDeleteIngredient(deleteConfig.id)
      : await permanentDeleteIngredient(deleteConfig.id);

    if (result?.success) {
      toast.success(
        result?.message || `Ingredient ${deleteConfig.type === "soft" ? "soft" : "permanently"} deleted successfully!`,
        { id: toastId }
      );
      router.refresh();
      setIsDeleting(false);
      setDeleteConfig(null);
      return;
    } else {
      setIsDeleting(false);
      toast.error(result?.message || "Failed to complete deletion setup", { id: toastId });
      return;
    }
  };


  return (
    <div className="min-h-screen p-1 pb-10">
      {/* Header */}
      <TitleHeader
        title="Ingredient Details"
        subtitle={`SKU: ${ingredientData.sku}`}
        onBackClick={() => router.back()}
      />

      {/* Ingredient Info and Action Items */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 mt-4">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-extrabold text-gray-900"
        >
          {ingredientData.name}
        </motion.h1>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
          >
            <Edit2 size={18} />
            Edit
          </button>
          <button
            type="button"
            onClick={() => setDeleteConfig({ id: ingredientData._id, type: "soft" })}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-xl font-medium hover:bg-red-100 transition-all"
          >
            <Trash2 size={18} />
            Soft <span className="hidden lg:block">Delete</span>
          </button>
          <button
            type="button"
            onClick={() => setDeleteConfig({ id: ingredientData._id, type: "permanent" })}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-xl font-medium hover:bg-red-100 transition-all"
          >
            <Trash2 size={18} />
            Parmanent <span className="hidden lg:block">Delete</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard
          title="Current Stock"
          value={`${ingredientData.stock?.toLocaleString()} ${ingredientData.unit || "units"}`}
          icon={Package}
          delay={0}
        />
        <StatsCard
          title="Unit Price"
          value={`€${formatPrice(ingredientData.price)}`}
          icon={EuroIcon}
          delay={0.1}
        />
        <StatsCard
          title="Last Updated"
          value={
            ingredientData.updatedAt
              ? format(new Date(ingredientData.updatedAt), "do MMM yyyy, h:mm a")
              : "N/A"
          }
          icon={Clock}
          delay={0.3}
        />
      </div>

      {/* Main Read-Only Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Workspace */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Core Specs Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Asset Specifications</h2>

            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-32 h-32 rounded-2xl overflow-hidden relative shrink-0 border border-gray-100 bg-gray-50">
                <Image
                  src={ingredientData.image || "/placeholder-fallback.png"}
                  alt={ingredientData.name}
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Name</label>
                  <p className="text-gray-900 font-semibold">{ingredientData.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Category</label>
                  <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 uppercase tracking-wider">
                    {ingredientData.category}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Price per Unit</label>
                  <p className="text-gray-900 font-medium">€{ingredientData.price?.toFixed(2)}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Minimum Order</label>
                  <p className="text-gray-900 font-medium">
                    {ingredientData.minOrder}{" "}
                    <span className="text-gray-400 font-normal text-xs">{ingredientData.unit}</span>
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Description</label>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {ingredientData.description ||
                      "No descriptions available for this item asset catalog profile."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Bulk Discounts Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-900">Bulk Discount Matrix</h3>
              <p className="text-xs text-gray-400">
                Layer tier volume incentives automatically across customer catalogs
              </p>
            </div>

            <div className="overflow-hidden border border-gray-100 rounded-xl">
              {ingredientData.bulkDiscount && ingredientData.bulkDiscount.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-100 text-left text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 font-medium text-gray-500">Volume Threshold</th>
                      <th className="px-4 py-3 font-medium text-gray-500">Price Break Rate</th>
                      <th className="px-4 py-3 font-medium text-gray-500">Target Savings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {ingredientData.bulkDiscount.map((tier, idx) => {
                      const basePrice = ingredientData.price || 0;
                      const saving = basePrice - tier.discountPrice;
                      return (
                        <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-3 font-medium text-gray-900">
                            ≥ {tier.minQty} {ingredientData.unit || "units"}
                          </td>
                          <td className="px-4 py-3 text-emerald-600 font-semibold">
                            €{tier.discountPrice.toFixed(2)} / unit
                          </td>
                          <td className="px-4 py-3 text-gray-400 text-xs">
                            Saves €{saving.toFixed(2)} per item unit
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <p className="text-sm text-gray-400 italic bg-gray-50/50 p-4 rounded-xl text-center">
                  Base market tracking metrics apply globally. No dynamic tier price records mapped.
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Sidebar Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          {/* Live Pipeline Ratios & Stock Safeguards */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              Inventory Mappings
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-500">Current Volume</span>
                <span className="font-bold text-gray-900">
                  {ingredientData.stock}{" "}
                  <span className="text-xs text-gray-400 font-normal">{ingredientData.unit}</span>
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-500">Tax Class</span>
                <span className="font-bold text-slate-700 text-sm">
                  {ingredientData.tax?.taxRate
                    ? `${ingredientData.tax.taxRate}% Rate Class`
                    : "Exempt / Grounded"}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-500">Safety System Threshold</span>
                <span className="font-bold text-red-600 bg-red-50 px-2.5 py-0.5 rounded-lg text-xs">
                  &lt; {ingredientData.lowStockAlert} {ingredientData.unit}
                </span>
              </div>

              {/* Freshness Lifecycle Metric Section */}
              <div className="border-t border-dashed border-gray-100 pt-3">
                <label className="text-sm font-medium text-gray-500 flex items-center gap-1.5 mb-1.5">
                  <Calendar size={14} className="text-gray-400" /> Shelf Life Safeguard
                </label>
                <p className="text-sm font-semibold text-gray-800 bg-slate-50 p-3 rounded-xl">
                  {ingredientData.shelfLifeDays
                    ? `${ingredientData.shelfLifeDays} Days Estimated Preservation`
                    : "Indefinite / Non-Perishable"}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Reusable Edit Modal */}
      <EditIngredientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        ingredientData={ingredientData}
        taxes={taxes}
        onSuccess={() => {
          router.refresh();
        }}
      />

      <DeleteModal
        open={!!deleteConfig}
        onOpenChange={(open) => !open && setDeleteConfig(null)}
        onConfirm={handleDeleteIngredient}
        isDeleting={isDeleting}
        title={deleteConfig?.type === "permanent" ? "Permanent Deletion Alert" : "Soft Delete Confirmation"}
        description={
          deleteConfig?.type === "permanent"
            ? "Are you absolutely sure? This action is irreversible and completely wipes the asset record from the cluster database."
            : "Are you sure you want to flag this item? This operation moves the ingredient item to archive contexts safely."
        }
      />
    </div>
  );
}