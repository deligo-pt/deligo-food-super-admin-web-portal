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
  Cog,
  IdCard,
  Mail,
  MoreVertical,
  Phone,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface IProps {
  offers: TOffer[];
  handleStatusInfo: (
    offerId: string,
    offerName: string,
    status: string,
  ) => void;
  handleDeleteId: (id: string) => void;
}

export default function CampaignTable({
  offers,
  handleStatusInfo,
  handleDeleteId,
}: IProps) {
  const router = useRouter();

  console.log(handleStatusInfo);

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
                <IdCard className="w-4" />
                Offer
              </div>
            </TableHead>
            <TableHead>
              <div className="text-[#DC3173] flex gap-2 items-center">
                <Mail className="w-4" />
                Type
              </div>
            </TableHead>
            <TableHead>
              <div className="text-[#DC3173] flex gap-2 items-center">
                <Phone className="w-4" />
                Vendor
              </div>
            </TableHead>
            <TableHead>
              <div className="text-[#DC3173] flex gap-2 items-center">
                <CircleCheckBig className="w-4" />
                Discount
              </div>
            </TableHead>
            <TableHead>
              <div className="text-[#DC3173] flex gap-2 items-center">
                <CircleCheckBig className="w-4" />
                Duration
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
              <TableCell>{offer.description}</TableCell>
              <TableCell>
                {offer.offerType === "PERCENT" && `${offer.discountValue}%`}
                {offer.offerType === "BOGO" && "BOGO"}
                {offer.offerType === "FLAT" && `€${offer.discountValue}`}
              </TableCell>
              <TableCell>
                {format(offer.startDate, "yyyy-MM-dd")} to{" "}
                {format(offer.endDate, "yyyy-MM-dd")}
              </TableCell>
              <TableCell>{offer?.isActive ? "Active" : "Inactive"}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <MoreVertical className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      className=""
                      onClick={() =>
                        router.push("/admin/all-delivery-offers/" + offer._id)
                      }
                    >
                      View
                    </DropdownMenuItem>
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
