"use client";

import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useTranslation } from "@/hooks/use-translation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { AdminListCardComponent } from "./AdminListCard";
import { SelectionSummaryCard } from "./SelectionSummaryCard";
import { TSystemPermission } from "@/types/permission.type";
import { assignPermissionValidation, TAssignPermissionForm } from "@/validations/permissions/permissions.validation";
import { PermissionsMatrix } from "./PermissionMatrix";
import { TAdmin } from "@/types/admin.type";
import { useCallback } from "react";
import { toast } from "sonner";
import { assignPermissionToAdminReq } from "@/services/dashboard/permissions/permissions.service";

const PRIMARY_COLOR = "#DC3173";

interface AssignPermissionsProps {
    admins: TAdmin[];
    permissions: TSystemPermission[];
}

export default function AssignPermissions({ admins = [], permissions = [] }: AssignPermissionsProps) {
    const { t } = useTranslation();
    const form = useForm<TAssignPermissionForm>({
        resolver: zodResolver(assignPermissionValidation),
        defaultValues: {
            adminId: "",
            permissionIds: [],
        },
    });

    const { formState: { isSubmitting }, control, setValue, reset } = form;

    const watchedAdminId = useWatch({ control, name: "adminId" });
    const watchedPermissionIds = useWatch({ control, name: "permissionIds" });


    const handleSelectAdmin = useCallback((id: string) => {
        setValue("adminId", id, { shouldValidate: true });
    }, [setValue]);

    const handleClearAllPermissions = useCallback(() => {
        setValue("permissionIds", [], { shouldValidate: true });
        setValue("adminId", "", { shouldValidate: true });
    }, [setValue]);

    const handlePermissionsMatrixChange = useCallback((ids: string[]) => {
        setValue("permissionIds", ids, {
            shouldValidate: true,
            shouldDirty: true
        });
    }, [setValue]);

    const onSubmit = async (data: TAssignPermissionForm) => {
        const toastId = toast.loading("Assigning....");
        const payload = {
            permissionIds: data?.permissionIds,
        };

        const result = await assignPermissionToAdminReq(data?.adminId, payload);
        console.log("result", result);

        if (result?.success) {
            toast.success(result?.message || "Permission assigned successfully", { id: toastId });
            reset();
            return;
        } else {
            toast.error(result?.message || "Permission assigning failed!", { id: toastId });
        };
    };

    return (
        <div className="min-h-screen">
            <div className="space-y-8">
                <TitleHeader
                    title={t("assign_permissions")}
                    subtitle={t("configure_and_map_access_control_levels_for_specific_administrative_roles")}
                />

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                        {/* LEFT COMPACT SIDE PANEL COLUMN */}
                        <div className="lg:col-span-4 space-y-6">
                            {/* ADMIN ACCOUNT PICKER */}
                            <FormField
                                control={form.control}
                                name="adminId"
                                render={() => (
                                    <FormItem>
                                        <AdminListCardComponent
                                            admins={admins}
                                            selectedAdminId={watchedAdminId}
                                            onSelectAdmin={handleSelectAdmin} // ⚡ Clean reference passed here
                                        />
                                        <FormMessage className="px-2" />
                                    </FormItem>
                                )}
                            />

                            {/* FLOATING ACTION SUMMARY INSIGHTS MATRIX */}
                            <SelectionSummaryCard
                                permissions={permissions}
                                selectedPermissionIds={watchedPermissionIds}
                                selectedAdminId={watchedAdminId}
                                onClearAll={handleClearAllPermissions} // ⚡ Clean reference passed here
                                isSubmitting={isSubmitting}
                                submitColor={PRIMARY_COLOR}
                            />
                        </div>

                        {/* RIGHT MAIN SYSTEM PERMISSIONS CHECKBOX MATRIX LIST */}
                        <div className="lg:col-span-8">
                            <FormField
                                control={form.control}
                                name="permissionIds"
                                render={() => (
                                    <FormItem>
                                        {/* Inside AssignPermissionsPage.tsx */}
                                        <PermissionsMatrix
                                            permissions={permissions}
                                            selectedPermissionIds={watchedPermissionIds}
                                            onChangePermissions={handlePermissionsMatrixChange} // ⚡ Clean reference passed here
                                        />
                                        <FormMessage className="px-2" />
                                    </FormItem>
                                )}
                            />
                        </div>

                    </form>
                </Form>
            </div>
        </div>
    );
}