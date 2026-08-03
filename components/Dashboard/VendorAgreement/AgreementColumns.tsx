import { Column } from "@/components/common/ReusableTable";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IAgreement } from "@/types/agreement.type";
import {
    CircleCheckBig,
    Cog,
    FileText,
    Mail,
    MoreVertical,
    Phone,
} from "lucide-react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

type TFunction = (key: string) => string;

interface GetAgreementColumnsParams {
    t: TFunction;
    router: AppRouterInstance;
}

const getStatusClass = (status: string) => {
    switch (status?.toLowerCase()) {
        case "signed":
            return "bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider";
        case "emailed":
            return "bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider";
        default:
            return "bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider";
    }
};

export function getAgreementColumns({
    t,
    router,
}: GetAgreementColumnsParams): Column<IAgreement>[] {
    return [
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <FileText className="w-4" />
                    {t("establishment")}
                </div>
            ),
            accessor: (row) => row.establishmentName || "N/A",
        },

        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <Mail className="w-4" />
                    {t("email")}
                </div>
            ),
            accessor: "email",
        },

        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <Phone className="w-4" />
                    {t("phone")}
                </div>
            ),
            accessor: "contactNumber",
        },

        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <CircleCheckBig className="w-4" />
                    {t("status")}
                </div>
            ),
            accessor: (agreement) => (
                <span className={getStatusClass(agreement.status)}>
                    {agreement.status}
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
            accessor: (agreement) => (
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <MoreVertical className="h-4 w-4" />
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-32">
                        <DropdownMenuItem
                            onClick={() =>
                                router.push(`/admin/vendor-agreements/${agreement._id}`)
                            }
                        >
                            {t("view")}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];
}