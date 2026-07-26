
import { Column } from "@/components/common/ReusableTable";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TOrder } from "@/types/order.type";
import { formatPrice } from "@/utils/formatPrice";
import { format } from "date-fns";
import {
    CalendarIcon,
    CheckCheckIcon,
    CheckCircleIcon,
    Cog,
    EuroIcon,
    HashIcon,
    MoreVertical,
    PackageIcon,
    UserIcon,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

type TFunction = (key: string) => string;

interface GetOrderColumnsParams {
    t: TFunction;
    router: AppRouterInstance;
    setOrderId: (value: string) => void;
}

export function getOrderColumns({
    t,
    router,
    setOrderId
}: GetOrderColumnsParams): Column<TOrder>[] {
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
                    <UserIcon className="w-4" />
                    {t("customer")}
                </div>
            ),
            accessor: (order) => (
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage src={order.customerId?.profilePhoto} />
                        <AvatarFallback>
                            {order.customerId?.name?.firstName?.charAt(0)}
                            {order.customerId?.name?.lastName?.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="font-medium">
                            {order.customerId?.name?.firstName}{" "}
                            {order.customerId?.name?.lastName}
                        </div>
                        <div className="text-xs text-slate-500">
                            {order.deliveryAddress.street}, {order.deliveryAddress.city}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <PackageIcon className="w-4" />
                    {t("items")}
                </div>
            ),
            accessor: (order) =>
                order?.items?.map((i, index) => (
                    <span key={index}>
                        {i.name} x {i.itemSummary?.quantity}
                        {index < (order.items?.length ?? 0) - 1 ? ", " : ""}
                    </span>
                )),
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <EuroIcon className="w-4" />
                    {t("amount")}
                </div>
            ),
            accessor: (order) =>
                `€${formatPrice(order.payoutSummary?.grandTotal || 0)}`,
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <CheckCircleIcon className="w-4" />
                    {t("order_status")}
                </div>
            ),
            accessor: (order) =>
                order.orderStatus
                    ?.split("_")
                    ?.map((word) => word.charAt(0) + word.slice(1)?.toLowerCase())
                    ?.join(" "),
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <CheckCheckIcon className="w-4" />
                    {t("payment_status")}
                </div>
            ),
            accessor: (order) =>
                order.paymentStatus
                    ?.split("_")
                    ?.map((word) => word.charAt(0) + word.slice(1)?.toLowerCase())
                    ?.join(" "),
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
            accessor: (order) => {
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <MoreVertical className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={() => router.push("/admin/all-orders/" + order.orderId)}
                            >
                                {t("view")}
                            </DropdownMenuItem>
                            {(order?.isPaid || order?.paymentStatus === "PAID") &&
                                (order?.orderStatus === "REJECTED" || order?.orderStatus === "CANCELED") && (
                                    <DropdownMenuItem
                                        onClick={() => setOrderId(order?.orderId)}
                                    >
                                        {t("refund")}
                                    </DropdownMenuItem>
                                )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            }
        },
    ];
}