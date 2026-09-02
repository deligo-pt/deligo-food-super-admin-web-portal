/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import RichTextEditor from "./RichTextEditor";
import { useTranslation } from "@/hooks/use-translation";
import { AgreementPart, Clause, IAgreementVersion } from "@/types/agreement.type";


export type AgreementFormValues = {
    agreementType: "INITIAL_VENDOR_AGREEMENT" | "INITIAL_FLEET_MANAGER_AGREEMENT";
    documentTitle: string;
    parts: AgreementPart[];
};

interface AgreementFormProps {
    defaultValues?: IAgreementVersion;
    onSubmit: (data: AgreementFormValues) => void;
    isSubmitting?: boolean;
    submitLabel?: string;
}

const emptyClause = (number = 1): Clause => ({
    clauseNumber: number,
    clauseTitle: "",
    bodyHtml: "",
    forcePageBreakBefore: false,
    showPosPaymentWidget: false,
});

const AgreementForm = ({
    defaultValues,
    onSubmit,
    isSubmitting = false,
    submitLabel = "Create Draft Agreement",
}: AgreementFormProps) => {
    const { t } = useTranslation();
    const [form, setForm] = useState<AgreementFormValues>({
        agreementType: defaultValues?.agreementType || "INITIAL_VENDOR_AGREEMENT",
        documentTitle: defaultValues?.documentTitle || "",
        parts: defaultValues?.parts && defaultValues.parts.length > 0 ? defaultValues.parts : [{ clauses: [emptyClause(1)] }],
        ...defaultValues,
    });

    useEffect(() => {
        if (defaultValues) {
            setForm((prev) => ({
                ...prev,
                ...defaultValues,
                parts: defaultValues.parts?.length ? defaultValues.parts : prev.parts,
            }));
        }
    }, [defaultValues]);

    const isFleet = form.agreementType === "INITIAL_FLEET_MANAGER_AGREEMENT";

    // Helpers
    const updateTopField = (field: "agreementType" | "documentTitle", value: string) => {
        setForm((prev) => {
            if (field === "agreementType") {
                if (value === "INITIAL_VENDOR_AGREEMENT") {
                    return {
                        ...prev,
                        agreementType: value as any,
                        parts: [{ clauses: [emptyClause(1)] }],
                    };
                }
                return {
                    ...prev,
                    agreementType: value as any,
                    parts: [{ partTitle: "", clauses: [emptyClause(1)] }],
                };
            }
            return { ...prev, [field]: value };
        });
    };

    const addPart = () => {
        setForm((prev) => ({
            ...prev,
            parts: [...prev.parts, { partTitle: "", clauses: [emptyClause(1)] }],
        }));
    };

    const removePart = (partIndex: number) => {
        if (form.parts.length <= 1) {
            toast.error("At least one part is required");
            return;
        }
        setForm((prev) => ({
            ...prev,
            parts: prev.parts.filter((_, i) => i !== partIndex),
        }));
    };

    const updatePartTitle = (partIndex: number, title: string) => {
        setForm((prev) => {
            const newParts = [...prev.parts];
            newParts[partIndex] = { ...newParts[partIndex], partTitle: title };
            return { ...prev, parts: newParts };
        });
    };

    const addClause = (partIndex: number) => {
        setForm((prev) => {
            const newParts = [...prev.parts];
            const current = newParts[partIndex].clauses;
            newParts[partIndex] = {
                ...newParts[partIndex],
                clauses: [...current, emptyClause(current.length + 1)],
            };
            return { ...prev, parts: newParts };
        });
    };

    const removeClause = (partIndex: number, clauseIndex: number) => {
        setForm((prev) => {
            const newParts = [...prev.parts];
            const current = newParts[partIndex].clauses;
            if (current.length <= 1) {
                toast.error("At least one clause is required");
                return prev;
            }
            const updated = current
                .filter((_, i) => i !== clauseIndex)
                .map((c, i) => ({ ...c, clauseNumber: i + 1 }));
            newParts[partIndex] = { ...newParts[partIndex], clauses: updated };
            return { ...prev, parts: newParts };
        });
    };

    const updateClause = (
        partIndex: number,
        clauseIndex: number,
        field: keyof Clause,
        value: any
    ) => {
        setForm((prev) => {
            const newParts = [...prev.parts];
            const newClauses = [...newParts[partIndex].clauses];
            newClauses[clauseIndex] = { ...newClauses[clauseIndex], [field]: value };
            newParts[partIndex] = { ...newParts[partIndex], clauses: newClauses };
            return { ...prev, parts: newParts };
        });
    };

    // Submit
    const handleSubmit = () => {
        if (!form.documentTitle.trim()) {
            toast.error("Document title is required");
            return;
        }

        if (isFleet) {
            for (const part of form.parts) {
                if (!part.partTitle?.trim()) {
                    toast.error("All parts must have a Part Title");
                    return;
                }
            }
        }

        for (const part of form.parts) {
            for (const clause of part.clauses) {
                if (!clause.clauseTitle.trim() || !clause.bodyHtml.trim()) {
                    toast.error("All clauses must have a title and body");
                    return;
                }
            }
        }

        const payload: AgreementFormValues = {
            agreementType: form.agreementType,
            documentTitle: form.documentTitle,
            parts: form.parts.map((part) => {
                const cleanPart: AgreementPart = {
                    clauses: part.clauses.map((c) => {
                        const clean: any = {
                            clauseNumber: c.clauseNumber,
                            clauseTitle: c.clauseTitle,
                            bodyHtml: c.bodyHtml,
                        };
                        if (c.forcePageBreakBefore) clean.forcePageBreakBefore = true;
                        if (c.showPosPaymentWidget) clean.showPosPaymentWidget = true;
                        return clean;
                    }),
                };
                if (isFleet && part.partTitle) cleanPart.partTitle = part.partTitle;
                return cleanPart;
            }),
        };

        onSubmit(payload);
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Agreement Info */}
            <Card>
                <CardHeader>
                    <CardTitle>{t("agreement_info")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>{t("agreement_type")}</Label>
                            <Select
                                value={form.agreementType}
                                onValueChange={(v) => updateTopField("agreementType", v)}
                                disabled={isSubmitting || defaultValues?.agreementType === "INITIAL_FLEET_MANAGER_AGREEMENT" || defaultValues?.agreementType === "INITIAL_VENDOR_AGREEMENT"}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="INITIAL_VENDOR_AGREEMENT">
                                        {t("initial_vendor_agreement")}
                                    </SelectItem>
                                    <SelectItem value="INITIAL_FLEET_MANAGER_AGREEMENT">
                                        {t("initial_fleet_agreement")}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>{t("document_title")}</Label>
                            <Input
                                value={form.documentTitle}
                                onChange={(e) => updateTopField("documentTitle", e.target.value)}
                                placeholder={t("document_title_ph")}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Parts / Clauses */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">
                        {isFleet ? t("parts") : t("clauses")}
                    </h2>
                    {isFleet && (
                        <Button type="button" onClick={addPart} className="gap-2">
                            <Plus className="h-4 w-4" /> {t("add_part")}
                        </Button>
                    )}
                </div>

                {form.parts.map((part, partIndex) => (
                    <Card key={partIndex} className="border-2">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between gap-4">
                                {isFleet ? (
                                    <div className="flex-1 space-y-2">
                                        <Label>{t("part_title")}</Label>
                                        <Input
                                            value={part.partTitle || ""}
                                            onChange={(e) => updatePartTitle(partIndex, e.target.value)}
                                            placeholder={t("part_title_ph")}
                                        />
                                    </div>
                                ) : (
                                    <CardTitle className="text-base">{t("clauses")}</CardTitle>
                                )}

                                {isFleet && form.parts.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removePart(partIndex)}
                                        className="text-destructive mt-6"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            {part.clauses.map((clause, clauseIndex) => (
                                <Card key={clauseIndex} className="bg-muted/20">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-sm">
                                                {t("clause")} {clause.clauseNumber}
                                            </CardTitle>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeClause(partIndex, clauseIndex)}
                                                className="text-destructive h-8 w-8"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label>{t("clause_number")}</Label>
                                                <Input
                                                    type="number"
                                                    value={clause.clauseNumber}
                                                    onChange={(e) =>
                                                        updateClause(
                                                            partIndex,
                                                            clauseIndex,
                                                            "clauseNumber",
                                                            Number(e.target.value)
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div className="space-y-2 md:col-span-2">
                                                <Label>{t("clause_title")}</Label>
                                                <Input
                                                    value={clause.clauseTitle}
                                                    onChange={(e) =>
                                                        updateClause(
                                                            partIndex,
                                                            clauseIndex,
                                                            "clauseTitle",
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="e.g. Objeto do Contrato"
                                                />
                                            </div>
                                        </div>

                                        {/* Rich Text Editor */}
                                        <div className="space-y-2">
                                            <Label>{t("body_content")}</Label>
                                            <RichTextEditor
                                                value={clause.bodyHtml}
                                                onChange={(html) =>
                                                    updateClause(partIndex, clauseIndex, "bodyHtml", html)
                                                }
                                            />
                                        </div>

                                        <div className="flex flex-wrap gap-6">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`force-${partIndex}-${clauseIndex}`}
                                                    checked={!!clause.forcePageBreakBefore}
                                                    onCheckedChange={(checked) =>
                                                        updateClause(
                                                            partIndex,
                                                            clauseIndex,
                                                            "forcePageBreakBefore",
                                                            !!checked
                                                        )
                                                    }
                                                />
                                                <Label htmlFor={`force-${partIndex}-${clauseIndex}`}>
                                                    {t("force_page_break_before")}
                                                </Label>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`pos-${partIndex}-${clauseIndex}`}
                                                    checked={!!clause.showPosPaymentWidget}
                                                    onCheckedChange={(checked) =>
                                                        updateClause(
                                                            partIndex,
                                                            clauseIndex,
                                                            "showPosPaymentWidget",
                                                            !!checked
                                                        )
                                                    }
                                                />
                                                <Label htmlFor={`pos-${partIndex}-${clauseIndex}`}>
                                                    {t("show_pos_payment_widget")}
                                                </Label>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => addClause(partIndex)}
                                className="gap-2"
                            >
                                <Plus className="h-4 w-4" /> {t("add_clause")}
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
                {/* <Button type="button" variant="outline" className="gap-2">
                    <Eye className="h-4 w-4" />
                    {t("preview")}
                </Button> */}
                <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? t("saving") : submitLabel}
                </Button>
            </div>
        </div>
    );
};

export default AgreementForm;