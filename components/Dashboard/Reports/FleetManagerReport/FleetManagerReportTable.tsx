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
import { TAgent } from "@/types/user.type";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  BikeIcon,
  CircleCheckBig,
  Cog,
  ContactRoundIcon,
  EyeIcon,
  PackageCheckIcon,
  StarIcon,
  UserPlus,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface IProps {
  fleetManagers: TAgent[];
}

export default function FleetManagerReportTable({ fleetManagers }: IProps) {
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
                Fleet Manager
              </div>
            </TableHead>
            <TableHead>
              <div className="text-[#DC3173] flex gap-2 items-center">
                <BikeIcon className="w-4" />
                Drivers
              </div>
            </TableHead>
            <TableHead>
              <div className="text-[#DC3173] flex gap-2 items-center">
                <PackageCheckIcon className="w-4" />
                Deliveries
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
          {fleetManagers?.length === 0 && (
            <TableRow>
              <TableCell
                className="text-[#DC3173] text-lg text-center"
                colSpan={7}
              >
                No fleet managers found
              </TableCell>
            </TableRow>
          )}
          {fleetManagers?.map((f) => (
            <TableRow key={f._id}>
              <TableCell className="flex items-center gap-3">
                <div>
                  <Avatar>
                    <AvatarImage
                      src={f.profilePhoto}
                      alt={`${f.name?.firstName} ${f.name?.lastName}`}
                    />
                    <AvatarFallback>
                      {f.name?.firstName?.charAt(0)}
                      {f.name?.lastName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <h3 className="font-medium">
                    {f.name?.firstName} {f.name?.lastName}
                    {!f.name?.firstName && !f.name?.lastName && "N/A"}
                  </h3>
                  <p className="text-sm text-gray-700">{f.email}</p>
                </div>
              </TableCell>
              <TableCell>{f.operationalData?.totalDrivers || 0}</TableCell>
              <TableCell>{f.operationalData?.totalDeliveries || 0}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <StarIcon className="w-4 text-yellow-500" />
                  <span>{f.operationalData?.rating?.average || 0}</span>
                </div>
              </TableCell>
              <TableCell>{format(f.createdAt, "do MMM yyyy")}</TableCell>
              <TableCell>
                <ReportStatusBadge status={f.status} />
              </TableCell>
              <TableCell className="text-right">
                {!f.isDeleted && (
                  <Button
                    variant="ghost"
                    onClick={() => router.push("/admin/agent/" + f.userId)}
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
