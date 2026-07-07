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
import { useTranslation } from "@/hooks/use-translation";
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
import { useRouter } from "next/navigation";

interface IProps {
  sponsorships: TSponsorship[];
  handleDeleteId: (id: string) => void;
  handleOpenEditModal: (sponsorship: TSponsorship) => void;
}

export default function SponsorshipTable({
  sponsorships,
  handleDeleteId,
  handleOpenEditModal,
}: IProps) {
  const { t } = useTranslation();
  const router = useRouter();

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
                {t("banner")}
              </div>
            </TableHead>
            <TableHead>
              <div className="text-[#DC3173] flex gap-2 items-center">
                <Building2 className="w-4" />
                {t("name")}
              </div>
            </TableHead>
            <TableHead>
              <div className="text-[#DC3173] flex gap-2 items-center">
                <Building2 className="w-4" />
                {t("type")}
              </div>
            </TableHead>
            <TableHead>
              <div className="text-[#DC3173] flex gap-2 items-center">
                <CircleCheckBig className="w-4" />
                {t("status")}
              </div>
            </TableHead>
            <TableHead>
              <div className="text-[#DC3173] flex gap-2 items-center">
                <CalendarIcon className="w-4" />
                {t("period")}
              </div>
            </TableHead>
            <TableHead className="text-right text-[#DC3173] flex gap-2 items-center justify-end">
              <Cog className="w-4" />
              {t("actions")}
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
                {t("no_sponsorships_found")}
              </TableCell>
            </TableRow>
          )}
          {sponsorships?.map((sponsorship) => (
            <TableRow key={sponsorship._id}>
              <TableCell>
                <Image
                  src={sponsorship.bannerImage}
                  alt={sponsorship.sponsorName}
                  width={50}
                  height={50}
                  className="rounded-lg w-32 h-16 object-cover"
                />
              </TableCell>
              <TableCell>{sponsorship.sponsorName}</TableCell>
              <TableCell>{sponsorship.sponsorType}</TableCell>
              <TableCell>
                {sponsorship.isActive ? t("active") : t("inactive")}
              </TableCell>
              <TableCell>
                {format(sponsorship.startDate, "do MMM yyyy")} -{" "}
                {format(sponsorship.endDate, "do MMM yyyy")}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <MoreVertical className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() =>
                        router.push(`/admin/sponsorships/${sponsorship._id}`)
                      }
                    >
                      {t("view")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleOpenEditModal(sponsorship)}
                    >
                      {t("edit")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDeleteId(sponsorship._id)}
                    >
                      {t("delete")}
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
