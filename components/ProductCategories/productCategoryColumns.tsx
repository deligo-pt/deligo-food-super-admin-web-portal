import { Column } from "../common/ReusableTable";
import { TProductCategoryResponse } from "@/types/category.type";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { CircleCheckBig, Cog, ListIcon, Edit } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type TFunction = (key: string) => string;

interface GetProductCategoryColumnsParams {
    t: TFunction;
    lang: string;
    router: AppRouterInstance;
    onEdit?: (category: TProductCategoryResponse) => void;
}

export function getProductCategoryColumns({
    t,
    lang,
    onEdit,
}: GetProductCategoryColumnsParams): Column<TProductCategoryResponse>[] {
    return [
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center font-bold text-xs uppercase tracking-wider">
                    <ListIcon className="w-4" />
                    {t("name")}
                </div>
            ),
            accessor: (category) => {
                const name = category.name?.[lang as 'en' | 'pt'] || category.name?.['en'];
                return (
                    <div className="flex items-center gap-3">
                        {category.icon && (
                            <Image
                                className="w-8 h-8 rounded-full object-cover"
                                src={category.icon}
                                alt={typeof name === "string" ? name : "Category"}
                                width={32}
                                height={32}
                            />
                        )}
                        <span className="font-medium text-gray-900">{name}</span>
                    </div>
                );
            },
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center font-bold text-xs uppercase tracking-wider">
                    <CircleCheckBig className="w-4" />
                    {t("status")}
                </div>
            ),
            accessor: (category) => (
                <span
                    className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold uppercase",
                        category.isDeleted
                            ? "bg-rose-50 text-rose-600"
                            : category.isActive
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-amber-50 text-amber-700"
                    )}
                >
                    {category.isDeleted
                        ? t("deleted")
                        : category.isActive
                            ? t("active")
                            : t("inactive")}
                </span>
            ),
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center justify-end font-bold text-xs uppercase tracking-wider">
                    <Cog className="w-4" />
                    {t("actions")}
                </div>
            ),
            className: "text-right",
            accessor: (category) => (
                <div className="flex justify-end">
                    {!category.isDeleted && (
                        <button
                            onClick={() => onEdit?.(category)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-medium text-[#DC3173] hover:bg-rose-50 shadow-xs transition-all active:scale-98 cursor-pointer"
                        >
                            <Edit size={14} />
                            {t("edit")}
                        </button>
                    )}
                </div>
            ),
        },
    ];
}