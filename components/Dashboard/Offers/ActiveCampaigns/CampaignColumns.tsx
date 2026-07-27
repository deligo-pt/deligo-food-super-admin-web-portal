
import { Column } from "@/components/common/ReusableTable";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TOffer } from "@/types/offer.type";
import { format } from "date-fns";
import {
    CircleCheckBig,
    Clock,
    Cog,
    Edit3Icon,
    Hourglass,
    MoreVertical,
    PercentIcon,
    StoreIcon,
    TagsIcon,
} from "lucide-react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

type TFunction = (key: string) => string;

interface GetCampaignColumnsParams {
    t: TFunction;
    lang: string;
    router: AppRouterInstance;
    handleStatusInfo: (
        offerId: string,
        offerName: string,
        status: boolean,
    ) => void;
    handleOpenEditModal: (offer: TOffer) => void;
    handleDeleteId: (id: string) => void;
}

export function getCampaignColumns({
    t,
    lang,
    router,
    handleStatusInfo,
    handleOpenEditModal,
    handleDeleteId,
}: GetCampaignColumnsParams): Column<TOffer>[] {
    return [
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <StoreIcon className="w-4" />
                    {t("title")}
                </div>
            ),
            accessor: (offer) => offer?.title?.[lang as 'en' | 'pt'],
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <Edit3Icon className="w-4" />
                    {t("created_by")}
                </div>
            ),
            accessor: (offer) => (
                <div>
                    <div className="font-medium">
                        {offer.vendorId?.name?.firstName || "N/A"}{" "}
                        {offer.vendorId?.name?.lastName}
                    </div>
                    <div className="text-xs text-slate-500">
                        {offer?.vendorId?.userId}
                    </div>
                </div>
            ),
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <TagsIcon className="w-4" />
                    {t("type")}
                </div>
            ),
            accessor: "offerType",
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <PercentIcon className="w-4" />
                    {t("discount")}
                </div>
            ),
            accessor: (offer) =>
                offer.offerType === "PERCENT"
                    ? `${offer.discountValue}%`
                    : offer.offerType === "FLAT"
                        ? `€${offer.discountValue}`
                        : "N/A",
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <Clock className="w-4" />
                    {t("duration")}
                </div>
            ),
            accessor: (offer) =>
                offer.validFrom && offer.expiresAt
                    ? `${format(offer.validFrom, "yyyy-MM-dd")} to ${format(offer.expiresAt, "yyyy-MM-dd")}`
                    : "N/A",
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <CircleCheckBig className="w-4" />
                    {t("active_status")}
                </div>
            ),
            accessor: (offer) => (offer?.isActive ? "Active" : "Inactive"),
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <Hourglass className="w-4" />
                    {t("expire_status")}
                </div>
            ),
            accessor: (offer) =>
                new Date(offer.expiresAt).getTime() - new Date().getTime() > 0
                    ? "Live"
                    : "Expired",
        },
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center justify-end">
                    <Cog className="w-4" />
                    {t("actions")}
                </div>
            ),
            className: "text-right",
            accessor: (offer) => (
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <MoreVertical className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            onClick={() =>
                                router.push("/admin/all-offers/" + offer._id)
                            }
                        >
                            {t("view")}
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => handleOpenEditModal(offer)}>
                            {t("edit")}
                        </DropdownMenuItem>

                        {offer.isActive && (
                            <DropdownMenuItem
                                onClick={() =>
                                    handleStatusInfo(
                                        offer._id,
                                        offer.title?.[lang as 'en' | 'pt'] as string,
                                        false,
                                    )
                                }
                            >
                                {t("deactivate")}
                            </DropdownMenuItem>
                        )}

                        {!offer.isActive && (
                            <DropdownMenuItem
                                onClick={() =>
                                    handleStatusInfo(
                                        offer._id,
                                        offer.title?.[lang as 'en' | 'pt'] as string,
                                        true,
                                    )
                                }
                            >
                                {t("activate")}
                            </DropdownMenuItem>
                        )}

                        <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteId(offer._id)}
                        >
                            {t("delete")}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];
}