import { DocumentViewer } from "@/components/common/DocumentViewer";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/hooks/use-translation";
import { Upload, X, RefreshCw } from "lucide-react";
import Image from "next/image";

export const FileUploadZone = ({
    inputRef,
    onChange,
    isLoading,
    previewUrl,
    onClear,
    label,
    optional = false,
}: {
    inputRef: React.RefObject<HTMLInputElement | null>;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isLoading: boolean;
    previewUrl: string | null;
    onClear?: () => void;
    label: string;
    optional?: boolean;
}) => {
    const { t } = useTranslation();

    const isImage =
        !!previewUrl &&
        (previewUrl.match(/\.(jpeg|jpg|png|gif|webp|svg)(\?.*)?$/i) ||
            previewUrl.startsWith("blob:") ||
            previewUrl.includes("image"));

    return (
        <div className="space-y-2">
            <Label className="text-sm font-bold text-slate-700">
                {label}{" "}
                {optional ? (
                    <span className="text-slate-400 font-normal">(optional)</span>
                ) : (
                    <span className="text-[#DC3173]">*</span>
                )}
            </Label>

            <input
                ref={inputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={onChange}
                disabled={isLoading}
                className="hidden"
            />

            {previewUrl ? (
                <div className="relative border border-slate-200 rounded-xl p-4 bg-slate-50">
                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                        {/* Nice fixed-size preview */}
                        <div className="shrink-0">
                            <div className="relative w-36 h-36 sm:w-40 sm:h-40 rounded-lg overflow-hidden border border-slate-200 bg-white shadow-sm">
                                {isImage ? (
                                    <Image
                                        src={previewUrl}
                                        alt="Preview"
                                        fill
                                        className="object-contain p-2"
                                        sizes="160px"
                                    />
                                ) : (
                                    // PDF fallback thumbnail
                                    <iframe
                                        src={previewUrl}
                                        className="w-full h-full pointer-events-none"
                                        title="PDF preview"
                                    />
                                )}
                            </div>
                        </div>

                        {/* Actions + View Full File (using DocumentViewer without its own preview) */}
                        <div className="flex flex-col gap-3 pt-1">
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => inputRef.current?.click()}
                                    disabled={isLoading}
                                    className="text-xs flex items-center gap-1.5 h-9 px-3"
                                >
                                    {isLoading ? (
                                        <div className="w-3.5 h-3.5 border-2 border-[#DC3173] border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <RefreshCw className="h-3.5 w-3.5" />
                                    )}
                                    {t("replace") || "Replace"}
                                </Button>

                                {onClear && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={onClear}
                                        disabled={isLoading}
                                        className="h-9 w-9 text-slate-400 hover:text-red-500 hover:bg-red-50"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>

                            {/* Only the "View Full File" button + modal */}
                            <DocumentViewer
                                sections={[
                                    {
                                        key: "file",
                                        label: "",
                                        files: previewUrl,
                                    },
                                ]}
                                showPreview={false}   // ← key line
                            />
                        </div>
                    </div>
                </div>
            ) : (
                // Empty state
                <div
                    className={`
            relative border-2 border-dashed rounded-xl p-8
            flex flex-col items-center justify-center gap-3
            transition-colors cursor-pointer
            ${isLoading
                            ? "opacity-60 pointer-events-none"
                            : "hover:border-[#DC3173] hover:bg-pink-50/40"
                        }
            border-slate-300 bg-slate-50
          `}
                    onClick={() => inputRef.current?.click()}
                >
                    <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-[#DC3173] border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Upload className="w-5 h-5 text-slate-400" />
                        )}
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-medium text-slate-700">
                            {isLoading ? t("uploading") || "Uploading..." : t("click_to_upload") || "Click to upload"}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                            PNG, JPG, WebP or PDF (max. 5MB)
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};