import { useTranslation } from "@/hooks/use-translation";
import Image from "next/image";

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

export default function VendorDetailsDoc({ documents }: IProps) {
  const { t } = useTranslation();
  const docsArr = Object.keys(documents || {}) as (keyof IVendorDocs)[];

  return (
    <>
      {docsArr.map((doc) => {
        const files = documents?.[doc];

        if (!files || files.length === 0) return null;

        return (
          <div key={doc} className="mb-6">
            <p className="text-sm text-gray-500 mb-2">
              {doc === "myPhoto" && t("vendor_photo")}
              {doc === "idProofFront" && t("id_proof_front")}
              {doc === "idProofBack" && t("id_proof_back")}
              {doc === "businessLicenseDoc" && t("business_license")}
              {doc === "taxDoc" && t("tax_document")}
              {doc === "storePhoto" && t("store_photo")}
              {doc === "menuUpload" && t("menu_brochure")}
              {doc === "agoserisHaccpCertificate" && t("agoserisHaccpCertificate")}
              {doc === "ibanProof" && t("iban_proof")}
            </p>

            <div className="grid grid-cols-2 gap-3">
              {files.map((file, index) => {
                const isPdf = file.toLowerCase().endsWith(".pdf");

                return (
                  <div key={index}>
                    {isPdf ? (
                      <iframe
                        src={file}
                        className="w-full h-40 rounded-lg border border-gray-200"
                      />
                    ) : (
                      <Image
                        src={file}
                        alt={`${doc}-${index}`}
                        width={500}
                        height={500}
                        className="w-full h-40 object-cover rounded-lg border border-gray-200"
                      />
                    )}

                    <a
                      href={file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 text-sm text-[#DC3173] hover:underline inline-block"
                    >
                      {t("view_full_file")}
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {docsArr.length === 0 && (
        <p className="text-gray-500 italic col-span-2">
          {t("no_documents_uploaded")}
        </p>
      )}
    </>
  );
}