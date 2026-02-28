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
import { TOffer } from "@/types/offer.type";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  CircleCheckBig,
  Clock,
  Cog,
  Hourglass,
  MoreVertical,
  PercentIcon,
  StoreIcon,
  TagsIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface IProps {
  offers: TOffer[];
  handleStatusInfo: (
    offerId: string,
    offerName: string,
    status: boolean,
  ) => void;
  handleOpenEditModal: (offer: TOffer) => void;
  handleDeleteId: (id: string) => void;
}

export default function CampaignTable({
  offers,
  handleStatusInfo,
  handleOpenEditModal,
  handleDeleteId,
}: IProps) {
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
                <StoreIcon className="w-4" />
                Title
              </div>
            </TableHead>
            <TableHead>
              <div className="text-[#DC3173] flex gap-2 items-center">
                <TagsIcon className="w-4" />
                Type
              </div>
            </TableHead>
            <TableHead>
              <div className="text-[#DC3173] flex gap-2 items-center">
                <PercentIcon className="w-4" />
                Discount
              </div>
            </TableHead>
            <TableHead>
              <div className="text-[#DC3173] flex gap-2 items-center">
                <Clock className="w-4" />
                Duration
              </div>
            </TableHead>
            <TableHead>
              <div className="text-[#DC3173] flex gap-2 items-center">
                <CircleCheckBig className="w-4" />
                Active Status
              </div>
            </TableHead>
            <TableHead>
              <div className="text-[#DC3173] flex gap-2 items-center">
                <Hourglass className="w-4" />
                Expire Status
              </div>
            </TableHead>
            <TableHead className="text-right text-[#DC3173] flex gap-2 items-center justify-end">
              <Cog className="w-4" />
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {offers?.length === 0 && (
            <TableRow>
              <TableCell
                className="text-[#DC3173] text-lg text-center"
                colSpan={5}
              >
                No offers found
              </TableCell>
            </TableRow>
          )}
          {offers?.map((offer) => (
            <TableRow key={offer._id}>
              <TableCell>{offer.title}</TableCell>
              <TableCell>{offer.offerType}</TableCell>
              <TableCell>
                {offer.offerType === "PERCENT"
                  ? `${offer.discountValue}%`
                  : offer.offerType === "FLAT"
                    ? `€${offer.discountValue}`
                    : "N/A"}
              </TableCell>
              <TableCell>
                {offer.validFrom && offer.expiresAt
                  ? `${format(offer.validFrom, "yyyy-MM-dd")} to ${format(offer.expiresAt, "yyyy-MM-dd")}`
                  : "N/A"}
              </TableCell>
              <TableCell>{offer?.isActive ? "Active" : "Inactive"}</TableCell>
              <TableCell>
                {new Date(offer.expiresAt).getTime() - new Date().getTime() > 0
                  ? "Active"
                  : "Expired"}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <MoreVertical className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() =>
                        router.push("/admin/all-offers/" + offer._id)
                      }
                    >
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleOpenEditModal(offer)}
                    >
                      Edit
                    </DropdownMenuItem>
                    {offer.isActive && (
                      <DropdownMenuItem
                        onClick={() =>
                          handleStatusInfo(offer._id, offer.title, false)
                        }
                      >
                        Deactivate
                      </DropdownMenuItem>
                    )}
                    {!offer.isActive && (
                      <DropdownMenuItem
                        onClick={() =>
                          handleStatusInfo(offer._id, offer.title, true)
                        }
                      >
                        Activate
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDeleteId(offer._id)}
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
