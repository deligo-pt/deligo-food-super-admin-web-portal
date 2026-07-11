"use client";

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
import { TDeliveryPartner } from "@/types/delivery-partner.type";
import { motion } from "framer-motion";
import {
    Cog,
    IdCard,
    Mail,
    MoreVertical,
    Phone,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface IProps {
    riders: Partial<TDeliveryPartner>[];
}

export default function FleetRidersTable({
    riders
}: IProps) {
    const { t } = useTranslation();
    const router = useRouter();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-2 overflow-x-auto"
        >
            <Table className="max-w-full">
                <TableHeader>
                    <TableRow>
                        <TableHead>
                            <div className="text-[#DC3173] flex gap-2 items-center">
                                <IdCard className="w-4" />
                                {t("name")}
                            </div>
                        </TableHead>
                        <TableHead>
                            <div className="text-[#DC3173] flex gap-2 items-center">
                                <Phone className="w-4" />
                                {t("userId")}
                            </div>
                        </TableHead>
                        <TableHead>
                            <div className="text-[#DC3173] flex gap-2 items-center">
                                <Mail className="w-4" />
                                {t("email")}
                            </div>
                        </TableHead>
                        <TableHead className="text-right text-[#DC3173] flex gap-2 items-center justify-end">
                            <Cog className="w-4" />
                            {t("actions")}
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {riders?.length === 0 && (
                        <TableRow>
                            <TableCell
                                className="text-[#DC3173] text-lg text-center"
                                colSpan={5}
                            >
                                {t("no_riders_registered_yet")}
                            </TableCell>
                        </TableRow>
                    )}
                    {riders?.map((rider) => (
                        <TableRow key={rider?.userId}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    {rider?.profilePhoto && (
                                        <div>
                                            <Image
                                                className="w-8 h-8 rounded-full object-cover"
                                                src={rider?.profilePhoto}
                                                alt={rider?.name?.firstName as string}
                                                width={32}
                                                height={32}
                                            />
                                        </div>
                                    )}
                                    <p>{rider?.name?.firstName} {rider?.name?.lastName}</p>
                                </div>
                            </TableCell>
                            <TableCell>{rider?.userId}</TableCell>
                            <TableCell>{rider?.email}</TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger>
                                        <MoreVertical className="h-4 w-4" />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem
                                            className=""
                                            onClick={() =>
                                                router.push("/admin/all-delivery-partners/" + rider?.userId)
                                            }
                                        >
                                            {t("view")}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </motion.div>
    );
}
