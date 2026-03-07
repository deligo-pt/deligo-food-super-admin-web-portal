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
import { TDeliveryPartnerPerformance } from "@/types/performance.type";
import { motion } from "framer-motion";
import {
  BikeIcon,
  Cog,
  EuroIcon,
  MoreVertical,
  PackageIcon,
  StarIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface IProps {
  partners: TDeliveryPartnerPerformance[];
}

export default function DeliveryPartnerPerformanceTable({ partners }: IProps) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white shadow-md rounded-2xl p-4 md:p-6 mb-2"
    >
      <h3 className="text-xl font-semibold">Delivery Partners</h3>
      <p className="text-gray-700 mb-2">
        View delivery partners performance analytics
      </p>

      <div className="overflow-x-auto">
        <Table className="max-w-full">
          <TableHeader>
            <TableRow>
              <TableHead>
                <div className="text-[#DC3173] flex gap-2 items-center">
                  <BikeIcon className="w-4" />
                  Partner
                </div>
              </TableHead>
              <TableHead>
                <div className="text-[#DC3173] flex gap-2 items-center">
                  <PackageIcon className="w-4" />
                  Deliveries
                </div>
              </TableHead>
              <TableHead>
                <div className="text-[#DC3173] flex gap-2 items-center">
                  <EuroIcon className="w-4" />
                  Earnings
                </div>
              </TableHead>
              <TableHead>
                <div className="text-[#DC3173] flex gap-2 items-center">
                  <StarIcon className="w-4" />
                  Rating
                </div>
              </TableHead>
              <TableHead className="text-right text-[#DC3173] flex gap-2 items-center justify-end">
                <Cog className="w-4" />
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {partners?.length === 0 && (
              <TableRow>
                <TableCell
                  className="text-[#DC3173] text-lg text-center"
                  colSpan={5}
                >
                  No delivery partners found
                </TableCell>
              </TableRow>
            )}
            {partners?.map((dp) => (
              <TableRow key={dp._id}>
                <TableCell>
                  <div className="flex gap-4 items-center">
                    <div>
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={dp.profilePhoto} />
                        <AvatarFallback>
                          {dp.name?.firstName?.charAt(0)}
                          {dp.name?.lastName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div>
                      <h3>
                        {dp.name?.firstName} {dp.name?.lastName}
                      </h3>
                      <p className="text-gray-700 text-sm">{dp.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {dp.operationalData?.totalDeliveries || 0}
                </TableCell>
                <TableCell>€{dp.totalEarnings || 0}</TableCell>
                <TableCell>
                  {dp.operationalData?.rating?.average || 0}
                </TableCell>
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
                            "/admin/delivery-partner-performance/" + dp.userId,
                          )
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
      </div>
    </motion.div>
  );
}
