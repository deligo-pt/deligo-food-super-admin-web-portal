"use client";

import { useCallback, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Trash2, ShieldCheck } from "lucide-react";

import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

import { AdminListCardComponent } from "./AdminListCard";
import { RevocationMatrix } from "./RevocationMatrix";
import { TAdmin } from "@/types/admin.type";
import { revokePermissionValidation, TRevokePermissionForm } from "@/validations/permissions/permissions.validation";
import { revokePermissionFromAdminReq } from "@/services/dashboard/permissions/permissions.service";
import { useTranslation } from "@/hooks/use-translation";

const REVOKE_COLOR = "#E11D48";

interface RevokePermissionsProps {
    admins: TAdmin[];
}

export default function RevokePermissions({ admins = [] }: RevokePermissionsProps) {
    const { t } = useTranslation();
    const form = useForm<TRevokePermissionForm>({
        resolver: zodResolver(revokePermissionValidation),
        defaultValues: {
            adminId: "",
            permissionActions: [],
        },
    });

    const { formState: { isSubmitting }, control, setValue, handleSubmit, reset } = form;

    const watchedAdminId = useWatch({ control, name: "adminId" });
    const watchedPermissionActions = useWatch({ control, name: "permissionActions" });

    // Directly isolate the single selected admin profile from state
    const activeAdminProfile = useMemo(() => {
        return admins.find((a) => a.userId === watchedAdminId) || null;
    }, [admins, watchedAdminId]);

    // Pull the raw dynamic permission strings assigned to this target admin profile
    const adminActiveActionStrings = useMemo(() => {
        return activeAdminProfile?.permissions || [];
    }, [activeAdminProfile]);

    const handleSelectAdmin = useCallback((id: string) => {
        setValue("adminId", id, { shouldValidate: true });
        setValue("permissionActions", []);
    }, [setValue]);

    const handleMatrixSelectionChange = useCallback((actions: string[]) => {
        setValue("permissionActions", actions, { shouldValidate: true, shouldDirty: true });
    }, [setValue]);

    const onSubmit = async (data: TRevokePermissionForm) => {
        const toastId = toast.loading("Revoking permission...");
        const payload = { permissionActions: data?.permissionActions };

        const result = await revokePermissionFromAdminReq(data?.adminId, payload);

        if (result?.success) {
            toast.success(result?.message || "Permissions removed successfully.", { id: toastId });
            reset();
        } else {
            toast.error(result?.message || "Revocation sequence encountered an issue.", { id: toastId });
        }
    };

    return (
        <div className="min-h-screen">
            <div className="space-y-8">
                <TitleHeader
                    title={t("revoke_system_permissions")}
                    subtitle={t("identify_administrative_targets")}
                />

                <Form {...form}>
                    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

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

                            {watchedPermissionActions.length > 0 && activeAdminProfile && (
                                <div className="bg-white border border-red-100 rounded-3xl p-5 shadow-sm space-y-4">
                                    <div className="space-y-1">
                                        <h4 className="font-bold text-sm text-gray-900">{t("Revocation")}</h4>
                                        <p className="text-xs text-gray-400">
                                            {t("you_are_cutting")} <span className="font-bold text-red-600">{watchedPermissionActions.length}</span> {t("clearance_tokens_from")}{activeAdminProfile?.name?.firstName}.
                                        </p>
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full h-11 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99]"
                                        style={{ backgroundColor: REVOKE_COLOR }}
                                        disabled={isSubmitting}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        {isSubmitting ? "Stripping Scopes..." : t("confirm_revocation")}
                                    </Button>
                                </div>
                            )}
                        </div>

                        <div className="lg:col-span-8">
                            {!watchedAdminId ? (
                                <div className="flex flex-col items-center justify-center p-20 text-center border-2 border-dashed border-red-200/60 rounded-3xl bg-white/70 backdrop-blur-sm">
                                    <span className="text-4xl mb-3">👤</span>
                                    <h4 className="font-bold text-gray-700 text-base">{t("awaiting_admin_profile_target")}</h4>
                                    <p className="text-xs text-gray-400 max-w-xs mt-1">
                                        {t("please_click_an_administrative_profile")}
                                    </p>
                                </div>
                            ) : adminActiveActionStrings.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-20 text-center border-2 border-dashed border-gray-200 rounded-3xl bg-white">
                                    <div className="w-12 h-12 bg-green-50 border border-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-4">
                                        <ShieldCheck className="w-6 h-6" />
                                    </div>
                                    <h4 className="font-bold text-gray-800 text-base">{t("no_permissions_assigned")}</h4>
                                    <p className="text-xs text-gray-400 max-w-sm mt-1">
                                        {t("this_administrative_profile_doesnt_hold")}
                                    </p>
                                </div>
                            ) : (
                                <FormField
                                    control={control}
                                    name="permissionActions"
                                    render={() => (
                                        <FormItem>
                                            <RevocationMatrix
                                                adminPermissions={adminActiveActionStrings}
                                                selectedPermissionActions={watchedPermissionActions}
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