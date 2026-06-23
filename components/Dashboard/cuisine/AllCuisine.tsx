"use client";

import AllFilters from "@/components/Filtering/AllFilters";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";
import { TMeta } from "@/types";
import { getSortOptions } from "@/utils/sortOptions";
import { motion } from "framer-motion";
import { CircleCheckBig, Cog, ListIcon, MoreVertical } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Import your newly created separate modal components
import DeleteCuisineModal, { IStatusInfo } from "./DeleteCuisineModal";
import EditCuisineModal from "./EditCuisineModal";
import { TCuisine } from "@/types/cuisine.type";

interface IProps {
    cuisineResult: {
        data: TCuisine[];
        meta?: TMeta;
    };
}

const AllCuisine = ({ cuisineResult }: IProps) => {
    const { t } = useTranslation();
    const sortOptions = getSortOptions(t);
    const router = useRouter();

    // Modal Control States
    const [selectedEditCuisine, setSelectedEditCuisine] = useState<TCuisine | null>(null);
    const [statusInfo, setStatusInfo] = useState<IStatusInfo>({ cuisineId: "", field: "" });

    return (
        <>
            <TitleHeader
                title={t("all_cuisine")}
                subtitle={t("explore_all_different_type_cuisines")}
            />
            <AllFilters sortOptions={sortOptions} />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white shadow-md rounded-2xl p-4 md:p-6 mb-2 overflow-x-auto"
            >
                <Table className="max-w-full">
                    <TableHeader>
                        <TableRow>
                            <TableHead>
                                <div className="text-[#DC3173] flex gap-2 items-center">
                                    <ListIcon className="w-4" />
                                    {t("name")}
                                </div>
                            </TableHead>
                            <TableHead>
                                <div className="text-[#DC3173] flex gap-2 items-center">
                                    <CircleCheckBig className="w-4" />
                                    {t("status")}
                                </div>
                            </TableHead>
                            <TableHead className="text-right text-[#DC3173] flex gap-2 items-center justify-end">
                                <Cog className="w-4" />
                                {t("actions")}
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {
                            cuisineResult?.data?.length < 1 && (
                                <TableRow>
                                    <TableCell
                                        className="text-[#DC3173] text-lg text-center"
                                        colSpan={3}
                                    >
                                        {t("no_cuisine_available_to_show")}
                                    </TableCell>
                                </TableRow>
                            )
                        }
                        {cuisineResult?.data?.map((cuisine) => (
                            <TableRow key={cuisine._id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        {cuisine.imageUrl && (
                                            <div>
                                                <Image
                                                    className="w-8 h-8 rounded-full object-cover"
                                                    src={cuisine.imageUrl}
                                                    alt={cuisine.name}
                                                    width={32}
                                                    height={32}
                                                />
                                            </div>
                                        )}
                                        <p className="font-medium uppercase">{cuisine.name}</p>
                                    </div>
                                </TableCell>
                                <TableCell
                                    className={cn(
                                        "font-medium",
                                        cuisine.isDeleted
                                            ? "text-red-500"
                                            : cuisine.isActive
                                                ? "text-green-500"
                                                : "text-yellow-500",
                                    )}
                                >
                                    {cuisine.isDeleted
                                        ? t("deleted")
                                        : cuisine.isActive
                                            ? t("active")
                                            : t("inactive")}
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => router.push(`/admin/cuisine/${cuisine._id}`)}>
                                                {t("view")}
                                            </DropdownMenuItem>

                                            <DropdownMenuItem onClick={() => setSelectedEditCuisine(cuisine)}>
                                                {t("edit")}
                                            </DropdownMenuItem>

                                            {!cuisine.isDeleted ? (
                                                <>
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            setStatusInfo({
                                                                cuisineId: cuisine._id,
                                                                isActive: !cuisine.isActive,
                                                                field: "isActive",
                                                            })
                                                        }
                                                    >
                                                        {cuisine.isActive ? t("deactivate") : t("activate")}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-amber-600 focus:text-amber-700"
                                                        onClick={() => setStatusInfo({ cuisineId: cuisine._id, field: "isDeleted" })}
                                                    >
                                                        {t("soft_delete")}
                                                    </DropdownMenuItem>
                                                </>
                                            ) : (
                                                <DropdownMenuItem disabled className="text-red-400">
                                                    {t("already_soft_deleted")}
                                                </DropdownMenuItem>
                                            )}

                                            <DropdownMenuItem
                                                className="text-red-600 focus:text-red-700 font-semibold"
                                                onClick={() => setStatusInfo({ cuisineId: cuisine._id, field: "isPermanentDelete" })}
                                            >
                                                {t("permanent_delete")}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </motion.div>

            {!!cuisineResult?.meta?.total && cuisineResult?.meta?.total > 0 && (
                <div className="px-6 mt-4">
                    <PaginationComponent totalPages={cuisineResult?.meta?.totalPage || 0} />
                </div>
            )}

            {/* edit modal */}
            <EditCuisineModal
                isOpen={selectedEditCuisine !== null}
                onClose={() => setSelectedEditCuisine(null)}
                cuisine={selectedEditCuisine}
                t={t}
            />

            {/* delete modal */}
            <DeleteCuisineModal
                statusInfo={statusInfo}
                onClose={() => setStatusInfo({ cuisineId: "", field: "" })}
                t={t}
            />
        </>
    );
};

export default AllCuisine;