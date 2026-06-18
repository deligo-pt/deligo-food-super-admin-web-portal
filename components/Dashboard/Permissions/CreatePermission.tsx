"use client";

import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";
import { createPermissionReq } from "@/services/dashboard/permissions/permissions.service";
import { MODULE_GROUPS, permissionActions, permissionValidation, } from "@/validations/permissions/permissons.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const PRIMARY = "#DC3173";

type TPermissionForm = z.input<typeof permissionValidation>;

export default function CreatePermission() {
    const { t } = useTranslation();
    const router = useRouter();

    const form = useForm<TPermissionForm>({
        resolver: zodResolver(permissionValidation),
        defaultValues: {
            name: "",
            action: undefined,
            module: undefined,
            displayName: "",
            description: "",
            isSystemDefined: false,
            isActive: true,
        },
    });

    const { formState: { isSubmitting } } = form;

    const onSubmit = async (data: TPermissionForm) => {
        const toastId = toast.loading("Creating permisson...");

        const result = await createPermissionReq(data);

        if (result?.success) {
            toast.success(result?.message || "Permission created successfully", { id: toastId });
            router.push('/admin/permissions');
            return;
        } else {
            toast.error(result?.message || "Permission creation failed!", { id: toastId });
        };
    };

    return (
        <div className="min-h-screen">
            <div className="">
                <TitleHeader
                    title={t("create_permission")}
                    subtitle={t("configure_access_control_rules_for_staff")}
                />

                <Card className="rounded-3xl bg-white border shadow-lg">
                    <CardContent className="p-0">
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="p-6 space-y-8"
                            >
                                {/* PERMISSION CORE CONFIG */}
                                <div className="space-y-4">
                                    <h2 className="font-bold text-lg">{t("permission_details")}</h2>
                                    <Separator />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* NAME */}
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="space-y-2">
                                                        <FormLabel className="font-medium text-sm text-gray-700">
                                                            {t("permission_name")} *
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="e.g., Manage Analytics"
                                                                className="h-12 text-base"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                    </div>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* DISPLAY NAME (LOCALIZED/PRETTIER UI) */}
                                        <FormField
                                            control={form.control}
                                            name="displayName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="space-y-2">
                                                        <FormLabel className="font-medium text-sm text-gray-700">
                                                            {t("display_name")}
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Control Order panel"
                                                                className="h-12 text-base"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                    </div>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* SYSTEM ACTION CODE */}
                                        <FormField
                                            control={form.control}
                                            name="action"
                                            render={({ field, fieldState }) => (
                                                <FormItem>
                                                    <div className="space-y-2">
                                                        <FormLabel className="font-medium text-sm text-gray-700">
                                                            {t("system_action_code")} *
                                                        </FormLabel>
                                                        <Select
                                                            onValueChange={field.onChange}
                                                            value={field.value}
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger
                                                                    className={cn(
                                                                        "w-full h-12 text-base",
                                                                        fieldState.invalid ? "border-destructive" : ""
                                                                    )}
                                                                >
                                                                    <SelectValue placeholder="Select System Action" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {permissionActions.map((action) => (
                                                                    <SelectItem key={action.label} value={action.value}>
                                                                        {action.label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* DASHBOARD MODULE GROUP */}
                                        <FormField
                                            control={form.control}
                                            name="module"
                                            render={({ field, fieldState }) => (
                                                <FormItem>
                                                    <div className="space-y-2">
                                                        <FormLabel className="font-medium text-sm text-gray-700">
                                                            {t("dashboard_module_group")} *
                                                        </FormLabel>
                                                        <Select
                                                            onValueChange={field.onChange}
                                                            value={field.value}
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger
                                                                    className={cn(
                                                                        "w-full h-12 text-base",
                                                                        fieldState.invalid ? "border-destructive" : ""
                                                                    )}
                                                                >
                                                                    <SelectValue placeholder="Select Module Category" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {MODULE_GROUPS.map((mod) => (
                                                                    <SelectItem key={mod} value={mod}>
                                                                        {mod}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* DESCRIPTION */}
                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <div className="space-y-2">
                                                    <FormLabel className="font-medium text-sm text-gray-700">
                                                        {t("description")}
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="Describe what access capabilities this permission unlocks for backend admin configurations..."
                                                            className="text-base"
                                                            rows={4}
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* ADVANCED FLAG CONTROLS */}
                                <div className="space-y-4">
                                    <h2 className="font-bold text-lg">{t("system_status_and_restrictions")}</h2>
                                    <Separator />

                                    <div className="flex flex-col sm:flex-row gap-6 pt-2">
                                        {/* IS ACTIVE CHECKBOX */}
                                        <FormField
                                            control={form.control}
                                            name="isActive"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-xl border p-4 bg-gray-50/50 flex-1">
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                    <div className="space-y-1 leading-none">
                                                        <FormLabel className="font-semibold text-sm text-gray-800">
                                                            {t("globally_active_status")}
                                                        </FormLabel>
                                                        <FormDescription>
                                                            {t("instantly_toggle_access")}
                                                        </FormDescription>
                                                    </div>
                                                </FormItem>
                                            )}
                                        />

                                        {/* IS SYSTEM DEFINED CHECKBOX */}
                                        <FormField
                                            control={form.control}
                                            name="isSystemDefined"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-xl border p-4 bg-gray-50/50 flex-1">
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                    <div className="space-y-1 leading-none">
                                                        <FormLabel className="font-semibold text-sm text-gray-800">
                                                            {t("system_protected_core")}
                                                        </FormLabel>
                                                        <FormDescription>
                                                            {t("lock_entry_to_prevent_casual")}
                                                        </FormDescription>
                                                    </div>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* FORM CONTROLS */}
                                <div className="pt-4 flex justify-end gap-4">
                                    <Button type="button" variant="outline" className="h-12 px-6 text-base">
                                        {t("cancel")}
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="h-12 px-6 text-base text-white"
                                        style={{ background: PRIMARY }}
                                        disabled={isSubmitting}
                                    >
                                        {t("create_permission")}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}