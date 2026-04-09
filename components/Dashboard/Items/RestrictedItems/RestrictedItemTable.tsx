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
import { TRestrictedItem } from "@/types/product.type";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  Calendar,
  Cog,
  Layers,
  MessageSquareWarning,
  MoreVertical,
  PackageX,
} from "lucide-react";

interface IProps {
  restrictedItems: TRestrictedItem[];
  onEdit: (item: TRestrictedItem) => void;
  onDelete: (id: string) => void;
}

export default function RestrictedItemTable({
  restrictedItems,
  onEdit,
  onDelete,
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
                <PackageX className="w-4" />
                Name
              </div>
            </TableHead>
            <TableHead>
              <div className="text-[#DC3173] flex gap-2 items-center">
                <Layers className="w-4" />
                Category
              </div>
            </TableHead>
            <TableHead>
              <div className="text-[#DC3173] flex gap-2 items-center">
                <MessageSquareWarning className="w-4" />
                Reason
              </div>
            </TableHead>
            <TableHead>
              <div className="text-[#DC3173] flex gap-2 items-center">
                <Calendar className="w-4" />
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
          {restrictedItems?.length === 0 && (
            <TableRow>
              <TableCell
                className="text-[#DC3173] text-lg text-center"
                colSpan={5}
              >
                No restricted items found
              </TableCell>
            </TableRow>
          )}
          {restrictedItems?.map((restrictedItem) => (
            <TableRow key={restrictedItem._id}>
              <TableCell>{restrictedItem.name}</TableCell>
              <TableCell>{restrictedItem.category}</TableCell>
              <TableCell>{restrictedItem.reason}</TableCell>
              <TableCell>
                {format(restrictedItem.createdAt, "do MMM yyyy")}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <MoreVertical className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => onEdit(restrictedItem)}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => onDelete(restrictedItem._id)}
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
