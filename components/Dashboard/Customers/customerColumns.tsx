import { Column } from "@/components/common/ReusableTable";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TCustomer } from "@/types/user.type";
import {
    CircleCheckBig,
    Cog,
    IdCard,
    Mail,
    MoreVertical,
    Phone,
} from "lucide-react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

type TFunction = (key: string) => string;

interface GetCustomerColumnsParams {
    t: TFunction;
    router: AppRouterInstance;
    handleStatusInfo: (
        customerId: string,
        customerName: string,
        status: string
    ) => void;
    handleDeleteId: (id: string) => void;
}

export function getCustomerColumns({
    t,
    router,
    handleStatusInfo,
    handleDeleteId,
}: GetCustomerColumnsParams): Column<TCustomer>[] {
    return [
        {
            header: (
                <div className="flex items-center gap-2 text-[#DC3173] ">
                    <IdCard className="w-4 h-4" />
                    <span>{t("name")}</span>
                </div>
            ),
            accessor: (customer) => {
                const name =
                    customer.name?.firstName || customer.name?.lastName
                        ? `${customer.name?.firstName ?? ""} ${customer.name?.lastName ?? ""}`.trim()
                        : "N/A";
                return <span className=" text-gray-900">{name}</span>;
            },
        },
        {
            header: (
                <div className="flex items-center gap-2 text-[#DC3173] ">
                    <Mail className="w-4 h-4" />
                    <span>{t("email")}</span>
                </div>
            ),
            accessor: (customer) => (
                <span className="text-gray-600">{customer.email || "N/A"}</span>
            ),
        },
        {
            header: (
                <div className="flex items-center gap-2 text-[#DC3173] ">
                    <Phone className="w-4 h-4" />
                    <span>{t("phone")}</span>
                </div>
            ),
            accessor: (customer) => (
                <span className="text-gray-600">{customer.contactNumber || "N/A"}</span>
            ),
        },
        {
            header: (
                <div className="flex items-center gap-2 text-[#DC3173] ">
                    <CircleCheckBig className="w-4 h-4" />
                    <span>{t("status")}</span>
                </div>
            ),
            accessor: (customer) => (
                <span className=" text-sm">
                    {customer.isDeleted ? "Deleted" : customer.status}
                </span>
            ),
        },
        {
            header: (
                <div className="flex items-center justify-end gap-2 text-[#DC3173]  pr-4">
                    <Cog className="w-4 h-4" />
                    <span>{t("actions")}</span>
                </div>
            ),
            className: "text-right pr-4",
            accessor: (customer) => {
                if (customer.isDeleted) return null;

                const fullName =
                    `${customer.name?.firstName ?? ""} ${customer.name?.lastName ?? ""}`.trim();

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                            <MoreVertical className="h-4 w-4 text-gray-500" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={() =>
                                    router.push(`/admin/all-customers/${customer.userId}`)
                                }
                            >
                                {t("view")}
                            </DropdownMenuItem>

                            {customer.status === "APPROVED" && (
                                <DropdownMenuItem
                                    onClick={() =>
                                        handleStatusInfo(
                                            customer.userId as string,
                                            fullName,
                                            "BLOCKED"
                                        )
                                    }
                                >
                                    {t("block")}
                                </DropdownMenuItem>
                            )}

                            {customer.status === "BLOCKED" && (
                                <DropdownMenuItem
                                    onClick={() =>
                                        handleStatusInfo(
                                            customer.userId as string,
                                            fullName,
                                            "UNBLOCKED"
                                        )
                                    }
                                >
                                    {t("unblock")}
                                </DropdownMenuItem>
                            )}

                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => handleDeleteId(customer.userId)}
                            >
                                {t("delete")}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];
}