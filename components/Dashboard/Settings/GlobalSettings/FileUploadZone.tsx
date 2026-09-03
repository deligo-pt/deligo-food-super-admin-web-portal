import { DocumentViewer } from "@/components/common/DocumentViewer";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/hooks/use-translation";
import { Upload, X, RefreshCw } from "lucide-react";

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

            {/* Hidden Input rendered once to work seamlessly in both states */}
            <input
                ref={inputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={onChange}
                disabled={isLoading}
                className="hidden"
            />

            {previewUrl ? (
                <div className="relative border border-slate-200 rounded-lg p-3 bg-slate-50 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                        <DocumentViewer
                            sections={[
                                {
                                    key: "agreement",
                                    label: t("agreement_preview") || "Agreement Preview",
                                    files: previewUrl,
                                },
                            ]}
                        />
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                        {/* Replace / Change Button */}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => inputRef.current?.click()}
                            disabled={isLoading}
                            className="text-xs flex items-center gap-1.5 h-8 px-2.5 text-slate-600 hover:text-[#DC3173] hover:border-[#DC3173]"
                        >
                            {isLoading ? (
                                <div className="w-3.5 h-3.5 border-2 border-[#DC3173] border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <RefreshCw className="h-3.5 w-3.5" />
                            )}
                            {t("replace") || "Replace"}
                        </Button>

                        {/* Remove / Clear Button */}
                        {/* {onClear && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={onClear}
                                disabled={isLoading}
                                className="h-8 w-8 text-slate-400 hover:text-red-500"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )} */}
                    </div>
                </div>
            ) : (
                <div
                    className={`
                        relative border-2 border-dashed rounded-lg p-6
                        flex flex-col items-center justify-center gap-2
                        transition-colors cursor-pointer
                        ${isLoading ? "opacity-60 pointer-events-none" : "hover:border-[#DC3173] hover:bg-pink-50/40"}
                        border-slate-300 bg-slate-50
                    `}
                    onClick={() => inputRef.current?.click()}
                >
                    <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center">
                        {isLoading ? (
                            <div className="w-4 h-4 border-2 border-[#DC3173] border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Upload className="w-5 h-5 text-slate-400" />
                        )}
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-medium text-slate-700">
                            {isLoading ? t("uploading") : t("click_to_upload")}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                            PNG, JPG or WebP (max. 5MB)
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};