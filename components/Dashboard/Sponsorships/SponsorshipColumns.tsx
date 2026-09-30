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
    MapPin,
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
                    <MapPin className="w-4" />
                    {t("targeted_zones") || "Targeted Zones"}
                </div>
            ),
            accessor: (s) => {
                const zones = s?.targetZoneIds || [];
                if (zones.length === 0) return <span className="text-slate-400">N/A</span>;

                const firstZone = zones[0].zoneName;
                const remainingCount = zones.length - 1;

                return (
                    <div className="flex items-center gap-1.5">
                        <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 text-xs font-medium">
                            {firstZone}
                        </span>
                        {remainingCount > 0 && (
                            <span className="text-xs text-slate-500 font-semibold">
                                +{remainingCount}
                            </span>
                        )}
                    </div>
                );
            },
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
                `${format(new Date(s.startDate), "do MMM yyyy")} - ${format(
                    new Date(s.endDate),
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