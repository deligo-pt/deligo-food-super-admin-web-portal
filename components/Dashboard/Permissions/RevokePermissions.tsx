"use client";

import { useCallback, useState, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { toast } from "sonner";
import { Trash2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

import { AdminListCardComponent } from "./AdminListCard";
import { RevocationMatrix } from "./RevocationMatrix";
import { TAdmin } from "@/types/admin.type";
import { TSystemPermission } from "@/types/permission.type";
import { useTranslation } from "@/hooks/use-translation";

const REVOKE_COLOR = "#E11D48"; // Danger Red accent color 

// Simple validation schema enforcing targeting bounds
const revokePermissionValidation = z.object({
    adminId: z.string().min(1, { message: "Please select an administrative account resource." }),
    permissionIds: z.array(z.string()).min(1, { message: "Select at least one permission block to strip." }),
});

type TRevokePermissionForm = z.infer<typeof revokePermissionValidation>;

interface RevokePermissionsProps {
    admins: TAdmin[];
    permissions: TSystemPermission[];
}

export default function RevokePermissions({ admins = [], permissions = [] }: RevokePermissionsProps) {
    const { t } = useTranslation();
    const router = useRouter();
    const [isConfirming, setIsConfirming] = useState(false);

    const form = useForm<TRevokePermissionForm>({
        resolver: zodResolver(revokePermissionValidation),
        defaultValues: {
            adminId: "",
            permissionIds: [],
        },
    });

    const { formState: { isSubmitting }, control, setValue, handleSubmit } = form;

    const watchedAdminId = useWatch({ control, name: "adminId" });
    const watchedPermissionIds = useWatch({ control, name: "permissionIds" });

    // Locate the complete data model for the currently selected admin profile
    const activeAdminProfile = useMemo(() => {
        return admins.find((a) => a.userId === watchedAdminId) || null;
    }, [admins, watchedAdminId]);

    // Handle Admin User Context selection updates safely
    const handleSelectAdmin = useCallback((id: string) => {
        setValue("adminId", id, { shouldValidate: true });
        setValue("permissionIds", []); // Clear target checklist whenever target changes
    }, [setValue]);

    // Handle changes safely inside the checked list array matrix
    const handleMatrixSelectionChange = useCallback((ids: string[]) => {
        setValue("permissionIds", ids, { shouldValidate: true, shouldDirty: true });
    }, [setValue]);

    const onSubmit = async (data: TRevokePermissionForm) => {
        try {
            console.log(`Target Routing Target: permissions/revoke-permissions/${data.adminId}`);
            console.log("Payload Construction Summary:", { permissionIds: data.permissionIds });

            // Integration point linking up your dynamic endpoint invocation:
            // await axios.patch(`permissions/revoke-permissions/${data.adminId}`, { permissionIds: data.permissionIds });

            await new Promise((resolve) => setTimeout(resolve, 1200));

            toast.success(`Access scopes stripped safely from Admin account identifier: ${data.adminId}`);
            form.reset();
        } catch (error) {
            toast.error("Failed to safely prune target configuration permissions matrix.");
            console.error(error);
        }
    };

    return (
        <div className="min-h-screen">
            <div className="space-y-8">

                {/* TOP INTERACTIVE ACTION HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <TitleHeader
                        title="Revoke System Permissions"
                        subtitle="Identify administrative targets to peel back explicit system authorization vectors cleanly."
                    />
                </div>

                <Form {...form}>
                    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                        {/* LEFT PROFILE & PANEL COLUMN */}
                        <div className="lg:col-span-4 space-y-6">
                            <FormField
                                control={control}
                                name="adminId"
                                render={() => (
                                    <FormItem>
                                        <AdminListCardComponent
                                            admins={admins}
                                            selectedAdminId={watchedAdminId}
                                            onSelectAdmin={handleSelectAdmin}
                                        />
                                        <FormMessage className="px-2 text-rose-600 font-medium text-xs" />
                                    </FormItem>
                                )}
                            />

                            {/* CONTEXT ACCELERATED SUMMARY BOX */}
                            {watchedPermissionIds.length > 0 && activeAdminProfile && (
                                <div className="bg-white border border-red-100 rounded-3xl p-5 shadow-sm space-y-4">
                                    <div className="space-y-1">
                                        <h4 className="font-bold text-sm text-gray-900">Revocation Summary</h4>
                                        <p className="text-xs text-gray-400">
                                            You are cutting <span className="font-bold text-red-600">{watchedPermissionIds.length}</span> clearance tokens from {activeAdminProfile?.name?.firstName}.
                                        </p>
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full h-11 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99]"
                                        style={{ backgroundColor: REVOKE_COLOR }}
                                        disabled={isSubmitting}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        {isSubmitting ? "Stripping Scopes..." : "Confirm Revocation"}
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* RIGHT COLUMN: INTERACTIVE STRIP MATRIX SELECTION ROW */}
                        <div className="lg:col-span-8">
                            {!watchedAdminId ? (
                                <div className="flex flex-col items-center justify-center p-20 text-center border-2 border-dashed border-red-200/60 rounded-3xl bg-white/70 backdrop-blur-sm">
                                    <span className="text-4xl mb-3">👤</span>
                                    <h4 className="font-bold text-gray-700 text-base">Awaiting Admin Profile Target</h4>
                                    <p className="text-xs text-gray-400 max-w-xs mt-1">
                                        Please click an administrative profile item from the registry list on the left to verify real-time active rights.
                                    </p>
                                </div>
                            ) : (
                                <FormField
                                    control={control}
                                    name="permissionIds"
                                    render={() => (
                                        <FormItem>
                                            <RevocationMatrix
                                                permissions={permissions}
                                                selectedPermissionIds={watchedPermissionIds}
                                                onChangePermissions={handleMatrixSelectionChange}
                                                adminId={watchedAdminId}
                                            />
                                            <FormMessage className="px-2 text-rose-600 font-medium text-xs" />
                                        </FormItem>
                                    )}
                                />
                            )}
                        </div>

                    </form>
                </Form>
            </div>
        </div>
    );
}