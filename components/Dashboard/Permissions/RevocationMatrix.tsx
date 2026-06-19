"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { ShieldX, AlertCircle } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

interface RevocationMatrixProps {
    adminPermissions: string[]; // Flat string array directly from the database
    selectedPermissionActions: string[];
    onChangePermissions: (actions: string[]) => void;
    adminId: string;
}

export function RevocationMatrix({
    adminPermissions = [],
    selectedPermissionActions = [],
    onChangePermissions,
    adminId,
}: RevocationMatrixProps) {
    const { t } = useTranslation();

    // Automatically categorizes raw string keys into modules by parsing their names
    const modulesMap = useMemo(() => {
        return adminPermissions.reduce((acc, action) => {
            // Converts "CAN_MANAGE_AGREEMENTS" -> "MANAGE AGREEMENTS" or extracts the middle token
            const parts = action.split("_");
            const category = parts.length > 2 ? parts.slice(1).join(" ") : "System Configuration";

            if (!acc[category]) acc[category] = [];
            acc[category].push(action);
            return acc;
        }, {} as Record<string, string[]>);
    }, [adminPermissions]);

    const handleTogglePermission = (action: string) => {
        if (selectedPermissionActions.includes(action)) {
            onChangePermissions(selectedPermissionActions.filter((act) => act !== action));
        } else {
            onChangePermissions([...selectedPermissionActions, action]);
        }
    };

    const handleSelectAllInAdminScope = () => {
        if (selectedPermissionActions.length === adminPermissions.length) {
            onChangePermissions([]);
        } else {
            onChangePermissions([...adminPermissions]);
        }
    };

    return (
        <div className="space-y-6 bg-white border border-red-100 shadow-sm rounded-3xl p-6">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
                        <ShieldX className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="font-bold text-base text-gray-900">{t("granted_scopes_core")}</h3>
                        <p className="text-xs text-gray-400 font-mono">{t("target_context_id")}: {adminId}</p>
                    </div>
                </div>

                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAllInAdminScope}
                    className="rounded-xl font-semibold text-xs text-red-600 border-red-100 bg-red-50/30 hover:bg-red-50 self-end sm:self-center"
                >
                    {selectedPermissionActions.length === adminPermissions.length ? t("deselect_all_listed") : t("select_all_available")}
                </Button>
            </div>

            <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-3 flex gap-2.5 items-start">
                <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-700 leading-normal">
                    {t("checking_elements_here_queues_them")}
                </p>
            </div>

            <div className="space-y-8">
                {Object.entries(modulesMap).map(([moduleName, actions]) => (
                    <div key={moduleName} className="space-y-3">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2" />
                            {moduleName}
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {actions.map((action) => {
                                const isMarkedForDeletion = selectedPermissionActions.includes(action);
                                return (
                                    <div
                                        key={action}
                                        onClick={() => handleTogglePermission(action)}
                                        className={cn(
                                            "flex items-start space-x-3 p-4 rounded-2xl border cursor-pointer transition-all duration-150 select-none",
                                            isMarkedForDeletion
                                                ? "border-red-200 bg-red-50/40 shadow-xs"
                                                : "border-gray-100 bg-white hover:bg-gray-50/60"
                                        )}
                                    >
                                        <div onClick={(e) => e.stopPropagation()} className="pt-0.5">
                                            <Checkbox
                                                checked={isMarkedForDeletion}
                                                onCheckedChange={() => handleTogglePermission(action)}
                                                className="transition-colors data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                                            />
                                        </div>

                                        <div className="space-y-0.5">
                                            <p className={cn(
                                                "font-bold text-sm font-mono tracking-tight transition-colors",
                                                isMarkedForDeletion ? "text-red-900 line-through opacity-80" : "text-gray-800"
                                            )}>
                                                {action}
                                            </p>
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