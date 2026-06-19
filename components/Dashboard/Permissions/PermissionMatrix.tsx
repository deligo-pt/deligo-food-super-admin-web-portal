"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";
import { TSystemPermission } from "@/types/permission.type";

interface PermissionsMatrixProps {
  permissions: TSystemPermission[];
  selectedPermissionIds: string[];
  onChangePermissions: (ids: string[]) => void;
}

export function PermissionsMatrix({
  permissions,
  selectedPermissionIds = [],
  onChangePermissions,
}: PermissionsMatrixProps) {
  const { t } = useTranslation();

  if (!permissions || permissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-3xl bg-white">
        <span className="text-4xl mb-2">🛡️</span>
        <h4 className="font-bold text-gray-700 text-lg">{t("no_permissions_available")}</h4>
        <p className="text-sm text-gray-400 mt-1">{t("no_system_permissions_definitions_found")}</p>
      </div>
    );
  }

  // Pure data grouping by Module Categorizations
  const modulesMap = permissions.reduce((acc, perm) => {
    if (!acc[perm.module]) acc[perm.module] = [];
    acc[perm.module].push(perm);
    return acc;
  }, {} as Record<string, TSystemPermission[]>);

  const handleToggleAll = () => {
    if (selectedPermissionIds.length === permissions.length) {
      onChangePermissions([]);
    } else {
      onChangePermissions(permissions.map((p) => p._id));
    }
  };

  const handleTogglePermission = (id: string) => {
    if (selectedPermissionIds.includes(id)) {
      onChangePermissions(selectedPermissionIds.filter((pId) => pId !== id));
    } else {
      onChangePermissions([...selectedPermissionIds, id]);
    }
  };

  return (
    <div className="space-y-6 bg-white border shadow-sm rounded-3xl p-6">
      <div className="flex items-center justify-between pb-2 border-b">
        <div className="flex items-center space-x-2">
          <span className="text-[#DC3173] text-lg">🎛️</span>
          <h3 className="font-bold text-base text-gray-900">{t("permissions_matrix")}</h3>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleToggleAll}
          className="rounded-xl font-medium text-xs text-gray-600 border-gray-200"
        >
          {selectedPermissionIds.length === permissions.length ? t("deselect_all") : t("select_all")}
        </Button>
      </div>

      <div className="space-y-8">
        {Object.entries(modulesMap).map(([moduleName, modulePerms]) => (
          <div key={moduleName} className="space-y-3">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-[#DC3173] mr-2" />
              {moduleName}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {modulePerms.map((perm) => {
                const isChecked = selectedPermissionIds.includes(perm._id);
                return (
                  <div
                    key={perm._id}
                    onClick={() => handleTogglePermission(perm._id)}
                    className={cn(
                      "flex items-start space-x-3 p-4 rounded-2xl border cursor-pointer transition-all duration-150 select-none",
                      isChecked 
                        ? "border-[#DC3173]/40 bg-[#FFF1F7]/40 shadow-sm" 
                        : "border-gray-100 bg-white hover:bg-gray-50/50"
                    )}
                  >
                    <div onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => handleTogglePermission(perm._id)}
                        className="mt-0.5"
                      />
                    </div>
                    
                    <div className="space-y-0.5">
                      <p className="font-bold text-sm text-gray-800 font-mono tracking-tight">
                        {perm.action}
                      </p>
                      {perm.description && (
                        <p className="text-xs text-gray-500 leading-normal line-clamp-2">
                          {perm.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}