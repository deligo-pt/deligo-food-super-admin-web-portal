import { useTranslation } from "@/hooks/use-translation";
import { FileText } from "lucide-react";
import Section from "./Section";
import { DocumentViewer, IDocSection } from "@/components/common/DocumentViewer";

export interface IPartnerDocs {
    idProofFront?: string;
    idProofBack?: string;
    drivingLicenseFront?: string;
    drivingLicenseBack?: string;
    vehicleRegistration?: string;
    criminalRecordCertificate?: string;
    activity?: string;
    insurancePolicy?: string;
    myPhoto?: string;
}

interface IPartner {
    documents?: IPartnerDocs;
}

const PARTNER_DOC_MAP: { key: keyof IPartnerDocs; labelKey: string }[] = [
    { key: "idProofFront", labelKey: "id_proof_front" },
    { key: "idProofBack", labelKey: "id_proof_back" },
    { key: "drivingLicenseFront", labelKey: "driving_license_front" },
    { key: "drivingLicenseBack", labelKey: "driving_license_back" },
    { key: "vehicleRegistration", labelKey: "vehicle_registration" },
    { key: "criminalRecordCertificate", labelKey: "criminal_record_certificate" },
    { key: "activity", labelKey: "activity" },
    { key: "insurancePolicy", labelKey: "insurance_policy" },
    { key: "myPhoto", labelKey: "my_photo" },
];

export function PartnerDetailsDoc({ partner }: { partner: IPartner }) {
    const { t } = useTranslation();

    const sections: IDocSection[] = PARTNER_DOC_MAP.map(({ key, labelKey }) => ({
        key,
        label: t(labelKey),
        files: partner.documents?.[key],
    }));

    return (
        <Section title={t("documents")} icon={<FileText />}>
            <DocumentViewer sections={sections} />
        </Section>
    );
}