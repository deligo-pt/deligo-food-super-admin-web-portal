import Image from "next/image";

interface IDocs {
  businessLicenseDoc?: string[] | undefined;
  taxDoc?: string[] | undefined;
  idProofFront?: string[] | undefined;
  idProofBack?: string[] | undefined;
  storePhoto?: string[] | undefined;
  menuUpload?: string[] | undefined;
}
interface IProps {
  documents: IDocs | undefined;
}

const docLink =
  "https://res.cloudinary.com/dmbyhqmbf/image/upload/v1774956512/yrz3bbh7zr-1774956512428-file-burger-new.jpg";

const docs = {
  businessLicenseDoc: [docLink, docLink, docLink, docLink, docLink],
  taxDoc: [docLink, docLink, docLink, docLink, docLink],
  idProofFront: [docLink, docLink, docLink, docLink, docLink],
  idProofBack: [docLink, docLink, docLink, docLink, docLink],
  storePhoto: [docLink, docLink, docLink, docLink, docLink],
  menuUpload: [docLink, docLink, docLink, docLink, docLink],
};

export default function VendorDetailsDoc({ documents }: IProps) {
  const docsArr = Object.keys(documents || {}).filter(
    (key) => !!documents?.[key as keyof IDocs],
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {docsArr.map((doc) => (
        <div key={doc} className="border p-2 rounded-lg">
          <p className="text-sm text-gray-500 mb-2">
            {doc === "idProofFront" && "ID Proof Front"}
            {doc === "idProofBack" && "ID Proof Back"}
            {doc === "businessLicenseDoc" && "Business License"}
            {doc === "taxDoc" && "Tax Document"}
            {doc === "storePhoto" && "Store Photo"}
            {doc === "menuUpload" && "Menu / Brochure"}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {docs?.[doc as keyof IDocs]?.map((link, i) => (
              <div key={i}>
                {link?.toLowerCase()?.endsWith(".pdf") ? (
                  <iframe
                    src={link || ""}
                    className="w-full h-40 rounded-lg  border border-gray-200"
                  />
                ) : (
                  <Image
                    src={link || ""}
                    alt={doc || "Document"}
                    className="w-full h-40 object-cover rounded-lg border border-gray-200"
                    width={500}
                    height={500}
                  />
                )}
                <a
                  href={link || ""}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 text-sm text-[#DC3173] hover:underline inline-block"
                >
                  View Full Image
                </a>
              </div>
            ))}
          </div>
        </div>
      ))}
      {docsArr.length === 0 && (
        <p className="text-gray-500 italic col-span-2">No documents uploaded</p>
      )}
    </div>
  );
}
