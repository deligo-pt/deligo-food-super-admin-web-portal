import { Column } from "@/components/common/ReusableTable";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { TCuisine } from "@/types/cuisine.type";
import { CircleCheckBig, Cog, ListIcon, MoreVertical } from "lucide-react";
import Image from "next/image";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { IStatusInfo } from "./DeleteCuisineModal";

type TFunction = (key: string) => string;

interface GetCuisineColumnsParams {
    t: TFunction;
    lang: string;
    router: AppRouterInstance;
    setSelectedEditCuisine: (cuisine: TCuisine) => void;
    setStatusInfo: (statusInfo: IStatusInfo) => void;
}

export function getCuisineColumns({
    t,
    lang,
    router,
    setSelectedEditCuisine,
    setStatusInfo,
}: GetCuisineColumnsParams): Column<TCuisine>[] {
    return [
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <ListIcon className="w-4" />
                    {t("name")}
                </div>
            ),
            accessor: (cuisine) => (
                <div className="flex items-center gap-3">
                    {cuisine.imageUrl && (
                        <div>
                            <Image
                                className="w-8 h-8 rounded-full object-cover"
                                src={cuisine.imageUrl}
                                alt={cuisine.name?.[lang as 'en' | 'pt'] || "Cuisine"}
                                width={32}
                                height={32}
                            />
                        </div>
                    )}
                    <p className="font-medium uppercase">{cuisine?.name?.[lang as 'en' | 'pt']}</p>
                </div>
            ),
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <CircleCheckBig className="w-4" />
                    {t("status")}
                </div>
            ),
            accessor: (cuisine) => (
                <span
                    className={cn(
                        "font-medium",
                        cuisine.isDeleted
                            ? "text-red-500"
                            : cuisine.isActive
                                ? "text-green-500"
                                : "text-yellow-500",
                    )}
                >
                    {cuisine.isDeleted
                        ? t("deleted")
                        : cuisine.isActive
                            ? t("active")
                            : t("inactive")}
                </span>
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
            accessor: (cuisine) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            onClick={() => router.push(`/admin/cuisine/${cuisine._id}`)}
                        >
                            {t("view")}
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => setSelectedEditCuisine(cuisine)}>
                            {t("edit")}
                        </DropdownMenuItem>

                        {!cuisine.isDeleted ? (
                            <>
                                <DropdownMenuItem
                                    onClick={() =>
                                        setStatusInfo({
                                            cuisineId: cuisine._id,
                                            isActive: !cuisine.isActive,
                                            field: "isActive",
                                        })
                                    }
                                >
                                    {cuisine.isActive ? t("deactivate") : t("activate")}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="text-amber-600 focus:text-amber-700"
                                    onClick={() =>
                                        setStatusInfo({ cuisineId: cuisine._id, field: "isDeleted" })
                                    }
                                >
                                    {t("soft_delete")}
                                </DropdownMenuItem>
                            </>
                        ) : (
                            <DropdownMenuItem disabled className="text-red-400">
                                {t("already_soft_deleted")}
                            </DropdownMenuItem>
                        )}

                        <DropdownMenuItem
                            className="text-red-600 focus:text-red-700 font-semibold"
                            onClick={() =>
                                setStatusInfo({
                                    cuisineId: cuisine._id,
                                    field: "isPermanentDelete",
                                })
                            }
                        >
                            {t("permanent_delete")}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];
}