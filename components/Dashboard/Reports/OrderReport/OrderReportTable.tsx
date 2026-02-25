/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import ReportStatusBadge from "@/components/Dashboard/Reports/ReportStatusBadge/ReportStatusBadge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
    Calendar,
    CalendarIcon,
    CircleCheckBig,
    ContactRoundIcon,
    GiftIcon,
    ShoppingBagIcon,
    UserPlus,
} from "lucide-react";

interface IProps {
    orders: any[];
}

export default function OrderReportTable({ orders }: IProps) {

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white mb-2 overflow-x-auto"
        >
            <Table className="max-w-full">
                <TableHeader>
                    <TableRow>
                        <TableHead>
                            <div className="text-[#DC3173] flex gap-2 items-center">
                                <ContactRoundIcon className="w-4" />
                                ID
                            </div>
                        </TableHead>
                        <TableHead>
                            <div className="text-[#DC3173] flex gap-2 items-center">
                                <ShoppingBagIcon className="w-4" />
                                Restaurant
                            </div>
                        </TableHead>
                        <TableHead>
                            <div className="text-[#DC3173] flex gap-2 items-center">
                                <Calendar className="w-4" />
                                Date/Time
                            </div>
                        </TableHead>
                        <TableHead>
                            <div className="text-[#DC3173] flex gap-2 items-center">
                                <GiftIcon className="w-4" />
                                Courier
                            </div>
                        </TableHead>
                        <TableHead>
                            <div className="text-[#DC3173] flex gap-2 items-center">
                                <CalendarIcon className="w-4" />
                                Zone
                            </div>
                        </TableHead>
                        <TableHead>
                            <div className="text-[#DC3173] flex gap-2 items-center">
                                <UserPlus className="w-4" />
                                Amount
                            </div>
                        </TableHead>
                        <TableHead>
                            <div className="text-right text-[#DC3173] flex gap-2 items-center justify-end">
                                <CircleCheckBig className="w-4" />
                                Status
                            </div>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {orders?.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={8} className="text-center text-gray-500">
                                No orders found
                            </TableCell>
                        </TableRow>
                    )}

                    {orders?.map((order) => (
                        <TableRow key={order.orderId}>
                            {/* ID */}
                            <TableCell className="font-medium">
                                {order.orderId}
                            </TableCell>

                            {/* Restaurant */}
                            <TableCell>
                                {order?.vendorId?.name?.firstName || "N/"} {order?.vendorId?.name?.lastName || "A"}
                            </TableCell>

                            {/* Date / Time */}
                            <TableCell>
                                {format(order.createdAt, "dd MMM yyyy, hh:mm a")}
                            </TableCell>

                            {/* Courier */}
                            <TableCell>
                                {order?.deliveryPartnerId?.name?.firstName || "N/"} {order?.deliveryPartnerId?.name?.lastName || "A"}
                            </TableCell>

                            {/* Zone */}
                            <TableCell>
                                {order.deliveryAddress?.city || "N/A"}
                            </TableCell>

                            {/* Amount */}
                            <TableCell>
                                €{order.orderCalculation?.totalOriginalPrice || 0}
                            </TableCell>

                            {/* Status */}
                            <TableCell>
                                {/* <ReportStatusBadge status={order.orderStatus} /> */}
                                {order?.orderStatus || "N/A"}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </motion.div>
    );
}
