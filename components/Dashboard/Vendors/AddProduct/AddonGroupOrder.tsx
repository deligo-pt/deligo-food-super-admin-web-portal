"use client";

import { TAddonGroup } from "@/types/add-ons.type";
import { moveItem } from "@/utils/addonGroup";
import { ArrowDown, ArrowUp, XIcon } from "lucide-react";

interface IProps {
  /** The product's Extra groups, in the order customers see them. */
  ids: string[];
  groups: TAddonGroup[] | undefined;
  lang: "en" | "pt";
  onChange: (ids: string[]) => void;
  t: (key: string) => string;
}

/**
 * The Extra groups picked for a product, numbered, with ↑ / ↓ to change the
 * order. The API keeps `addonGroups` in the order sent and customers see
 * them that way (backend change, 23 Nov 2026 — plan.md §11.6).
 */
export default function AddonGroupOrder({ ids, groups, lang, onChange, t }: IProps) {
  if (!ids?.length) return null;
  const other = lang === "en" ? "pt" : "en";
  const titleOf = (id: string) => {
    const group = groups?.find((item) => item._id === id);
    return group?.title?.[lang] || group?.title?.[other] || "";
  };
  const button =
    "rounded-md p-1 text-gray-400 hover:bg-[#DC3173]/10 hover:text-[#DC3173] disabled:pointer-events-none disabled:opacity-30";

  return (
    <div className="mb-2 space-y-1.5" data-testid="addon-group-order">
      {ids.length > 1 && <p className="text-xs text-gray-500">{t("addon_order_help")}</p>}
      <ol className="space-y-1.5">
        {ids.map((id, index) => {
          const title = titleOf(id);
          return (
            <li
              key={id}
              className="flex items-center gap-3 rounded-lg border border-[#DC3173]/20 bg-[#DC3173]/5 px-3 py-2"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#DC3173] text-xs font-semibold text-white">
                {index + 1}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-800">
                {title || <span className="italic text-gray-400">{t("addon_order_missing")}</span>}
              </span>
              <div className="flex shrink-0 items-center gap-0.5">
                <button
                  type="button"
                  className={button}
                  disabled={index === 0}
                  onClick={() => onChange(moveItem(ids, index, index - 1))}
                  aria-label={`${t("addon_order_up")}: ${title}`}
                  title={t("addon_order_up")}
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className={button}
                  disabled={index === ids.length - 1}
                  onClick={() => onChange(moveItem(ids, index, index + 1))}
                  aria-label={`${t("addon_order_down")}: ${title}`}
                  title={t("addon_order_down")}
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className={button}
                  onClick={() => onChange(ids.filter((item) => item !== id))}
                  aria-label={`${t("addon_order_remove")}: ${title}`}
                  title={t("addon_order_remove")}
                >
                  <XIcon className="h-4 w-4" />
                </button>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
