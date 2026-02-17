"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { TRating } from "@/types/rating.type";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  CalendarIcon,
  Cog,
  MoreVertical,
  QuoteIcon,
  StarIcon,
  TagsIcon,
  UserIcon,
} from "lucide-react";

interface IProps {
  feedback: TRating[];
  openDetailsSheet: (feedback: TRating) => void;
}

export default function CustomerFeedbackTable({
  feedback,
  openDetailsSheet,
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
                <UserIcon className="w-4" />
                Customer
              </div>
            </TableHead>
            <TableHead>
              <div className="text-[#DC3173] flex gap-2 items-center">
                <QuoteIcon className="w-4" />
                Comment
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
                <CalendarIcon className="w-4" />
                Date
              </div>
            </TableHead>
            <TableHead>
              <div className="text-[#DC3173] flex gap-2 items-center">
                <TagsIcon className="w-4" />
                Tags
              </div>
            </TableHead>
            <TableHead className="text-right text-[#DC3173] flex gap-2 items-center justify-end">
              <Cog className="w-4" />
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {feedback?.length === 0 && (
            <TableRow>
              <TableCell
                className="text-[#DC3173] text-lg text-center"
                colSpan={5}
              >
                No feedback found
              </TableCell>
            </TableRow>
          )}
          {feedback?.map((f) => (
            <TableRow key={f._id}>
              <TableCell>
                <div className="flex gap-4 items-center">
                  <div>
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={f.reviewerId?.profilePhoto} />
                      <AvatarFallback>
                        {f.reviewerId?.name?.firstName?.charAt(0)}
                        {f.reviewerId?.name?.lastName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div>
                    <h3>
                      {f.reviewerId?.name?.firstName ||
                      f.reviewerId?.name?.lastName
                        ? `${f.reviewerId?.name?.firstName} ${f.reviewerId?.name?.lastName}`
                        : "N/A"}
                    </h3>
                    <p className="text-gray-700 text-sm">
                      {f.reviewerId?.email || "N/A"}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>{f.review || "N/A"}</TableCell>
              <TableCell>{f.rating?.toFixed(1) || "0.0"}</TableCell>
              <TableCell>{format(f.createdAt, "do MMM yyyy")}</TableCell>
              <TableCell>
                {f.tags?.length && f.tags?.length > 0 ? (
                  <div className="flex gap-2 flex-wrap items-center">
                    {f.tags?.map((t) => (
                      <Badge className="bg-[#DC3173]" key={t}>
                        {t}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  "N/A"
                )}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <MoreVertical className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => openDetailsSheet(f)}>
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
