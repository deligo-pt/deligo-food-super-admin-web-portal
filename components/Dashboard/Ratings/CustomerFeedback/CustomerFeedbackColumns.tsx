import { Column } from "@/components/common/ReusableTable";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TRating } from "@/types/rating.type";
import { format } from "date-fns";
import {
    CalendarIcon,
    Cog,
    MoreVertical,
    QuoteIcon,
    StarIcon,
    TagsIcon,
    UserIcon,
} from "lucide-react";

type TFunction = (key: string) => string;

interface Params {
    t: TFunction;
    openDetailsSheet: (feedback: TRating) => void;
}

export function getCustomerFeedbackColumns({
    t,
    openDetailsSheet,
}: Params): Column<TRating>[] {
    return [
        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <UserIcon className="w-4" />
                    {t("customer")}
                </div>
            ),
            accessor: (f) => (
                <div className="flex gap-4 items-center">
                    <Avatar className="w-8 h-8">
                        <AvatarImage src={f.reviewerId?.profilePhoto} />
                        <AvatarFallback>
                            {f.reviewerId?.name?.firstName?.charAt(0)}
                            {f.reviewerId?.name?.lastName?.charAt(0)}
                        </AvatarFallback>
                    </Avatar>

                    <div>
                        <h3>
                            {f.reviewerId?.name?.firstName || f.reviewerId?.name?.lastName
                                ? `${f.reviewerId?.name?.firstName} ${f.reviewerId?.name?.lastName}`
                                : "N/A"}
                        </h3>

                        <p className="text-sm text-gray-700">
                            {f.reviewerId?.email || "N/A"}
                        </p>
                    </div>
                </div>
            ),
        },

        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <QuoteIcon className="w-4" />
                    {t("comment")}
                </div>
            ),
            accessor: (f) => f.review || "N/A",
        },

        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <StarIcon className="w-4" />
                    {t("rating")}
                </div>
            ),
            accessor: (f) => f.rating?.toFixed(1) || "0.0",
        },

        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <CalendarIcon className="w-4" />
                    {t("date")}
                </div>
            ),
            accessor: (f) => format(f.createdAt, "do MMM yyyy"),
        },

        {
            header: (
                <div className="text-[#DC3173] flex gap-2 items-center">
                    <TagsIcon className="w-4" />
                    {t("tags")}
                </div>
            ),
            accessor: (f) =>
                f.tags?.length ? (
                    <div className="flex gap-2 flex-wrap">
                        {f.tags.map((tag) => (
                            <Badge key={tag} className="bg-[#DC3173]">
                                {tag}
                            </Badge>
                        ))}
                    </div>
                ) : (
                    "N/A"
                ),
        },

        {
            header: (
                <div className="text-[#DC3173] flex justify-end gap-2 items-center">
                    <Cog className="w-4" />
                    {t("actions")}
                </div>
            ),
            className: "text-right",
            accessor: (f) => (
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <MoreVertical className="h-4 w-4" />
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openDetailsSheet(f)}>
                            {t("view")}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];
}