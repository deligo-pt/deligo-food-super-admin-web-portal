"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { TSystemPermission } from "@/types/permission.type";
import { ShieldX, AlertCircle } from "lucide-react";

interface RevocationMatrixProps {
    permissions: TSystemPermission[];
    selectedPermissionIds: string[];
    onChangePermissions: (ids: string[]) => void;
    adminId: string;
}

export function RevocationMatrix({
    permissions = [],
    selectedPermissionIds = [],
    onChangePermissions,
    adminId,
}: RevocationMatrixProps) {

    // Categorize standard module definitions map properties array records structure
    const modulesMap = useMemo(() => {
        return permissions.reduce((acc, perm) => {
            if (!acc[perm.module]) acc[perm.module] = [];
            acc[perm.module].push(perm);
            return acc;
        }, {} as Record<string, TSystemPermission[]>);
    }, [permissions]);

    const handleTogglePermission = (id: string) => {
        if (selectedPermissionIds.includes(id)) {
            onChangePermissions(selectedPermissionIds.filter((pId) => pId !== id));
        } else {
            onChangePermissions([...selectedPermissionIds, id]);
        }
    };

    const handleSelectAllInAdminScope = () => {
        if (selectedPermissionIds.length === permissions.length) {
            onChangePermissions([]);
        } else {
            onChangePermissions(permissions.map((p) => p._id));
        }
    };

    return (
        <div className="space-y-6 bg-white border border-red-100 shadow-sm rounded-3xl p-6">

            {/* SECTION BANNER SUMMARY */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
                        <ShieldX className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="font-bold text-base text-gray-900">Granted Scopes Core</h3>
                        <p className="text-xs text-gray-400 font-mono">Target Context ID: {adminId}</p>
                    </div>
                </div>

                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAllInAdminScope}
                    className="rounded-xl font-semibold text-xs text-red-600 border-red-100 bg-red-50/30 hover:bg-red-50 self-end sm:self-center"
                >
                    {selectedPermissionIds.length === permissions.length ? "Deselect All Listed" : "Select All Available"}
                </Button>
            </div>

            {/* DANGEROUS INTENT ALERT LOG NOTE */}
            <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-3 flex gap-2.5 items-start">
                <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-700 leading-normal">
                    Checking elements here queues them up for immediate deletion. Once submitted, the matching user credentials session payload loses routing permission instantly.
                </p>
            </div>

            {/* MATRIX SEGMENTS CONTAINER GRID */}
            <div className="space-y-8">
                {Object.entries(modulesMap).map(([moduleName, modulePerms]) => (
                    <div key={moduleName} className="space-y-3">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2" />
                            {moduleName} Module
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {modulePerms.map((perm) => {
                                const isMarkedForDeletion = selectedPermissionIds.includes(perm._id);
                                return (
                                    <div
                                        key={perm._id}
                                        onClick={() => handleTogglePermission(perm._id)}
                                        className={cn(
                                            "flex items-start space-x-3 p-4 rounded-2xl border cursor-pointer transition-all duration-150 select-none",
                                            isMarkedForDeletion
                                                ? "border-red-200 bg-red-50/40 shadow-xs"
                                                : "border-gray-100 bg-white hover:bg-gray-50/60"
                                        )}
                                    >
                                        {/* Explicitly halt propagation to bypass event bubbling loop crashes */}
                                        <div onClick={(e) => e.stopPropagation()} className="pt-0.5">
                                            <Checkbox
                                                checked={isMarkedForDeletion}
                                                onCheckedChange={() => handleTogglePermission(perm._id)}
                                                className={cn(
                                                    "transition-colors data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                                                )}
                                            />
                                        </div>

                                        <div className="space-y-0.5">
                                            <p className={cn(
                                                "font-bold text-sm font-mono tracking-tight transition-colors",
                                                isMarkedForDeletion ? "text-red-900 line-through opacity-80" : "text-gray-800"
                                            )}>
                                                {perm.action}
                                            </p>
                                            {perm.description && (
                                                <p className="text-xs text-gray-400 leading-normal line-clamp-2">
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