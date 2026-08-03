import { Column } from "@/components/common/ReusableTable";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TRestrictedItem } from "@/types/product.type";
import { format } from "date-fns";
import {
    Calendar,
    Cog,
    Layers,
    MessageSquareWarning,
    MoreVertical,
    PackageX,
} from "lucide-react";

type TFunction = (key: string) => string;

interface GetRestrictedItemColumnsParams {
    t: TFunction;
    onEdit: (item: TRestrictedItem) => void;
    onDelete: (id: string) => void;
}

export function getRestrictedItemColumns({
    t,
    onEdit,
    onDelete,
}: GetRestrictedItemColumnsParams): Column<TRestrictedItem>[] {
    return [
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <PackageX className="w-4" />
                    {t("name")}
                </div>
            ),
            accessor: "name",
        },

        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <Layers className="w-4" />
                    {t("category_lg")}
                </div>
            ),
            accessor: "category",
        },

        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <MessageSquareWarning className="w-4" />
                    {t("reason")}
                </div>
            ),
            accessor: "reason",
        },

        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <Calendar className="w-4" />
                    {t("date")}
                </div>
            ),
            accessor: (item) => format(item.createdAt, "do MMM yyyy"),
        },

        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center justify-end">
                    <Cog className="w-4" />
                    {t("actions")}
                </div>
            ),
            className: "text-right",
            accessor: (item) => (
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <MoreVertical className="h-4 w-4" />
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(item)}>
                            {t("edit")}
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => onDelete(item._id)}
                        >
                            {t("delete")}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];
}