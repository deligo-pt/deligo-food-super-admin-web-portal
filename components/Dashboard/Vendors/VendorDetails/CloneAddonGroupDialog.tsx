"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { createAdminAddonGroupReq } from "@/services/dashboard/product/product.service";
import { useStore } from "@/store/store";
import { TAddonGroup } from "@/types/add-ons.type";
import { cloneGroupPayload, titleTaken } from "@/utils/addonGroup";
import { translateObject } from "@/utils/translation/translationObject";
import { Copy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface IProps {
    /** The group to copy; the dialog is open while it is set. */
    group?: TAddonGroup;
    onClose: () => void;
    /** The vendor's Mongo `_id` — the copy is made for this store. */
    vendorId: string;
    allGroups: TAddonGroup[];
    t: (key: string) => string;
}

/**
 * Clone an Extra group (plan.md §11.5, copy of the vendor panel's): the
 * title starts as the original's and must be changed — a store can't have
 * two groups with one title, and the API refuses it too. Price empty keeps
 * each option's price. The parent remounts this per group (`key`).
 */
export default function CloneAddonGroupDialog({ group, onClose, vendorId, allGroups, t }: IProps) {
    const { lang } = useStore();
    const L = lang as "en" | "pt";
    const router = useRouter();
    const [title, setTitle] = useState(group?.title?.[L] || group?.title?.en || group?.title?.pt || "");
    // Text, like the admin's other price boxes: "" = keep each option's price.
    const [price, setPrice] = useState("");
    const [sortAz, setSortAz] = useState(false);
    const [saving, setSaving] = useState(false);

    const taken = titleTaken(allGroups, title);
    const canSave = !!group && title.trim() !== "" && !taken && !saving;

    const save = async () => {
        if (!group || !canSave) return;
        setSaving(true);
        const toastId = toast.loading(t("addon_clone_saving"));
        try {
            const parsed = parseFloat(price);
            const payload = cloneGroupPayload(
                {
                    ...group,
                    options: group.options.map((option) => ({
                        ...option,
                        tax: typeof option.tax === "string" ? option.tax : option.tax?._id,
                    })),
                },
                { title, price: price === "" || Number.isNaN(parsed) ? undefined : Math.max(0, parsed), sort: sortAz, lang: L },
            );
            const translated = await translateObject(payload, L);
            const result = await createAdminAddonGroupReq({ ...translated, vendorId });
            if (result.success) {
                toast.success(t("addon_clone_done"), { id: toastId });
                router.refresh();
                onClose();
                return;
            }
            toast.error(result.message || t("addon_clone_failed"), { id: toastId });
        } catch (error) {
            toast.error((error as Error)?.message || t("addon_clone_failed"), { id: toastId });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={!!group} onOpenChange={(open) => !open && !saving && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Copy className="h-5 w-5 text-[#DC3173]" aria-hidden />
                        {t("addon_clone_title")}
                    </DialogTitle>
                    <DialogDescription>
                        {t("addon_clone_intro").replace("{title}", group?.title?.[L] || group?.title?.en || "")}
                    </DialogDescription>
                </DialogHeader>

                <form
                    id="clone-addon-group"
                    className="space-y-4"
                    onSubmit={(e) => {
                        e.preventDefault();
                        save();
                    }}
                >
                    <div className="space-y-1">
                        <label htmlFor="clone-addon-title" className="text-sm font-medium">
                            {t("group_title")}
                        </label>
                        <Input
                            id="clone-addon-title"
                            autoFocus
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            aria-invalid={taken}
                        />
                        {taken && (
                            <p role="alert" className="text-sm text-destructive" data-testid="clone-title-taken">
                                {t("addon_title_taken")}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="clone-addon-price" className="text-sm font-medium">
                            {t("addon_group_price")}
                        </label>
                        <Input
                            id="clone-addon-price"
                            type="number"
                            min={0}
                            step="0.01"
                            value={price}
                            placeholder="0.00"
                            onKeyDown={(e) => {
                                if (["-", "+", "e", "E"].includes(e.key)) e.preventDefault();
                            }}
                            onChange={(e) => setPrice(e.target.value)}
                        />
                        <p className="text-xs text-gray-500">{t("addon_clone_price_help")}</p>
                    </div>

                    <label className="flex cursor-pointer items-start gap-2">
                        <Checkbox
                            checked={sortAz}
                            onCheckedChange={(checked) => setSortAz(checked === true)}
                            className="mt-0.5 data-[state=checked]:border-[#DC3173] data-[state=checked]:bg-[#DC3173]"
                        />
                        <span className="space-y-0.5">
                            <span className="block text-sm font-medium">{t("addon_sort_az")}</span>
                            <span className="block text-xs text-gray-500">{t("addon_sort_az_help_create")}</span>
                        </span>
                    </label>
                </form>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
                        {t("cancel")}
                    </Button>
                    <Button
                        type="submit"
                        form="clone-addon-group"
                        disabled={!canSave}
                        className="bg-[#DC3173] text-white hover:bg-[#B02458]"
                    >
                        <Copy className="h-4 w-4" aria-hidden />
                        {t("addon_clone")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
