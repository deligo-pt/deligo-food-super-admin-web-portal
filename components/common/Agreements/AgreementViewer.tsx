/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { Dispatch, SetStateAction, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import SignatureCanvas from "react-signature-canvas";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { uploadImagesReq } from "@/services/upload/upload.service";
import { FileUploadZone } from "@/components/Dashboard/Settings/GlobalSettings/FileUploadZone";
import { signAgreement } from "@/services/dashboard/agreement/agreement.service";

interface AgreementViewerProps {
    agreement: any;
    setAgreementSigned?: Dispatch<SetStateAction<boolean>>;
}

type SignatureMethod = "DRAWN" | "UPLOADED";
type PosPaymentOption = "THREE_INSTALLMENTS" | "MONTHLY_RENTAL";

export default function AgreementViewer({ agreement, setAgreementSigned }: AgreementViewerProps) {
    const { t } = useTranslation();
    const router = useRouter();
    const [, startTransition] = useTransition();
    const isFleetAgreement = agreement?.agreementType === "INITIAL_FLEET_MANAGER_AGREEMENT"

    const partySigRef = useRef<SignatureCanvas | null>(null);
    const signatureFileRef = useRef<HTMLInputElement | null>(null);
    const stampFileRef = useRef<HTMLInputElement | null>(null);

    const [isPartyEmpty, setIsPartyEmpty] = useState(true);
    const [partySignatureMethod, setPartySignatureMethod] =
        useState<SignatureMethod>("DRAWN");
    const [uploadedSignatureUrl, setUploadedSignatureUrl] = useState<string | null>(
        null
    );
    const [partyStamp, setPartyStamp] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isUploadingStamp, setIsUploadingStamp] = useState(false);

    const [posPaymentOption, setPosPaymentOption] =
        useState<PosPaymentOption | null>(null);

    const [signedPdfUrl, setSignedPdfUrl] = useState<string | null>(
        agreement?.signedPdfPath || null
    );
    const [isSubmitting, setIsSubmitting] = useState(false);

    const pdfUrl = signedPdfUrl || agreement?.signedPdfPath || agreement?.draftPdfPath || "";

    const handleClearParty = () => {
        partySigRef.current?.clear();
        setIsPartyEmpty(true);
    };

    const handlePartyEnd = () => {
        setIsPartyEmpty(!!partySigRef.current?.isEmpty());
    };

    const handleSignatureMethodChange = (method: SignatureMethod) => {
        setPartySignatureMethod(method);
        setUploadedSignatureUrl(null);
        setIsPartyEmpty(true);
        if (partySigRef.current) {
            partySigRef.current.clear();
        }
        if (signatureFileRef.current) {
            signatureFileRef.current.value = "";
        }
    };

    const handleFileUpload = async (
        e: React.ChangeEvent<HTMLInputElement>,
        type: "signature" | "stamp"
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Please upload an image file (PNG, JPG, etc.)");
            return;
        }

        const toastId = toast.loading(
            type === "signature" ? "Uploading signature..." : "Uploading stamp..."
        );

        if (type === "signature") setIsUploading(true);
        else setIsUploadingStamp(true);

        try {
            const uploadResult = await uploadImagesReq([file]);

            if (uploadResult.success && uploadResult.data?.[0]) {
                if (type === "signature") {
                    setUploadedSignatureUrl(uploadResult.data[0]);
                    setIsPartyEmpty(false);
                } else {
                    setPartyStamp(uploadResult.data[0]);
                }
                toast.success(
                    type === "signature"
                        ? "Signature uploaded successfully!"
                        : "Stamp uploaded successfully!",
                    { id: toastId }
                );
            } else {
                toast.error(uploadResult.message || "Upload failed", { id: toastId });
            }
        } catch (error: any) {
            console.error("Upload error:", error);
            toast.error(error?.message || "Failed to upload", { id: toastId });
        } finally {
            if (type === "signature") setIsUploading(false);
            else setIsUploadingStamp(false);
        }
    };

    const clearStamp = () => {
        setPartyStamp(null);
        if (stampFileRef.current) {
            stampFileRef.current.value = "";
        }
    };

    const handleSubmit = async () => {
        const toastId = toast.loading("Submitting your signature...");
        setIsSubmitting(true);

        if (partySignatureMethod === "DRAWN") {
            if (!partySigRef.current || partySigRef.current.isEmpty()) {
                toast.error("Please draw the signature first.", {
                    id: toastId,
                });
                setIsSubmitting(false);
                return;
            }
        } else {
            if (!uploadedSignatureUrl) {
                toast.error("Please upload the signature first.", {
                    id: toastId,
                });
                setIsSubmitting(false);
                return;
            }
        }

        // if (!posPaymentOption && !isFleetAgreement) {
        //     toast.error("Please select a payment option.", { id: toastId });
        //     setIsSubmitting(false);
        //     return;
        // }

        let partySignature: string;

        if (partySignatureMethod === "DRAWN") {
            partySignature = partySigRef.current!
                .getTrimmedCanvas()
                .toDataURL("image/png");
        } else {
            partySignature = uploadedSignatureUrl!;
        }

        const payload: any = {
            partySignatureMethod,
            partySignature,
            ...(posPaymentOption && { posPaymentOption: posPaymentOption }),
            ...(posPaymentOption && { posPaymentDecision: "YES" })
        };

        if (isFleetAgreement) {
            delete payload.posPaymentOption
        }
        // Only include stamp if uploaded (optional)
        if (partyStamp) {
            payload.partyStamp = partyStamp;
        }

        try {
            const res = await signAgreement(agreement?._id, payload);

            if (res?.success) {
                toast.success(res?.message || "Agreement signed successfully!", {
                    id: toastId,
                });
                setSignedPdfUrl(res?.data?.signedPdfPath);
                setAgreementSigned?.(true);
                startTransition(() => {
                    router.refresh();
                });
                return;
            }

            if (res?.data?.errorSources) {
                res?.data?.errorSources?.map((err: { path: string, message: string }) => (
                    toast.error(err?.message, { id: toastId })
                ));
                setIsSubmitting(false);
                return;
            } else {
                toast.error(res.message || "Failed to sign the agreement. Please try again.", {
                    id: toastId,
                });
            }

        } catch (error: any) {
            console.error("Sign Agreement Error:", error);
            toast.error(
                error?.message || "An error occurred while signing. Please try again.",
                { id: toastId }
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const isSubmitDisabled = !isFleetAgreement ?
        isPartyEmpty ||
        // !posPaymentOption ||
        isSubmitting ||
        isUploading ||
        isUploadingStamp :
        isPartyEmpty || isUploading || isSubmitting;

    return (
        <div className="w-full max-w-4xl mx-auto p-4">
            <div className="space-y-4">
                <Card className="overflow-hidden border-none shadow-inner bg-slate-200 min-h-175 flex flex-col">
                    {/* PDF Viewer */}
                    <div className="grow relative">
                        <iframe
                            src={`${pdfUrl}`}
                            className="w-full h-full min-h-175 border-none"
                            title={t("agreement_pdf")}
                        />
                    </div>

                    <div className="bg-white p-6 border-t border-slate-200 space-y-6">
                        {/* Signature Method */}
                        <div className="space-y-2">
                            <Label className="text-sm font-bold text-slate-700">
                                {t("signature_method")} <span className="text-[#DC3173]">*</span>
                            </Label>
                            <Select
                                value={partySignatureMethod}
                                onValueChange={(value) =>
                                    handleSignatureMethodChange(value as SignatureMethod)
                                }
                            >
                                <SelectTrigger className="w-full md:w-64">
                                    <SelectValue placeholder={t("select_method")} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="DRAWN">{t("draw_signature")}</SelectItem>
                                    <SelectItem value="UPLOADED">{t("upload_signature")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Signature Area */}
                        <div className="space-y-2">
                            <Label className="text-sm font-bold text-slate-700">
                                {t("party_signature")} <span className="text-[#DC3173]">*</span>
                            </Label>

                            {partySignatureMethod === "DRAWN" ? (
                                <>
                                    <div className="border rounded-md bg-gray-50 relative">
                                        <SignatureCanvas
                                            ref={partySigRef}
                                            penColor="black"
                                            canvasProps={{
                                                className: "w-full h-32",
                                            }}
                                            onEnd={handlePartyEnd}
                                        />
                                    </div>
                                    <div className="flex justify-end">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleClearParty}
                                            className="text-xs text-gray-500 hover:text-red-500"
                                        >
                                            {t("clear_signature")}
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <FileUploadZone
                                    inputRef={signatureFileRef}
                                    onChange={(e) => handleFileUpload(e, "signature")}
                                    isLoading={isUploading}
                                    previewUrl={uploadedSignatureUrl}
                                    onClear={() => {
                                        setUploadedSignatureUrl(null);
                                        setIsPartyEmpty(true);
                                        if (signatureFileRef.current) {
                                            signatureFileRef.current.value = "";
                                        }
                                    }}
                                    label={t("upload_signature")}
                                />
                            )}
                        </div>

                        {/* Party Stamp (Optional) */}
                        {!isFleetAgreement && <FileUploadZone
                            inputRef={stampFileRef}
                            onChange={(e) => handleFileUpload(e, "stamp")}
                            isLoading={isUploadingStamp}
                            previewUrl={partyStamp}
                            onClear={clearStamp}
                            label={t("party_stamp")}
                            optional
                        />}
                        {/* Payment Option */}
                        {!isFleetAgreement && (
                            (agreement && !agreement?.hasPosPaymentDecision) && <div className="space-y-3">
                                <Label className="text-sm font-bold text-slate-700">
                                    {t("payment_option")} <span className="text-slate-400 font-normal">(optional)</span>
                                </Label>
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="three-installments"
                                            checked={posPaymentOption === "THREE_INSTALLMENTS"}
                                            onCheckedChange={(checked) => {
                                                setPosPaymentOption(
                                                    checked ? "THREE_INSTALLMENTS" : null
                                                );
                                            }}
                                        />
                                        <Label
                                            htmlFor="three-installments"
                                            className="text-sm font-normal cursor-pointer"
                                        >
                                            {t("three_installment_of_each")}
                                        </Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="monthly-rental"
                                            checked={posPaymentOption === "MONTHLY_RENTAL"}
                                            onCheckedChange={(checked) => {
                                                setPosPaymentOption(checked ? "MONTHLY_RENTAL" : null);
                                            }}
                                        />
                                        <Label
                                            htmlFor="monthly-rental"
                                            className="text-sm font-normal cursor-pointer"
                                        >
                                            {t("monthly_machine_rental_cost")}
                                        </Label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Submit */}
                        <div className="w-full border-t border-slate-100 pt-4 flex flex-col items-center">
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitDisabled}
                                className="bg-[#DC3173] hover:bg-[#c22b65] text-white px-8 py-5 font-bold"
                            >
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                {isSubmitting ? t("submitting") : t("submit_agreement")}
                            </Button>

                            <p className="text-[10px] text-slate-400 text-center max-w-md mx-auto leading-normal mt-4">
                                {t("by_clicking_submit_agreement_you_legally")}
                            </p>
                        </div>
                    </div>

                </Card>
            </div>
        </div>
    );
}