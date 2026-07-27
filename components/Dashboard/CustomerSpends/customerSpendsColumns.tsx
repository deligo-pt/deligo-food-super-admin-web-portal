import { Column } from "@/components/common/ReusableTable";
import { Button } from "@/components/ui/button";
import { TTransaction } from "@/types/transaction.type";
import { formatPrice } from "@/utils/formatPrice";
import { format } from "date-fns";
import {
    CalendarIcon,
    EuroIcon,
    EyeIcon,
    PackageIcon,
    UserIcon,
} from "lucide-react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

type TFunction = (key: string) => string;

interface GetCustomerSpendColumnsParams {
    t: TFunction;
    lang: string;
    router: AppRouterInstance;
}

export function getCustomerSpendColumns({
    t,
    lang,
    router,
}: GetCustomerSpendColumnsParams): Column<TTransaction>[] {
    return [
        {
            header: (
                <div className="flex items-center gap-2 text-[#DC3173] font-medium">
                    <UserIcon className="w-4 h-4" />
                    <span>{t("customer")}</span>
                </div>
            ),
            accessor: (spend) => {
                const firstName = spend.customer?.name?.firstName;
                const lastName = spend.customer?.name?.lastName;
                const fullName =
                    firstName || lastName ? `${firstName ?? ""} ${lastName ?? ""}`.trim() : "N/A";

                return <span className="font-medium text-gray-900">{fullName}</span>;
            },
        },
        {
            header: (
                <div className="flex items-center gap-2 text-[#DC3173] font-medium">
                    <PackageIcon className="w-4 h-4" />
                    <span>{t("items")}</span>
                </div>
            ),
            accessor: (spend) => (
                <div className="space-y-0.5">
                    {spend.items?.map((item, index) => (
                        <p key={index} className="text-sm text-gray-700">
                            {item?.name?.[lang as keyof typeof item.name]} (x{item.qty})
                        </p>
                    ))}
                </div>
            ),
        },
        {
            header: (
                <div className="flex items-center gap-2 text-[#DC3173] font-medium">
                    <EuroIcon className="w-4 h-4" />
                    <span>{t("amount")}</span>
                </div>
            ),
            accessor: (spend) => (
                <span className="font-semibold text-gray-900">
                    €{formatPrice(spend.amount || 0)}
                </span>
            ),
        },
        {
            header: (
                <div className="flex items-center gap-2 text-[#DC3173] font-medium">
                    <CalendarIcon className="w-4 h-4" />
                    <span>{t("date")}</span>
                </div>
            ),
            accessor: (spend) => (
                <span className="text-sm text-gray-600 whitespace-nowrap">
                    {spend.createdAt ? format(new Date(spend.createdAt), "do MMM yyyy") : "N/A"}
                </span>
            ),
        },
        {
            header: (
                <div className="text-[#DC3173] font-medium text-right pr-4">
                    {t("actions")}
                </div>
            ),
            className: "text-right pr-4",
            accessor: (spend) => (
                <Button
                    onClick={() =>
                        router.push(`/admin/customer-spends/${spend.transactionId}`)
                    }
                    size="sm"
                    className="bg-[#DC3173] flex items-center gap-2 hover:bg-[#DC3173]/90 ml-auto"
                >
                    <EyeIcon className="w-4 h-4" />
                    {t("view")}
                </Button>
            ),
        },
    ];
}