import { Column } from "@/components/common/ReusableTable";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TTax } from "@/types/tax.type";
import {
    Barcode,
    BookText,
    CheckCircle,
    CircleCheckBig,
    Cog,
    HashIcon,
    MoreVerticalIcon,
    Percent,
    XCircle,
} from "lucide-react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

type TFunction = (key: string) => string;

interface Params {
    t: TFunction;
    lang: string;
    router: AppRouterInstance;
    onEditClick: (tax: TTax) => void;
    onStatusChange: (id: string, status: boolean) => void;
    onDeleteClick: (id: string) => void;
    onPermanentDelete: (id: string) => void;
}

export function getTaxColumns({
    t,
    lang,
    router,
    onEditClick,
    onStatusChange,
    onDeleteClick,
    onPermanentDelete,
}: Params): Column<TTax>[] {
    return [
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <BookText className="w-4" />
                    {t("name")}
                </div>
            ),
            accessor: (tax) => tax.taxName?.[lang as keyof typeof tax.taxName] || "N/A",
        },

        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <Barcode className="w-4" />
                    {t("tax_code")}
                </div>
            ),
            accessor: "taxCode",
        },

        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <Percent className="w-4" />
                    {t("rate")}
                </div>
            ),
            accessor: "taxRate",
        },

        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <HashIcon className="w-4" />
                    {t("country_id")}
                </div>
            ),
            accessor: "countryID",
        },

        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <CircleCheckBig className="w-4" />
                    {t("active")}
                </div>
            ),
            accessor: (tax) =>
                tax.isActive ? (
                    <div className="flex gap-1 items-center text-green-500">
                        <CheckCircle size={16} /> {t("yes")}
                    </div>
                ) : (
                    <div className="flex gap-1 items-center text-destructive">
                        <XCircle size={16} /> {t("no")}
                    </div>
                ),
        },

        {
            header: (
                <div className="text-[#DC3173] flex justify-end gap-2 items-center">
                    <Cog className="w-4" />
                    {t("actions")}
                </div>
            ),
            className: "text-right",
            accessor: (tax) => (
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <MoreVerticalIcon className="h-4 w-4" />
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            onClick={() => router.push(`/admin/all-taxes/${tax._id}`)}
                        >
                            {t("view")}
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => onEditClick(tax)}>
                            {t("edit")}
                        </DropdownMenuItem>

                        {tax.isActive ? (
                            <DropdownMenuItem
                                className="text-yellow-600"
                                onClick={() => onStatusChange(tax._id, false)}
                            >
                                {t("deactivate")}
                            </DropdownMenuItem>
                        ) : (
                            <>
                                <DropdownMenuItem
                                    className="text-green-600"
                                    onClick={() => onStatusChange(tax._id, true)}
                                >
                                    {t("activate")}
                                </DropdownMenuItem>

                                {tax.isDeleted === false ? (
                                    <DropdownMenuItem
                                        className="text-destructive"
                                        onClick={() => onDeleteClick(tax._id)}
                                    >
                                        {t("delete")}
                                    </DropdownMenuItem>
                                ) : (
                                    <DropdownMenuItem
                                        className="text-destructive"
                                        onClick={() => onPermanentDelete(tax._id)}
                                    >
                                        {t("permanent_delete")}
                                    </DropdownMenuItem>
                                )}
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];
}