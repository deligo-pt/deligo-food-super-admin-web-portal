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
import { TVendor } from "@/types/user.type";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  CircleCheckBig,
  Cog,
  EyeIcon,
  IdCard,
  ShoppingBag,
  StarIcon,
  StoreIcon,
  UserPlus,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface IProps {
  vendors: TVendor[];
}

export default function VendorReportTable({ vendors }: IProps) {
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
                <StoreIcon className="w-4" />
                Vendor
              </div>
            </TableHead>
            <TableHead>
              <div className="text-[#DC3173] flex gap-2 items-center">
                <IdCard className="w-4" />
                Owner
              </div>
            </TableHead>
            <TableHead>
              <div className="text-[#DC3173] flex gap-2 items-center">
                <StarIcon className="w-4" />
                Rating
              </div>
            </TableHead>
            <TableHead>
              <div className="text-[#DC3173] flex gap-2 items-center">
                <ShoppingBag className="w-4" />
                Orders
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
          {vendors?.length === 0 && (
            <TableRow>
              <TableCell
                className="text-[#DC3173] text-lg text-center"
                colSpan={7}
              >
                No vendors found
              </TableCell>
            </TableRow>
          )}
          {vendors?.map((vendor) => (
            <TableRow key={vendor._id}>
              <TableCell className="flex items-center gap-3">
                <div>
                  <Avatar>
                    <AvatarImage
                      src={vendor.profilePhoto}
                      alt={`${vendor.name?.firstName} ${vendor.name?.lastName}`}
                    />
                    <AvatarFallback>
                      {vendor.name?.firstName?.charAt(0)}
                      {vendor.name?.lastName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <h3 className="font-medium">
                    {vendor.businessDetails?.businessName || "N/A"}
                  </h3>
                  <p className="text-sm text-gray-700">
                    {vendor.businessDetails?.businessType?.charAt(0)}
                    {vendor.businessDetails?.businessType
                      ?.toLowerCase()
                      ?.slice(1)}
                    {!vendor.businessDetails?.businessType && "N/A"}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <h3 className="font-medium">
                  {vendor.name?.firstName} {vendor.name?.lastName}
                  {!vendor.name?.firstName && !vendor.name?.lastName && "N/A"}
                </h3>
                <p className="text-sm text-gray-700">{vendor.email}</p>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <StarIcon className="w-4 text-yellow-500" />
                  <span>{vendor.rating?.average}</span>
                </div>
              </TableCell>
              <TableCell>{vendor.totalOrders || 0}</TableCell>
              <TableCell>
                <ReportStatusBadge status={vendor.status} />
              </TableCell>
              <TableCell>{format(vendor.createdAt, "do MMM yyyy")}</TableCell>
              <TableCell className="text-right">
                {!vendor.isDeleted && (
                  <Button
                    variant="ghost"
                    onClick={() =>
                      router.push("/admin/vendor/" + vendor.userId)
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
