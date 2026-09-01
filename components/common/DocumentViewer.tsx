import { useState } from "react";
import Image from "next/image";
import { useTranslation } from "@/hooks/use-translation";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Eye } from "lucide-react";

export interface IDocSection {
    key: string;
    label: string;
    files?: string | string[];
}

interface DocumentViewerProps {
    sections: IDocSection[];
    emptyMessageKey?: string;
}

export function DocumentViewer({
    sections,
    emptyMessageKey = "no_documents_uploaded",
}: DocumentViewerProps) {
    const { t } = useTranslation();
    const [selectedFile, setSelectedFile] = useState<string | null>(null);

    // Helper to normalize single string or string[] into string[]
    const normalizeFiles = (files?: string | string[]): string[] => {
        if (!files) return [];
        return Array.isArray(files) ? files : [files];
    };

    const activeSections = sections
        .map((section) => ({
            ...section,
            fileList: normalizeFiles(section.files),
        }))
        .filter((section) => section.fileList.length > 0);

    if (activeSections.length === 0) {
        return (
            <p className="text-gray-500 italic col-span-2">
                {t(emptyMessageKey)}
            </p>
        );
    }

    const isSelectedPdf = selectedFile?.toLowerCase().endsWith(".pdf");

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 md:gap-4 xl:grid-cols-4 lg:gap-6 w-full">
                {activeSections.map((section) => (
                    <div key={section.key} className="mb-4">
                        <p className="text-sm text-gray-500 mb-2 font-medium">
                            {section.label}
                        </p>

                        <div className="space-y-3">
                            {section.fileList.map((file, index) => {
                                const isPdf = file.toLowerCase().endsWith(".pdf");

                                return (
                                    <div key={index} className="flex flex-col items-start">
                                        <div className="w-full h-40 relative rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
                                            {isPdf ? (
                                                <iframe
                                                    src={file}
                                                    className="w-full h-full pointer-events-none"
                                                    title={`${section.key}-${index}`}
                                                />
                                            ) : (
                                                <Image
                                                    src={file}
                                                    alt={`${section.key}-${index}`}
                                                    fill
                                                    className="object-cover"
                                                />
                                            )}
                                        </div>

                                        <Button
                                            type="button"
                                            variant="link"
                                            onClick={() => setSelectedFile(file)}
                                            className="mt-1 h-auto p-0 text-sm text-[#DC3173] hover:underline flex items-center gap-1"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                            {t("view_full_file")}
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Lightbox Modal */}
            <Dialog open={!!selectedFile} onOpenChange={(open) => !open && setSelectedFile(null)}>
                <DialogContent className="max-w-4xl w-[90vw] h-[95vh] p-0 overflow-hidden flex flex-col bg-background">
                    <DialogTitle className="sr-only">Document Preview</DialogTitle>

                    <div className="absolute right-4 top-4 z-50">
                        <DialogClose asChild>
                            <Button
                                variant="secondary"
                                size="icon"
                                className="rounded-full shadow-md hover:bg-muted"
                            >
                                <X className="h-4 w-4" />
                                <span className="sr-only">Close</span>
                            </Button>
                        </DialogClose>
                    </div>

                    <div className="flex-1 w-full h-full p-4 flex items-center justify-center overflow-auto bg-black/5">
                        {selectedFile && (
                            isSelectedPdf ? (
                                <iframe
                                    src={selectedFile}
                                    className="w-full h-full rounded-md border-0"
                                    title="PDF Preview"
                                />
                            ) : (
                                <div className="relative w-full h-full min-h-100">
                                    <Image
                                        src={selectedFile}
                                        alt="Document preview"
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                            )
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}