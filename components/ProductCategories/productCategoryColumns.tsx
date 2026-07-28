
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { TProductCategoryResponse } from "@/types/category.type";
import {
    CircleCheckBig,
    Cog,
    InfoIcon,
    ListIcon,
    MoreVertical,
} from "lucide-react";
import Image from "next/image";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { Column } from "../common/ReusableTable";

type TFunction = (key: string) => string;

interface GetProductCategoryColumnsParams {
    t: TFunction;
    lang: string;
    router: AppRouterInstance;
    setStatusInfo: (info: {
        categoryId: string;
        isActive?: boolean;
        isDeleted?: boolean;
        field: "isActive" | "isDeleted" | "";
    }) => void;
}

export function getProductCategoryColumns({
    t,
    lang,
    router,
    setStatusInfo,
}: GetProductCategoryColumnsParams): Column<TProductCategoryResponse>[] {
    return [
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <ListIcon className="w-4" />
                    {t("name")}
                </div>
            ),
            accessor: (category) => {
                const name = category.name[lang as 'en' | 'pt'];
                return (
                    <div className="flex items-center gap-3">
                        {category.icon && (
                            <Image
                                className="w-8 h-8 rounded-full object-cover"
                                src={category.icon}
                                alt={name as string}
                                width={32}
                                height={32}
                            />
                        )}
                        <p>{name}</p>
                    </div>
                );
            },
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <InfoIcon className="w-4" />
                    {t("business_type")}
                </div>
            ),
            accessor: (category) =>
                category?.businessCategoryId?.name?.[lang as 'en' | 'pt'] || "N/A",
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <InfoIcon className="w-4" />
                    {t("description")}
                </div>
            ),
            accessor: (category) =>
                category?.description && category.description.length > 70
                    ? category.description.slice(0, 70) + "...."
                    : category?.description || "N/A",
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <CircleCheckBig className="w-4" />
                    {t("status")}
                </div>
            ),
            accessor: (category) => (
                <span
                    className={cn(
                        category.isDeleted
                            ? "text-red-500"
                            : category.isActive
                                ? "text-green-500"
                                : "text-yellow-500",
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
                <div className="text-[#DC3173] flex gap-2 items-center justify-end">
                    <Cog className="w-4" />
                    {t("actions")}
                </div>
            ),
            className: "text-right",
            accessor: (category) => (
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <MoreVertical className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            onClick={() =>
                                router.push("/admin/product-categories/" + category._id)
                            }
                        >
                            {t("view")}
                        </DropdownMenuItem>

                        {category.isDeleted ? (
                            <DropdownMenuItem className="text-red-500">
                                {t("deleted")}
                            </DropdownMenuItem>
                        ) : (
                            <>
                                <DropdownMenuItem
                                    onClick={() =>
                                        setStatusInfo({
                                            categoryId: category._id as string,
                                            isDeleted: true,
                                            field: "isDeleted",
                                        })
                                    }
                                >
                                    {t("delete")}
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                    onClick={() =>
                                        setStatusInfo({
                                            categoryId: category._id as string,
                                            isActive: !category.isActive,
                                            field: "isActive",
                                        })
                                    }
                                >
                                    {category.isActive ? t("deactivate") : t("activate")}
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];
}