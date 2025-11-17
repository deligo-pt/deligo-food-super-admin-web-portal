import Image from "next/image";

interface IDocs {
  businessLicense?: string | undefined;
  idProof?: string | undefined;
  // taxDoc?: string | undefined;
  // storePhoto?: string | undefined;
  // menuUpload?: string | undefined;
}
interface IProps {
  documents: IDocs | undefined;
}

export default function AgentDetailsDoc({ documents }: IProps) {
  const docsArr = Object.keys(documents || {}).filter(
    (key) => !!documents?.[key as keyof IDocs]
  );

  return (
    <>
      {docsArr.map((doc) => (
        <div key={doc}>
          <p className="text-sm text-gray-500 mb-2">
            {doc === "idProof" && "ID Proof"}
            {doc === "businessLicense" && "Business License"}
            {/* {doc === "taxDoc" && "Tax Document"}
            {doc === "storePhoto" && "Store Photo"}
            {doc === "menuUpload" && "Menu / Brochure"} */}
          </p>
          {documents?.[doc as keyof IDocs]?.toLowerCase()?.endsWith(".pdf") ? (
            <iframe
              src={documents?.[doc as keyof IDocs] || ""}
              className="w-full h-40 rounded-lg  border border-gray-200"
            />
          ) : (
            <Image
              src={documents?.[doc as keyof IDocs] || ""}
              alt={doc || "Document"}
              className="w-full h-40 object-cover rounded-lg border border-gray-200"
              width={500}
              height={500}
            />
          )}
          <a
            href={documents?.[doc as keyof IDocs] || ""}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 text-sm text-[#DC3173] hover:underline inline-block"
          >
            View Full Image
          </a>
        </div>
      ))}
      {docsArr.length === 0 && (
        <p className="text-gray-500 italic col-span-2">No documents uploaded</p>
      )}
    </>
  );
}
