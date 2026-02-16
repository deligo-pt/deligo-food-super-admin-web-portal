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
import { TFleetManagerPerformance } from "@/types/performance.type";
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
  fleetManagers: TFleetManagerPerformance[];
}

export default function FleetManagerPerformanceTable({
  fleetManagers,
}: IProps) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white shadow-md rounded-2xl p-4 md:p-6 mb-2"
    >
      <h3 className="text-xl font-semibold">Fleet Managers</h3>
      <p className="text-gray-700 mb-2">
        View fleet managers performance analytics
      </p>

      <div className="overflow-x-auto">
        <Table className="max-w-full">
          <TableHeader>
            <TableRow>
              <TableHead>
                <div className="text-[#DC3173] flex gap-2 items-center">
                  <StoreIcon className="w-4" />
                  Manager
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
            {fleetManagers?.length === 0 && (
              <TableRow>
                <TableCell
                  className="text-[#DC3173] text-lg text-center"
                  colSpan={5}
                >
                  No fleet managers found
                </TableCell>
              </TableRow>
            )}
            {fleetManagers?.map((fm) => (
              <TableRow key={fm._id}>
                <TableCell>
                  <div className="flex gap-4 items-center">
                    <div>
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={fm.profilePhoto} />
                        <AvatarFallback>
                          {fm.name?.firstName?.charAt(0)}
                          {fm.name?.lastName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div>
                      <h3>
                        {fm.name?.firstName} {fm.name?.lastName}
                      </h3>
                      <p className="text-gray-700 text-sm">{fm.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {fm.operationalData?.totalDeliveries || 0}
                </TableCell>
                <TableCell>€{fm.totalEarnings || 0}</TableCell>
                <TableCell>
                  {fm.operationalData?.rating?.average || 0}
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
                          router.push("/admin/fleet-performance/" + fm.userId)
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
