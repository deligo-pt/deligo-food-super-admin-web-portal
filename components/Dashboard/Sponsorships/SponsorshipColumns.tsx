import { Column } from "@/components/common/ReusableTable";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TSponsorship } from "@/types/sponsorship.type";
import { format } from "date-fns";
import {
    Building2,
    CalendarIcon,
    CircleCheckBig,
    Cog,
    ImageIcon,
    MoreVertical,
} from "lucide-react";
import Image from "next/image";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

type TFunction = (key: string) => string;

interface Params {
    t: TFunction;
    router: AppRouterInstance;
    handleDeleteId: (id: string) => void;
    handleOpenEditModal: (s: TSponsorship) => void;
}

export function getSponsorshipColumns({
    t,
    router,
    handleDeleteId,
    handleOpenEditModal,
}: Params): Column<TSponsorship>[] {
    return [
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <ImageIcon className="w-4" />
                    {t("banner")}
                </div>
            ),
            accessor: (s) => (
                <Image
                    src={s.bannerImage}
                    alt={s.sponsorName}
                    width={50}
                    height={50}
                    className="rounded-lg w-32 h-16 object-cover"
                />
            ),
        },

        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <Building2 className="w-4" />
                    {t("name")}
                </div>
            ),
            accessor: "sponsorName",
        },

        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <Building2 className="w-4" />
                    {t("type")}
                </div>
            ),
            accessor: "sponsorType",
        },

        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <CircleCheckBig className="w-4" />
                    {t("status")}
                </div>
            ),
            accessor: (s) => (s.isActive ? t("active") : t("inactive")),
        },

        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <CalendarIcon className="w-4" />
                    {t("period")}
                </div>
            ),
            accessor: (s) =>
                `${format(s.startDate, "do MMM yyyy")} - ${format(
                    s.endDate,
                    "do MMM yyyy"
                )}`,
        },

        {
            header: (
                <div className="text-[#DC3173] flex justify-end gap-2 items-center">
                    <Cog className="w-4" />
                    {t("actions")}
                </div>
            ),
            className: "text-right",
            accessor: (s) => (
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <MoreVertical className="h-4 w-4" />
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            onClick={() => router.push(`/admin/sponsorships/${s._id}`)}
                        >
                            {t("view")}
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => handleOpenEditModal(s)}>
                            {t("edit")}
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteId(s._id)}
                        >
                            {t("delete")}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];
}