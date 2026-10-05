"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/hooks/use-translation";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (payload: {
        resolution: "RIDER_CONTINUES" | "FALSE_ALARM";
        note?: string;
    }) => void;
    isSubmitting: boolean;
}

export default function ResolveModal({
    open,
    onOpenChange,
    onConfirm,
    isSubmitting,
}: Props) {
    const { t } = useTranslation();
    const [resolution, setResolution] = useState<"RIDER_CONTINUES" | "FALSE_ALARM">("RIDER_CONTINUES");
    const [note, setNote] = useState("");

    const handleConfirm = () => {
        onConfirm({ resolution, note: note.trim() || undefined });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t("resolve_exception") || "Resolve Exception"}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label>{t("resolution")}</Label>
                        <Select
                            value={resolution}
                            onValueChange={(v) => setResolution(v as any)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="RIDER_CONTINUES">
                                    {t("rider_continues") || "Rider Continues"}
                                </SelectItem>
                                <SelectItem value="FALSE_ALARM">
                                    {t("false_alarm") || "False Alarm"}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>{t("note")} <span className="text-red-600">*</span></Label>
                        <Textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder={t("add_a_note_to_this_exception") || "Add a short note..."}
                            rows={3}
                        />
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                        {t("cancel")}
                    </Button>
                    <Button onClick={handleConfirm} disabled={isSubmitting}>
                        {isSubmitting ? t("processing") : t("resolve")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}