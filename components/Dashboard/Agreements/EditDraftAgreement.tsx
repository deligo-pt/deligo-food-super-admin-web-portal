
'use client';

import TitleHeader from "@/components/TitleHeader/TitleHeader";
import AgreementForm, { AgreementFormValues } from "./AgreementForm";
import { useTranslation } from "@/hooks/use-translation";
import { updateDraftAgreement } from "@/services/dashboard/agreement/agreement.service";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { IAgreementVersion } from "@/types/agreement.type";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const EditDraftAgreement = ({ agreement }: { agreement: IAgreementVersion }) => {
    const { t } = useTranslation();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (data: Partial<AgreementFormValues>) => {
        const toastId = toast.loading("Updating draft agreement...");
        setIsSubmitting(true);

        if (data.agreementType) {
            delete data.agreementType;
        };

        const res = await updateDraftAgreement(data, agreement?._id);

        if (res?.success) {
            toast.success("Draft agreement updated successfully!", { id: toastId });
            setIsSubmitting(false);
            router.back();
            return;
        };

        toast.error(res?.message || "Failed to update draft agreement.", { id: toastId });
        setIsSubmitting(false);
    };

    return (
        <div>
            <>
                <Button
                    variant="link"
                    size="sm"
                    onClick={() => router.back()}
                    className="flex items-center gap-1.5 text-sm text-[#DC3173] p-0 hover:bg-transparent"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {t("go_back")}
                </Button>
            </>
            <TitleHeader
                title={t("edit_draft_agreement")}
                subtitle={t("edit_draft_agreement_subtitle")}
            />

            {/* agreement form */}
            <AgreementForm
                onSubmit={handleSubmit}
                submitLabel={t("edit_draft_agreement")}
                isSubmitting={isSubmitting}
                defaultValues={agreement}
            />
        </div>
    );
};

export default EditDraftAgreement;