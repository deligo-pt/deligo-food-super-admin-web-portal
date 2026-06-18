"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/hooks/use-translation";
import { TSystemPermission } from "@/types/permission.type";

interface SelectionSummaryCardProps {
  permissions: TSystemPermission[];
  selectedPermissionIds: string[];
  selectedAdminId: string;
  onClearAll: () => void;
  isSubmitting: boolean;
  submitColor: string;
}

export function SelectionSummaryCard({
  permissions,
  selectedPermissionIds,
  selectedAdminId,
  onClearAll,
  isSubmitting,
  submitColor,
}: SelectionSummaryCardProps) {
  const { t } = useTranslation();

  // Compute dynamic categorical count ratios map
  const modulesMap = permissions.reduce((acc, perm) => {
    if (!acc[perm.module]) acc[perm.module] = { total: 0, selected: 0 };
    acc[perm.module].total += 1;
    if (selectedPermissionIds.includes(perm._id)) {
      acc[perm.module].selected += 1;
    }
    return acc;
  }, {} as Record<string, { total: number; selected: number }>);

  return (
    <Card className="rounded-3xl bg-white border shadow-sm overflow-hidden">
      <CardContent className="p-5 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xs text-gray-400 uppercase tracking-wider">
            {t("selected_permissions")}
          </h3>
          <div className="bg-[#DC3173] text-white font-bold text-xs px-2.5 py-1 rounded-full">
            {selectedPermissionIds.length} {t("selected")}
          </div>
        </div>

        <div className="space-y-3">
          {Object.entries(modulesMap).map(([moduleName, counts]) => (
            <div key={moduleName} className="flex justify-between items-center text-sm">
              <span className="text-gray-600 font-medium">{moduleName}</span>
              <span className="font-bold text-gray-900">
                {counts.selected}/{counts.total}
              </span>
            </div>
          ))}
          {Object.keys(modulesMap).length === 0 && (
            <p className="text-xs text-gray-400 text-center py-2">{t("no_selections_available")}</p>
          )}
        </div>

        <div className="space-y-2 pt-2">
          <Button
            type="submit"
            className="w-full h-12 rounded-xl text-white font-bold text-base shadow-sm transition-transform active:scale-95"
            style={{ background: submitColor }}
            disabled={isSubmitting}
          >
            {t("assign_permissions")}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onClearAll}
            disabled={isSubmitting || selectedPermissionIds.length === 0 || selectedAdminId === ''}
            className="w-full h-12 rounded-xl text-gray-700 font-semibold text-base border-gray-200"
          >
            {t("clear_all")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}