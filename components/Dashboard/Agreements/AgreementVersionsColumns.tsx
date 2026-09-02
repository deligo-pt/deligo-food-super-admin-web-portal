import { Column } from "@/components/common/ReusableTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IAgreementVersion } from "@/types/agreement.type";
import { Calendar, FileText, Tag, Eye } from "lucide-react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

type TFunction = (key: string) => string;

interface GetAgreementVersionColumnsParams {
    t: TFunction;
    router: AppRouterInstance;
}

export function getAgreementVersionColumns({
    t,
    router,
}: GetAgreementVersionColumnsParams): Column<IAgreementVersion>[] {
    return [
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <FileText className="w-4 h-4" />
                    {t("title")}
                </div>
            ),
            accessor: (row) => row.documentTitle || "N/A",
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <Tag className="w-4 h-4" />
                    {t("type")}
                </div>
            ),
            accessor: (row) => (
                <span className="capitalize">
                    {row.agreementType?.replace(/_/g, " ").toLowerCase()}
                </span>
            ),
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <Tag className="w-4 h-4" />
                    {t("status")}
                </div>
            ),
            accessor: (row) => (
                <Badge
                    variant={row.status === "DRAFT" ? "secondary" : "default"}
                    className="font-normal"
                >
                    {row.status}
                </Badge>
            ),
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <Calendar className="w-4 h-4" />
                    {t("date_created")}
                </div>
            ),
            accessor: (row) =>
                row.createdAt
                    ? new Date(row.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                    })
                    : "N/A",
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center justify-end">
                    {t("actions")}
                </div>
            ),
            className: "text-right",
            accessor: (agreement) => (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/admin/agreements/${agreement._id}`)}
                    className="h-8 gap-1.5 text-xs text-white bg-[#DC3173] hover:text-[#DC3173] hover:bg-pink-50"
                >
                    <Eye className="h-3.5 w-3.5" />
                    {t("view")}
                </Button>
            ),
        },
    ];
}