"use client";

import ReportStatusBadge from "@/components/Dashboard/Reports/ReportStatusBadge/ReportStatusBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TCustomer } from "@/types/user.type";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  CalendarIcon,
  CircleCheckBig,
  Cog,
  ContactRoundIcon,
  EuroIcon,
  EyeIcon,
  GiftIcon,
  ShoppingBagIcon,
  UserPlus,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface IProps {
  customers: TCustomer[];
}

export default function CustomerReportTable({ customers }: IProps) {
  const router = useRouter();

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
                Customer
              </div>
            </TableHead>
            <TableHead>
              <div className="text-[#DC3173] flex gap-2 items-center">
                <ShoppingBagIcon className="w-4" />
                Orders
              </div>
            </TableHead>
            <TableHead>
              <div className="text-[#DC3173] flex gap-2 items-center">
                <EuroIcon className="w-4" />
                Total Spent
              </div>
            </TableHead>
            <TableHead>
              <div className="text-[#DC3173] flex gap-2 items-center">
                <GiftIcon className="w-4" />
                Points
              </div>
            </TableHead>
            <TableHead>
              <div className="text-[#DC3173] flex gap-2 items-center">
                <CalendarIcon className="w-4" />
                Last Ordered
              </div>
            </TableHead>
            <TableHead>
              <div className="text-[#DC3173] flex gap-2 items-center">
                <UserPlus className="w-4" />
                Joined
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
          {customers?.length === 0 && (
            <TableRow>
              <TableCell
                className="text-[#DC3173] text-lg text-center"
                colSpan={8}
              >
                No delivery partner found
              </TableCell>
            </TableRow>
          )}
          {customers?.map((c) => (
            <TableRow key={c._id}>
              <TableCell className="flex items-center gap-3">
                <div>
                  <Avatar>
                    <AvatarImage
                      src={c.profilePhoto}
                      alt={`${c.name?.firstName} ${c.name?.lastName}`}
                    />
                    <AvatarFallback>
                      {c.name?.firstName?.charAt(0)}
                      {c.name?.lastName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <h3 className="font-medium">
                    {c.name?.firstName} {c.name?.lastName}
                    {!c.name?.firstName && !c.name?.lastName && "N/A"}
                  </h3>
                  <p className="text-sm text-gray-700">{c.email}</p>
                </div>
              </TableCell>
              <TableCell>{c.orders?.totalOrders || 0}</TableCell>
              <TableCell>€{c.orders?.totalSpent || 0}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <GiftIcon className="w-4 text-yellow-500" />
                  <span>{c.loyaltyPoints || 0}</span>
                </div>
              </TableCell>
              <TableCell>
                {c.orders?.lastOrderDate
                  ? format(c.orders?.lastOrderDate, "do MMM yyyy")
                  : "N/A"}
              </TableCell>
              <TableCell>
                {format(c.createdAt as Date, "do MMM yyyy")}
              </TableCell>
              <TableCell>
                <ReportStatusBadge status={c.status} />
              </TableCell>
              <TableCell className="text-right">
                {!c.isDeleted && (
                  <Button
                    variant="ghost"
                    onClick={() =>
                      router.push("/admin/all-customers/" + c.userId)
                    }
                  >
                    <EyeIcon />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </motion.div>
  );
}
