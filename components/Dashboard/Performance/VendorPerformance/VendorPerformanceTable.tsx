"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { TVendorPerformance } from "@/types/performance.type";
import { motion } from "framer-motion";
import {
  Cog,
  EuroIcon,
  MoreVertical,
  PackageIcon,
  StarIcon,
  StoreIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface IProps {
  vendors: TVendorPerformance[];
}

export default function VendorPerformanceTable({ vendors }: IProps) {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white shadow-md rounded-2xl p-4 md:p-6 mb-2"
    >
      <h3 className="text-xl font-semibold">{t("vendors")}</h3>
      <p className="text-gray-700 mb-2">{t("view_vendor_performance_analytics")}</p>

      <div className="overflow-x-auto">
        <Table className="max-w-full">
          <TableHeader>
            <TableRow>
              <TableHead>
                <div className="text-[#DC3173] flex gap-2 items-center">
                  <StoreIcon className="w-4" />
                  {t("vendor")}
                </div>
              </TableHead>
              <TableHead>
                <div className="text-[#DC3173] flex gap-2 items-center">
                  <PackageIcon className="w-4" />
                  {t("orders_capital")}
                </div>
              </TableHead>
              <TableHead>
                <div className="text-[#DC3173] flex gap-2 items-center">
                  <EuroIcon className="w-4" />
                  {t("revenue")}
                </div>
              </TableHead>
              <TableHead>
                <div className="text-[#DC3173] flex gap-2 items-center">
                  <StarIcon className="w-4" />
                  {t("rating")}
                </div>
              </TableHead>
              <TableHead className="text-right text-[#DC3173] flex gap-2 items-center justify-end">
                <Cog className="w-4" />
                {t("actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vendors?.length === 0 && (
              <TableRow>
                <TableCell
                  className="text-[#DC3173] text-lg text-center"
                  colSpan={5}
                >
                  {t("no_vendors_found")}
                </TableCell>
              </TableRow>
            )}
            {vendors?.map((vendor) => (
              <TableRow key={vendor._id}>
                <TableCell>
                  <div className="flex gap-4 items-center">
                    <div>
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={vendor.profilePhoto} />
                        <AvatarFallback>
                          {vendor.businessDetails?.businessName
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div>
                      <h3>{vendor.businessDetails?.businessName}</h3>
                      <p className="text-gray-700 text-sm">{vendor.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{vendor.totalOrders || 0}</TableCell>
                <TableCell>€{vendor.totalRevenue || 0}</TableCell>
                <TableCell>{vendor.rating?.average || 0}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <MoreVertical className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        className=""
                        onClick={() =>
                          router.push(
                            "/admin/vendor-performance/" + vendor.userId,
                          )
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
      </div>
    </motion.div>
  );
}
