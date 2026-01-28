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
import { TSponsorship } from "@/types/sponsorship.type";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  Building2,
  CalendarIcon,
  CircleCheckBig,
  Cog,
  ImageIcon,
  MoreVertical,
} from "lucide-react";
import Image from "next/image";

interface IProps {
  sponsorships: TSponsorship[];
  handleStatusInfo: (
    sponsorshipId: string,
    sponsorshipName: string,
    isActive: boolean,
  ) => void;
  handleDeleteId: (id: string) => void;
}

export default function SponsorshipTable({
  sponsorships,
  handleStatusInfo,
  handleDeleteId,
}: IProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white shadow-md rounded-2xl p-4 md:p-6 mb-2 overflow-x-auto"
    >
      <Table className="max-w-full">
        <TableHeader>
          <TableRow>
            <TableHead>
              <div className="text-[#DC3173] flex gap-2 items-center">
                <ImageIcon className="w-4" />
                Banner
              </div>
            </TableHead>
            <TableHead>
              <div className="text-[#DC3173] flex gap-2 items-center">
                <Building2 className="w-4" />
                Name
              </div>
            </TableHead>
            <TableHead>
              <div className="text-[#DC3173] flex gap-2 items-center">
                <CircleCheckBig className="w-4" />
                Status
              </div>
            </TableHead>
            <TableHead>
              <div className="text-[#DC3173] flex gap-2 items-center">
                <CalendarIcon className="w-4" />
                Date
              </div>
            </TableHead>
            <TableHead className="text-right text-[#DC3173] flex gap-2 items-center justify-end">
              <Cog className="w-4" />
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sponsorships?.length === 0 && (
            <TableRow>
              <TableCell
                className="text-[#DC3173] text-lg text-center"
                colSpan={5}
              >
                No sponsorships found
              </TableCell>
            </TableRow>
          )}
          {sponsorships?.map((sponsorship) => (
            <TableRow key={sponsorship._id}>
              <TableCell>
                <Image
                  src={sponsorship.banner}
                  alt={sponsorship.name}
                  width={50}
                  height={50}
                  className="rounded-lg w-32 h-16 object-cover"
                />
              </TableCell>
              <TableCell>{sponsorship.name}</TableCell>
              <TableCell>
                {sponsorship.isActive ? "Active" : "Inactive"}
              </TableCell>
              <TableCell>
                {format(sponsorship.createdAt, "do MMM yyyy")}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <MoreVertical className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {sponsorship.isActive && (
                      <DropdownMenuItem
                        onClick={() =>
                          handleStatusInfo(
                            sponsorship._id,
                            sponsorship.name,
                            false,
                          )
                        }
                      >
                        Deactivate
                      </DropdownMenuItem>
                    )}
                    {!sponsorship.isActive && (
                      <DropdownMenuItem
                        onClick={() =>
                          handleStatusInfo(
                            sponsorship._id,
                            sponsorship.name,
                            true,
                          )
                        }
                      >
                        Activate
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDeleteId(sponsorship._id)}
                    >
                      Delete
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
