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
import { IAgreement } from "@/types/agreement.type";
import { motion } from "framer-motion";
import {
    CircleCheckBig,
    Cog,
    FileText,
    Mail,
    MoreVertical,
    Phone,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface IProps {
    agreements: IAgreement[];
}

export default function AgreementsTable({ agreements }: IProps) {
    const router = useRouter();

    // status badge helper function
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

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white shadow-md rounded-2xl p-4 md:p-6 mb-5 overflow-x-auto"
        >
            <Table className="max-w-full">
                <TableHeader>
                    <TableRow>
                        <TableHead>
                            <div className="text-[#DC3173] flex gap-2 items-center">
                                <FileText className="w-4" />
                                Establishment
                            </div>
                        </TableHead>
                        <TableHead>
                            <div className="text-[#DC3173] flex gap-2 items-center">
                                <Mail className="w-4" />
                                Email
                            </div>
                        </TableHead>
                        <TableHead>
                            <div className="text-[#DC3173] flex gap-2 items-center">
                                <Phone className="w-4" />
                                Phone
                            </div>
                        </TableHead>
                        <TableHead>
                            <div className="text-[#DC3173] flex gap-2 items-center">
                                <CircleCheckBig className="w-4" />
                                Status
                            </div>
                        </TableHead>
                        <TableHead className="text-right text-[#DC3173] flex gap-2 items-center justify-end">
                            <Cog className="w-4" />
                            Actions
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {agreements?.length === 0 && (
                        <TableRow>
                            <TableCell
                                className="text-[#DC3173] text-lg text-center"
                                colSpan={5}
                            >
                                No agreements found
                            </TableCell>
                        </TableRow>
                    )}
                    {agreements?.map((agreement) => (
                        <TableRow key={agreement._id} className="hover:bg-slate-50 transition-colors">
                            <TableCell className="font-medium text-slate-900">
                                {agreement.establishmentName || "N/A"}
                            </TableCell>
                            <TableCell className="text-slate-600">{agreement.email}</TableCell>
                            <TableCell className="text-slate-600">{agreement.contactNumber}</TableCell>
                            <TableCell>
                                <span className={getStatusClass(agreement.status)}>
                                    {agreement.status}
                                </span>
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                                        <MoreVertical className="h-4 w-4 text-slate-500" />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-32">
                                        <DropdownMenuItem
                                            className="cursor-pointer font-medium text-slate-700 focus:text-[#DC3173]"
                                            onClick={() =>
                                                router.push(`/admin/vendor-agreements/${agreement._id}`)
                                            }
                                        >
                                            View
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