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
import {
  addVariationReq,
  getVendorProductsForVariationCloneReq,
} from "@/services/dashboard/product/variation.service";
import { useStore } from "@/store/store";
import { TProduct } from "@/types/product.type";
import { cloneVariationsPayloads } from "@/utils/addonGroup";
import { Copy, ImageIcon, Loader2, Search } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface IProps {
  /** The product whose variations are copied. */
  source: TProduct;
  /** The vendor's Mongo `_id`: the picker lists this store's products. */
  vendorMongoId: string;
  onClose: () => void;
  t: (key: string) => string;
}

/**
 * Clone variations (plan.md §11.5, copy of the vendor panel's): copy
 * `source`'s variations onto other products of the same store. Only products without variations can take
 * them (one group per product, 23 Oct 2026); the rest are greyed out.
 * Mounted only while open, so it starts fresh each time.
 */
export default function CloneVariationsDialog({ source, vendorMongoId, onClose, t }: IProps) {
  const { lang: storeLang } = useStore();
  const lang = storeLang as "en" | "pt";
  const router = useRouter();
  const [products, setProducts] = useState<TProduct[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getVendorProductsForVariationCloneReq(vendorMongoId, lang).then((result) => {
      if (cancelled) return;
      if (result.success) setProducts((result.data as TProduct[]) ?? []);
      else setLoadFailed(true);
    });
    return () => {
      cancelled = true;
    };
  }, [lang, vendorMongoId]);

  const nameOf = (product: TProduct) => product.name?.[lang] || product.name?.en || product.name?.pt || product.productId;

  const candidates = useMemo(() => {
    const wanted = search.trim().toLocaleLowerCase();
    return (products ?? [])
      .filter((product) => product.productId !== source.productId)
      .filter((product) => !wanted || nameOf(product).toLocaleLowerCase().includes(wanted))
      .sort((a, b) => {
        // Products that can take the variations first, then A→Z.
        const aHas = a.variations?.length ? 1 : 0;
        const bHas = b.variations?.length ? 1 : 0;
        return aHas - bHas || nameOf(a).localeCompare(nameOf(b), lang);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, search, source.productId, lang]);

  const toggle = (productId: string, checked: boolean) => {
    setSelected((previous) => {
      const next = new Set(previous);
      if (checked) next.add(productId);
      else next.delete(productId);
      return next;
    });
  };

  const save = async () => {
    const payloads = cloneVariationsPayloads(source.variations);
    if (!payloads.length || !selected.size) return;
    setSaving(true);
    const toastId = toast.loading(t("variation_clone_saving"));
    const targets = (products ?? []).filter((product) => selected.has(product.productId));
    const failed: string[] = [];
    // One product at a time, one variation group at a time: a few calls,
    // well inside the API's 100 a minute.
    for (const target of targets) {
      let ok = true;
      for (const payload of payloads) {
        const result = await addVariationReq(target.productId, payload);
        if (!result.success) {
          ok = false;
          break;
        }
      }
      if (!ok) failed.push(nameOf(target));
    }
    setSaving(false);
    router.refresh();

    const done = targets.length - failed.length;
    if (!failed.length) {
      toast.success(t("variation_clone_done").replace("{count}", String(done)), { id: toastId });
      onClose();
      return;
    }
    toast.error(
      t("variation_clone_partial")
        .replace("{done}", String(done))
        .replace("{count}", String(targets.length))
        .replace("{failed}", failed.join(", ")),
      { id: toastId, duration: 10000 },
    );
    // Keep only the ones that failed ticked, to try again.
    setSelected(new Set(targets.filter((target) => failed.includes(nameOf(target))).map((target) => target.productId)));
  };

  const optionCount = (source.variations ?? []).reduce((sum, variation) => sum + (variation.options?.length ?? 0), 0);

  return (
    <Dialog open onOpenChange={(open) => !open && !saving && onClose()}>
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5 text-[#DC3173]" aria-hidden />
            {t("variation_clone_title")}
          </DialogTitle>
          <DialogDescription>
            {t("variation_clone_intro").replace("{product}", nameOf(source))}
          </DialogDescription>
        </DialogHeader>

        {/* What gets copied */}
        <div className="rounded-lg border border-[#DC3173]/20 bg-[#DC3173]/5 px-3 py-2 text-sm">
          {(source.variations ?? []).map((variation, index) => (
            <p key={index} className="text-gray-800">
              <span className="font-semibold">{variation.name?.[lang] || variation.name?.en}</span>
              {": "}
              {variation.options
                .map((option) => `${option.label?.[lang] || option.label?.en} (${Number(option.price).toFixed(2)} €)`)
                .join(", ")}
            </p>
          ))}
          <p className="mt-1 text-xs text-gray-500">
            {optionCount} {optionCount === 1 ? t("option") : t("options").toLowerCase()}
            {" · "}
            {t("variation_clone_stock_note")}
          </p>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("variation_clone_search")}
            aria-label={t("variation_clone_search")}
            className="pl-9"
          />
        </div>

        <div className="min-h-40 flex-1 overflow-y-auto rounded-lg border" data-testid="variation-clone-list">
          {products === null && !loadFailed && (
            <p role="status" className="flex items-center justify-center gap-2 py-10 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin text-[#DC3173]" aria-hidden />
              {t("variation_clone_loading")}
            </p>
          )}
          {loadFailed && (
            <p role="alert" className="py-10 text-center text-sm text-destructive">
              {t("variation_clone_load_failed")}
            </p>
          )}
          {products !== null && !candidates.length && (
            <p className="py-10 text-center text-sm text-gray-500">{t("variation_clone_none")}</p>
          )}
          {candidates.map((product) => {
            const hasOwn = !!product.variations?.length;
            const id = `clone-target-${product.productId}`;
            return (
              <label
                key={product.productId}
                htmlFor={id}
                className={`flex items-center gap-3 border-b px-3 py-2 last:border-b-0 ${
                  hasOwn ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-gray-50"
                }`}
              >
                <Checkbox
                  id={id}
                  disabled={hasOwn || saving}
                  checked={selected.has(product.productId)}
                  onCheckedChange={(checked) => toggle(product.productId, checked === true)}
                  className="data-[state=checked]:border-[#DC3173] data-[state=checked]:bg-[#DC3173]"
                />
                {product.image ? (
                  <Image
                    src={product.image as string}
                    alt=""
                    width={36}
                    height={36}
                    className="h-9 w-9 shrink-0 rounded-md border object-cover"
                  />
                ) : (
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border bg-gray-50 text-gray-300">
                    <ImageIcon className="h-4 w-4" aria-hidden />
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-gray-900">{nameOf(product)}</span>
                  <span className="block truncate text-xs text-gray-500">
                    {hasOwn ? t("variation_clone_has_own") : product.category?.name?.[lang]}
                  </span>
                </span>
              </label>
            );
          })}
        </div>

        <DialogFooter className="items-center sm:justify-between">
          <span className="text-sm text-gray-500">
            {t("variation_clone_selected").replace("{count}", String(selected.size))}
          </span>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              {t("cancel")}
            </Button>
            <Button
              type="button"
              onClick={save}
              disabled={!selected.size || saving}
              className="bg-[#DC3173] text-white hover:bg-[#B02458]"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
              {t("variation_clone_submit").replace("{count}", String(selected.size))}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
