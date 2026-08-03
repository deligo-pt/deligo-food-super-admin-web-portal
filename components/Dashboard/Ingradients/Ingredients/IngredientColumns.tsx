import { Column } from "@/components/common/ReusableTable";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TIngredient } from "@/types/ingredient.type";
import {
    Cog,
    ComponentIcon,
    EuroIcon,
    MoreVertical,
    Warehouse,
} from "lucide-react";
import Image from "next/image";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

type TFunction = (key: string) => string;

interface GetIngredientColumnsParams {
    t: TFunction;
    router: AppRouterInstance;
    onEdit: (ingredient: TIngredient) => void;
    onDelete: (id: string, type: "soft" | "permanent") => void;
}

export function getIngredientColumns({
    t,
    router,
    onEdit,
    onDelete,
}: GetIngredientColumnsParams): Column<TIngredient>[] {
    return [
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <ComponentIcon className="w-4" />
                    {t("ingredient")}
                </div>
            ),
            accessor: (ingredient) => (
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded overflow-hidden relative shrink-0">
                        <Image
                            src={ingredient.image}
                            alt={ingredient.name}
                            width={48}
                            height={48}
                            className="rounded w-full h-full object-cover"
                        />
                    </div>

                    <div>
                        <div className="font-medium">{ingredient.name}</div>

                        <div className="text-xs text-slate-500 flex items-center gap-2">
                            <span>{ingredient.category}</span>

                            <span className="text-slate-300">|</span>

                            <span className="font-mono bg-slate-100 px-1 rounded text-[10px]">
                                {ingredient.sku}
                            </span>
                        </div>
                    </div>
                </div>
            ),
        },

        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <EuroIcon className="w-4" />
                    {t("price")}
                </div>
            ),
            accessor: (ingredient) => `€${ingredient.price}`,
        },

        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <Warehouse className="w-4" />
                    {t("stock")}
                </div>
            ),
            accessor: (ingredient) => (
                <>
                    {ingredient.stock}{" "}
                    <span className="text-xs text-slate-400 font-normal">
                        {ingredient.unit}
                    </span>
                </>
            ),
        },

        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center justify-end">
                    <Cog className="w-4" />
                    {t("actions")}
                </div>
            ),
            className: "text-right",
            accessor: (ingredient) => (
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <MoreVertical className="h-4 w-4" />
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            onClick={() =>
                                router.push("/admin/all-ingredients/" + ingredient.sku)
                            }
                        >
                            {t("view")}
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => onEdit(ingredient)}>
                            {t("edit")}
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            className="text-destructive font-medium cursor-pointer"
                            onClick={() => onDelete(ingredient._id, "soft")}
                        >
                            {t("soft_delete")}
                        </DropdownMenuItem>

                        {/* <DropdownMenuItem
                            className="font-bold cursor-pointer bg-red-50/30 text-red-600 focus:bg-red-50"
                            onClick={() => onDelete(ingredient._id, "permanent")}
                        >
                            {t("permanent_delete")}
                        </DropdownMenuItem> */}
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];
}