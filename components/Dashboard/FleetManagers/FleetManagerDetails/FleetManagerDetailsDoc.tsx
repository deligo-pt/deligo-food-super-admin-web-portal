import Image from "next/image";

export interface IFleetDocs {
  businessLicense?: string[];
  idProofFront?: string[];
  idProofBack?: string[];
}

interface IProps {
  documents: IFleetDocs | undefined;
}

export default function FleetManagerDetailsDoc({ documents }: IProps) {
  console.log("documents", documents);
  const docsArr = Object.keys(documents || {}) as (keyof IFleetDocs)[];

  return (
    <>
      {docsArr.map((doc) => {
        const files = documents?.[doc];

        if (!files || files.length === 0) return null;

        return (
          <div key={doc} className="mb-6">
            <p className="text-sm text-gray-500 mb-2">
              {doc === "idProofFront" && "ID Proof (Front)"}
              {doc === "idProofBack" && "ID Proof (Back)"}
              {doc === "businessLicense" && "Business License"}
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
                      View Full File
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {docsArr.length === 0 && (
        <p className="text-gray-500 italic">No documents uploaded</p>
      )}
    </>
  );
}