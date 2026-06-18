"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, ShieldAlert, FileText, Cog, MoreVertical, Edit, Eye } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { TSystemPermission } from "@/types/permission.type";

interface IProps {
    permissions: TSystemPermission[];
    onOpenEditModal?: (permission: TSystemPermission) => void;
}

export default function PermissionsTable({ permissions = [], onOpenEditModal }: IProps) {
    const router = useRouter();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white shadow-sm border border-gray-100 rounded-2xl p-4 md:p-6 mb-5 overflow-x-auto"
        >
            <Table className="max-w-full">
                <TableHeader>
                    <TableRow className="hover:bg-transparent border-b border-gray-100">
                        <TableHead className="h-11">
                            <div className="text-[#DC3173] flex gap-2 items-center font-bold text-xs uppercase tracking-wider">
                                <FileText className="w-3.5 h-3.5" />
                                Permission Name
                            </div>
                        </TableHead>
                        <TableHead className="h-11">
                            <div className="text-[#DC3173] flex gap-2 items-center font-bold text-xs uppercase tracking-wider">
                                <Shield className="w-3.5 h-3.5" />
                                System Action Key
                            </div>
                        </TableHead>
                        <TableHead className="h-11">
                            <div className="text-[#DC3173] flex gap-2 items-center font-bold text-xs uppercase tracking-wider">
                                <ShieldAlert className="w-3.5 h-3.5" />
                                Status
                            </div>
                        </TableHead>
                        <TableHead className="text-right h-11">
                            <div className="text-[#DC3173] flex gap-2 items-center justify-end font-bold text-xs uppercase tracking-wider">
                                <Cog className="w-3.5 h-3.5" />
                                Actions
                            </div>
                        </TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {permissions.length === 0 ? (
                        <TableRow>
                            <TableCell
                                className="text-gray-400 font-medium text-sm text-center py-12"
                                colSpan={4}
                            >
                                No platform security permissions defined.
                            </TableCell>
                        </TableRow>
                    ) : (
                        permissions.map((permission) => (
                            <TableRow
                                key={permission._id}
                                className="hover:bg-gray-50/50 border-b border-gray-100 transition-colors"
                            >
                                {/* NAME */}
                                <TableCell className="font-bold text-sm text-gray-900 max-w-[240px] truncate">
                                    {permission.name}
                                </TableCell>

                                {/* SYSTEM ACTION KEY */}
                                <TableCell className="font-mono text-xs text-gray-600 bg-gray-50/60 rounded-md py-1 px-2 inline-block my-3">
                                    {permission.action}
                                </TableCell>

                                {/* ACTIVE STATUS BADGE */}
                                <TableCell>
                                    <Badge
                                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold border shadow-none ${permission.isActive
                                            ? "bg-green-50 text-green-700 border-green-200"
                                            : "bg-red-50 text-red-600 border-red-100"
                                            }`}
                                    >
                                        {permission.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                </TableCell>

                                {/* ACTIONS */}
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none">
                                            <MoreVertical className="h-4 w-4 text-gray-500" />
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="rounded-xl p-1 shadow-md border-gray-100">

                                            {/* VIEW ACTION */}
                                            <DropdownMenuItem
                                                className="cursor-pointer flex gap-2 items-center rounded-lg font-medium text-gray-700 text-xs py-2 focus:text-[#DC3173] focus:bg-[#FFF1F7]"
                                                onClick={() => router.push(`/admin/permissions/${permission._id}`)}
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                View
                                            </DropdownMenuItem>

                                            {/* EDIT ACTION */}
                                            <DropdownMenuItem
                                                className="cursor-pointer flex gap-2 items-center rounded-lg font-medium text-gray-700 text-xs py-2 focus:text-[#DC3173] focus:bg-[#FFF1F7]"
                                                onClick={() => onOpenEditModal?.(permission)}
                                            >
                                                <Edit className="w-3.5 h-3.5" />
                                                Edit
                                            </DropdownMenuItem>

                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </motion.div>
    );
}