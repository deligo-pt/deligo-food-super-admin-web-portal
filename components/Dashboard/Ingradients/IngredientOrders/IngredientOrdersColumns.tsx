import { Column } from "@/components/common/ReusableTable";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TIngredientOrder } from "@/types/ingredient.type";
import { formatPrice } from "@/utils/formatPrice";
import { format } from "date-fns";
import {
    CalendarIcon,
    CheckCircleIcon,
    ClockIcon,
    Cog,
    EuroIcon,
    HashIcon,
    MoreVertical,
    PackageIcon,
    StoreIcon,
    TruckIcon,
    Warehouse,
} from "lucide-react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

type TFunction = (key: string) => string;

interface GetIngredientOrderColumnsParams {
    t: TFunction;
    router: AppRouterInstance;
    updateStatus: (id: string, status: "SHIPPED" | "DELIVERED") => Promise<void>;
}

export function getIngredientOrderColumns({
    t,
    router,
    updateStatus,
}: GetIngredientOrderColumnsParams): Column<TIngredientOrder>[] {

    const getStatusBadge = (status: TIngredientOrder["orderStatus"]) => {
        switch (status) {
            case "DELIVERED":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#DC3173]/10 text-[#DC3173]">
                        <CheckCircleIcon size={12} />
                        Delivered
                    </span>
                );

            case "SHIPPED":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
                        <TruckIcon size={12} />
                        Shipped
                    </span>
                );

            case "CONFIRMED":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
                        <PackageIcon size={12} />
                        Confirmed
                    </span>
                );

            case "PENDING":
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                        <ClockIcon size={12} />
                        Pending
                    </span>
                );
        }
    };

    return [
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <HashIcon className="w-4" />
                    {t("order_id")}
                </div>
            ),
            accessor: "orderId",
        },

        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <StoreIcon className="w-4" />
                    {t("vendor")}
                </div>
            ),
            accessor: (order) => (
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage src={order.vendorId?.profilePhoto} />
                        <AvatarFallback>
                            {order.vendorId?.businessDetails?.businessName
                                ?.split(" ")
                                ?.map((n) => n[0])
                                ?.join("")}
                        </AvatarFallback>
                    </Avatar>

                    <div>
                        <div className="font-medium">
                            {order.vendorId?.businessDetails?.businessName}
                        </div>

                        <div className="text-xs text-slate-500">
                            {order.vendorId?.email}
                        </div>
                    </div>
                </div>
            ),
        },

        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <Warehouse className="w-4" />
                    {t("items")}
                </div>
            ),
            accessor: (order) =>
                order.orderDetails
                    ?.map(
                        (detail) =>
                            `${detail.ingredientId?.name} (x${detail.quantity})`,
                    )
                    .join(", "),
        },

        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <EuroIcon className="w-4" />
                    {t("total")}
                </div>
            ),
            accessor: (order) => `€${formatPrice(order.grandTotal)}`,
        },

        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <CheckCircleIcon className="w-4" />
                    {t("status")}
                </div>
            ),
            accessor: (order) => getStatusBadge(order.orderStatus),
        },

        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <CalendarIcon className="w-4" />
                    {t("date")}
                </div>
            ),
            accessor: (order) => format(order.createdAt, "do MMM yyyy"),
        },

        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center justify-end">
                    <Cog className="w-4" />
                    {t("actions")}
                </div>
            ),
            className: "text-right",
            accessor: (order) => (
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <MoreVertical className="h-4 w-4" />
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            onClick={() =>
                                router.push("/admin/ingredient-orders/" + order.orderId)
                            }
                        >
                            {t("view")}
                        </DropdownMenuItem>

                        {order.orderStatus === "CONFIRMED" && (
                            <DropdownMenuItem
                                onClick={() =>
                                    updateStatus(order.orderId, "SHIPPED")
                                }
                            >
                                {t("update_to_shipped")}
                            </DropdownMenuItem>
                        )}

                        {order.orderStatus === "SHIPPED" && (
                            <DropdownMenuItem
                                onClick={() =>
                                    updateStatus(order.orderId, "DELIVERED")
                                }
                            >
                                {t("update_to_delivered")}
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];
}