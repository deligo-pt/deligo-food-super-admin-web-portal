/* eslint-disable @typescript-eslint/no-explicit-any */
// components/Agreement/CreateUserAgreement.tsx
"use client";

import { motion } from "framer-motion";
import { ArrowLeftCircle, Briefcase, FileText, Save, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useTranslation } from "@/hooks/use-translation";
import { Input } from "@/components/ui/input";
import {
    AGREEMENT_TYPE_BY_ROLE,
    AgreementRole,
    getUserAgreementSchema,
    TUserAgreementForm,
} from "@/validations/agreements/agreement.validation";
import { createAgreement } from "@/services/dashboard/agreement/agreement.service";

interface CreateUserAgreementProps {
    user: { userId: string;[key: string]: any };
    role: AgreementRole;
    onSuccess?: (agreement: any) => void;

    successRedirectPath?: (agreementId: string) => string;
    showBackButton?: boolean;
    title?: string;
    subtitle?: string;
    embedded?: boolean;
}

export default function CreateUserAgreement({
    user,
    role,
    onSuccess,
    successRedirectPath,
    showBackButton = true,
    title,
    subtitle,
    embedded = false,
}: CreateUserAgreementProps) {
    const { t } = useTranslation();
    const router = useRouter();

    const schema = getUserAgreementSchema(role);

    const form = useForm<TUserAgreementForm>({
        resolver: zodResolver(schema),
        defaultValues: {
            signatoryType: "SELF",
            partyRepresentativeName: "",
            partyRepresentativeRole: "",
        },
    });

    const {
        formState: { isSubmitting },
    } = form;

    const signatoryType = form.watch("signatoryType");

    // Only VENDOR needs the role field
    const showRepresentativeRole = role === "VENDOR";

    const onSubmit = async (data: TUserAgreementForm) => {
        const toastId = toast.loading("Creating agreement...");

        const payload: Record<string, string> = {
            agreementType: AGREEMENT_TYPE_BY_ROLE[role],
            signatoryType: data.signatoryType,
        };

        if (data.signatoryType === "AUTHORIZED_REPRESENTATIVE") {
            payload.partyRepresentativeName = data.partyRepresentativeName!.trim();

            // Only include role for VENDOR
            if (showRepresentativeRole && data.partyRepresentativeRole) {
                payload.partyRepresentativeRole = data.partyRepresentativeRole.trim();
            }
        }

        const userId = user?.userId;
        const result = await createAgreement(userId, payload);
        console.log("result", result);

        if (result?.success) {
            toast.success(result?.message || "Agreement created successfully!", {
                id: toastId,
            });

            if (onSuccess) {
                onSuccess(result.data);
                return;
            }

            const agreementId = result?.data?._id;
            const path = successRedirectPath
                ? successRedirectPath(agreementId)
                : `/become-vendor/agreement-sign?agreementId=${encodeURIComponent(agreementId)}`;

            router.push(path);
            return;
        }

        if (result?.data?.errorSources) {
            result.data.errorSources.forEach(
                (err: { path: string; message: string }) =>
                    toast.error(err?.message, { id: toastId })
            );
        } else {
            toast.error(result?.message || "Failed to create agreement", {
                id: toastId,
            });
        }
    };

    const handleFormSubmit = form.handleSubmit(onSubmit);

    const formFields = (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
                {/* Signatory Type */}
                <FormField
                    control={form.control}
                    name="signatoryType"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                <User className="w-4 h-4 text-[#DC3173]" />
                                {t("signatoryType")}
                            </FormLabel>
                            <FormControl>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder={t("selectSignatoryType")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="SELF">{t("self")}</SelectItem>
                                        <SelectItem value="AUTHORIZED_REPRESENTATIVE">
                                            {t("authorized_representative")}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {signatoryType === "AUTHORIZED_REPRESENTATIVE" && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`grid grid-cols-1 gap-4 pt-2 border-t border-gray-100 ${showRepresentativeRole ? "sm:grid-cols-2" : ""
                            }`}
                    >
                        <FormField
                            control={form.control}
                            name="partyRepresentativeName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                        <User className="w-4 h-4 text-[#DC3173]" />
                                        {t("partyRepresentativeName")}
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder={t("partyRepresentativeNamePH")}
                                            className="mt-2 w-full"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {showRepresentativeRole && (
                            <FormField
                                control={form.control}
                                name="partyRepresentativeRole"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                            <Briefcase className="w-4 h-4 text-[#DC3173]" />
                                            {t("partyRepresentativeRole")}
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder={t("partyRepresentativeRolePH")}
                                                className="mt-2 w-full"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                    </motion.div>
                )}
            </div>

            <div className="pt-4">
                <motion.button
                    type={embedded ? "button" : "submit"}
                    onClick={embedded ? handleFormSubmit : undefined}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto inline-flex items-center gap-3 justify-center px-8 py-3 bg-[#DC3173] hover:bg-[#b72a63] text-white rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-60 cursor-pointer"
                >
                    <Save className="w-5 h-5" />
                    <span className="font-semibold tracking-wide">
                        {t("create_agreement")}
                    </span>
                </motion.button>
            </div>
        </div>
    );

    // Embedded → no <form> (avoids nesting)
    // Standalone → normal <form>
    const formContent = (
        <Form {...form}>
            {embedded ? (
                <div className="space-y-6">{formFields}</div>
            ) : (
                <form onSubmit={handleFormSubmit} className="space-y-6">
                    {formFields}
                </form>
            )}
        </Form>
    );

    // ── Standalone full-page mode ──
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="min-h-screen bg-linear-to-b from-white via-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8"
        >
            <div className="max-w-3xl mx-auto">
                <Card className="rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
                    {showBackButton && (
                        <div className="relative p-0">
                            <Button
                                onClick={() => router.back()}
                                variant="link"
                                className="inline-flex items-center px-4 text-sm gap-2 text-[#DC3173] p-0 h-4 absolute -top-2 z-10 cursor-pointer"
                            >
                                <ArrowLeftCircle className="w-4 h-4" /> {t("goBack")}
                            </Button>
                        </div>
                    )}

                    <CardHeader className="bg-linear-to-r from-[#DC3173] to-pink-600 text-white p-6">
                        <div className="flex items-center gap-4">
                            <div className="rounded-xl bg-white/25 p-3 shadow-md">
                                <FileText className="w-7 h-7 text-white" />
                            </div>
                            <CardTitle className="text-xl font-semibold tracking-wide">
                                {title || t("create_vendor_agreement")}
                            </CardTitle>
                        </div>
                        <p className="mt-3 text-sm text-white/90 max-w-xl leading-relaxed">
                            {subtitle || t("select_your_signatory_type")}
                        </p>
                    </CardHeader>

                    <CardContent className="p-6 sm:p-8 bg-white">
                        {formContent}
                    </CardContent>
                </Card>
            </div>
        </motion.div>
    );
}