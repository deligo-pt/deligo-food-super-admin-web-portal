import { DocumentViewer, IDocSection } from "@/components/common/DocumentViewer";
import { useTranslation } from "@/hooks/use-translation";

export interface IVendorDocs {
  myPhoto?: string[];
  businessLicenseDoc?: string[];
  taxDoc?: string[];
  idProofFront?: string[];
  idProofBack?: string[];
  storePhoto?: string[];
  menuUpload?: string[];
  agoserisHaccpCertificate?: string[];
  ibanProof?: string[];
}

interface IProps {
  documents: IVendorDocs | undefined;
}

const DOC_TRANSLATION_MAP: Record<keyof IVendorDocs, string> = {
  myPhoto: "vendor_photo",
  idProofFront: "id_proof_front",
  idProofBack: "id_proof_back",
  businessLicenseDoc: "business_license",
  taxDoc: "tax_document",
  storePhoto: "store_photo",
  menuUpload: "menu_brochure",
  agoserisHaccpCertificate: "agoserisHaccpCertificate",
  ibanProof: "iban_proof",
};

export default function VendorDetailsDoc({ documents }: IProps) {
  const { t } = useTranslation();

  const sections: IDocSection[] = (
    Object.keys(DOC_TRANSLATION_MAP) as (keyof IVendorDocs)[]
  ).map((key) => ({
    key,
    label: t(DOC_TRANSLATION_MAP[key]),
    files: documents?.[key] || [],
  }));

  return <DocumentViewer sections={sections} emptyMessageKey="no_documents_uploaded" />;
}