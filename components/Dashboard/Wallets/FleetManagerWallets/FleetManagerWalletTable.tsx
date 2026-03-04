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
import { TFleetManagerWallet } from "@/types/wallet.type";
import { formatPrice } from "@/utils/formatPrice";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  CalendarIcon,
  Cog,
  EuroIcon,
  HashIcon,
  MoreVertical,
  UserIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface IProps {
  wallets: TFleetManagerWallet[];
}

export default function FleetManagerWalletTable({ wallets }: IProps) {
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
                <HashIcon className="w-4" />
                Wallet ID
              </div>
            </TableHead>
            <TableHead>
              <div className="text-[#DC3173] flex gap-2 items-center">
                <UserIcon className="w-4" />
                Fleet Manager
              </div>
            </TableHead>
            <TableHead>
              <div className="text-[#DC3173] flex gap-2 items-center">
                <EuroIcon className="w-4" />
                Balance
              </div>
            </TableHead>
            <TableHead>
              <div className="text-[#DC3173] flex gap-2 items-center">
                <CalendarIcon className="w-4" />
                Last Settlement
              </div>
            </TableHead>
            <TableHead className="text-right text-[#DC3173] flex gap-2 items-center justify-end">
              <Cog className="w-4" />
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {wallets?.length === 0 && (
            <TableRow>
              <TableCell
                className="text-[#DC3173] text-lg text-center"
                colSpan={5}
              >
                No wallets found
              </TableCell>
            </TableRow>
          )}
          {wallets?.map((w) => (
            <TableRow key={w._id}>
              <TableCell>{w.walletId}</TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={w.userId?.profilePhoto} />
                    <AvatarFallback>
                      {w.userId?.name?.firstName?.charAt(0)}
                      {w.userId?.name?.lastName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {w.userId?.name?.firstName} {w.userId?.name?.lastName}
                    </div>
                    <div className="text-xs text-slate-500">
                      {w.userId?.email || "N/A"}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>€{formatPrice(w.totalUnpaidEarnings || 0)}</TableCell>
              <TableCell>
                {w.lastSettlementDate
                  ? format(w.lastSettlementDate, "do MMM yyyy")
                  : "N/A"}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <MoreVertical className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() =>
                        router.push(
                          `/admin/fleet-manager-wallets/${w.walletId}`,
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
    </motion.div>
  );
}
