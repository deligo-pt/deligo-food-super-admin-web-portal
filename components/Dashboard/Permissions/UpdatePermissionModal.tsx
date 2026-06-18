"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Shield, AlertTriangle } from "lucide-react";
import { toast } from "sonner"; // Feel free to swap with your system's toast setup

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

import { TSystemPermission } from "@/types/permission.type";
import { useTranslation } from "@/hooks/use-translation";
import { updatePermissionValidation } from "@/validations/permissions/permissons.validation";
import { updatePermissionReq } from "@/services/dashboard/permissions/permissions.service";
import { useRouter } from "next/navigation";


type TUpdatePermissionForm = z.input<typeof updatePermissionValidation>;

interface UpdatePermissionModalProps {
    isOpen: boolean;
    onClose: () => void;
    permission: TSystemPermission | null;
}

export default function UpdatePermissionModal({
    isOpen,
    onClose,
    permission
}: UpdatePermissionModalProps) {
    const { t } = useTranslation();
    const router = useRouter();

    const form = useForm<TUpdatePermissionForm>({
        resolver: zodResolver(updatePermissionValidation),
        defaultValues: {
            name: "",
            displayName: "",
            description: "",
            isActive: true,
        },
    });

    const { formState: { isSubmitting }, reset, handleSubmit, control } = form;

    useEffect(() => {
        if (permission) {
            reset({
                name: permission.name || "",
                displayName: permission.displayName || "",
                description: permission.description || "",
                isActive: permission.isActive ?? true,
            });
        }
    }, [permission, reset]);

    const onSubmit = async (values: TUpdatePermissionForm) => {
        if (!permission?._id) return;
        const toastId = toast.loading("Updating....")

        const result = await updatePermissionReq(values, permission?._id);

        if (result?.success) {
            toast.success(result?.message || "Permission updated successfully", { id: toastId });
            router.push('/admin/permissions');
            onClose();
            return;
        } else {
            toast.error(result?.message || "Permission updating failed!", { id: toastId });
        };
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[540px] rounded-3xl p-6 bg-white gap-6 shadow-xl border-gray-100">

                <DialogHeader className="space-y-1.5 text-left">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-[#FFF1F7] flex items-center justify-center text-[#DC3173]">
                            <Shield className="w-4 h-4" />
                        </div>
                        <DialogTitle className="text-xl font-black text-gray-900 tracking-tight">
                            Edit Permission
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-gray-500 text-xs">
                        Modify security rule parameters. Changes here update systemic metadata attributes instantly.
                    </DialogDescription>
                </DialogHeader>

                {/* IMMUTABLE SYSTEM BANNER INFO */}
                {permission && (
                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-3.5 flex items-start gap-3">
                        <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        <div className="space-y-0.5">
                            <p className="text-xs font-bold text-gray-700 uppercase tracking-tight font-mono">
                                System Key Bindings (Locked)
                            </p>
                            <p className="text-xs text-gray-500 font-mono leading-relaxed">
                                Module: <span className="text-gray-800 font-bold">{permission.module}</span> <br />
                                Action: <span className="text-gray-800 font-bold">{permission.action}</span>
                            </p>
                        </div>
                    </div>
                )}

                <Form {...form}>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                        {/* PERMISSION NAME */}
                        <FormField
                            control={control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-bold text-xs text-gray-700 uppercase tracking-wider">
                                        System Rule Name
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="e.g. Full Order Management"
                                            className="h-11 rounded-xl bg-gray-50/50 border-gray-200 text-sm font-semibold"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-xs font-medium" />
                                </FormItem>
                            )}
                        />

                        {/* DISPLAY NAME ALIAS */}
                        <FormField
                            control={control}
                            name="displayName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-bold text-xs text-gray-700 uppercase tracking-wider">
                                        UI Friendly Name / Alias
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="e.g. Manage Live Orders"
                                            className="h-11 rounded-xl bg-gray-50/50 border-gray-200 text-sm"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-xs" />
                                </FormItem>
                            )}
                        />

                        {/* FUNCTIONAL DESCRIPTION */}
                        <FormField
                            control={control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-bold text-xs text-gray-700 uppercase tracking-wider">
                                        Intent & Scope Description
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Provide functional context detailing what features this policy matrix controls..."
                                            className="min-h-[100px] rounded-2xl bg-gray-50/50 border-gray-200 resize-none text-sm leading-relaxed"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-xs" />
                                </FormItem>
                            )}
                        />

                        {/* LIFECYCLE STRATEGY ACTIVE TOGGLE SWITCH */}
                        <FormField
                            control={control}
                            name="isActive"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-2xl border border-gray-100 p-4 shadow-sm bg-white">
                                    <div className="space-y-0.5">
                                        <FormLabel className="font-bold text-xs text-gray-800 uppercase tracking-wider">
                                            Policy Enforcement State
                                        </FormLabel>
                                        <FormDescription className="text-xs text-gray-400">
                                            Disabling overrides associated mappings and prevents user routing clearance.
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        {/* ACTION FOOTER LAYER */}
                        <DialogFooter className="pt-2 gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                className="h-11 rounded-xl font-semibold text-sm border-gray-200 text-gray-600 px-5"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="h-11 rounded-xl font-bold text-sm text-white px-6 transition-all shadow-sm active:scale-98"
                                style={{ backgroundColor: "#DC3173" }}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Saving Config..." : "Save Changes"}
                            </Button>
                        </DialogFooter>

                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}