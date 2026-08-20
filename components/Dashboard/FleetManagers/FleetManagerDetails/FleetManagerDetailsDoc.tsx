import { DocumentViewer, IDocSection } from "@/components/common/DocumentViewer";
import { useTranslation } from "@/hooks/use-translation";

export interface IFleetDocs {
  businessLicense?: string[];
  idProofFront?: string[];
  idProofBack?: string[];
  activityDocument?: string[];
  myPhoto?: string[];
  proofOfAddress?: string[];
  ibanProof?: string[];
}

interface IProps {
  documents: IFleetDocs | undefined;
}

const DOC_TRANSLATION_MAP: Record<keyof IFleetDocs, string> = {
  idProofFront: "id_proof_front",
  idProofBack: "id_proof_back",
  businessLicense: "business_license",
  activityDocument: "activity_document",
  myPhoto: "my_photo",
  proofOfAddress: "proof_of_address",
  ibanProof: "iban_proof",
};

export default function FleetManagerDetailsDoc({ documents }: IProps) {
  const { t } = useTranslation();

  const sections: IDocSection[] = (
    Object.keys(DOC_TRANSLATION_MAP) as (keyof IFleetDocs)[]
  ).map((key) => ({
    key,
    label: t(DOC_TRANSLATION_MAP[key]),
    files: documents?.[key] || [],
  }));

  return <DocumentViewer sections={sections} emptyMessageKey="no_document_uploaded" />;
}