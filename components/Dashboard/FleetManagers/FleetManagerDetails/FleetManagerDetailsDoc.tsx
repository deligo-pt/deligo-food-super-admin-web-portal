import Image from "next/image";

interface IDocs {
  businessLicense?: string | undefined;
  idProofFront?: string | undefined;
  idProofBack?: string | undefined;
}
interface IProps {
  documents: IDocs | undefined;
}

export default function FleetManagerDetailsDoc({ documents }: IProps) {
  const docsArr = Object.keys(documents || {}).filter(
    (key) => !!documents?.[key as keyof IDocs],
  );

  return (
    <>
      {docsArr.map((doc) => {
        const file = documents?.[doc as keyof IDocs]?.[0];
        if (!file) return null;

        return (
          <div key={doc}>
            <p className="text-sm text-gray-500 mb-2">
              {doc === "idProofFront" && "ID Proof (Front)"}
              {doc === "idProofBack" && "ID Proof (Back)"}
              {doc === "businessLicense" && "Business License"}
            </p>

            {file.toLowerCase().endsWith(".pdf") ? (
              <iframe
                src={file}
                className="w-full h-40 rounded-lg border border-gray-200"
              />
            ) : (
              <Image
                src={file}
                alt={doc}
                width={500}
                height={500}
                className="w-full h-40 object-cover rounded-lg border border-gray-200"
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
        )
      })}
      {docsArr.length === 0 && (
        <p className="text-gray-500 italic col-span-2">No documents uploaded</p>
      )}
    </>
  );
}
