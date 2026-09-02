/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import TitleHeader from "@/components/TitleHeader/TitleHeader";
import AgreementForm from "./AgreementForm";
import { useTranslation } from "@/hooks/use-translation";
import { createDraftAgreement } from "@/services/dashboard/agreement/agreement.service";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";

const CreateDraftAgreement = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (data: any) => {
        const toastId = toast.loading("Creating draft agreement...");
        setIsSubmitting(true);

        const res = await createDraftAgreement(data);

        if (res?.success) {
            toast.success("Draft agreement created successfully!", { id: toastId });
            setIsSubmitting(false);
            router.push('/admin/agreements/all');
            return;
        };

        toast.error(res?.message || "Failed to create draft agreement.", { id: toastId });
        setIsSubmitting(false);
    };

    return (
        <div>
            <TitleHeader
                title={t("create_draft_agreement")}
                subtitle={t("create_draft_agreement_subtitle")}
            />

            {/* agreement form */}
            <AgreementForm
                onSubmit={handleSubmit}
                submitLabel={t("create_draft_agreement")}
                isSubmitting={isSubmitting}
            />
        </div>
    );
};

export default CreateDraftAgreement;