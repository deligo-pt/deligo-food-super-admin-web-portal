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
import { useStore } from "@/store/store";
import { TTax } from "@/types/tax.type";
import { motion } from "framer-motion";
import {
  Barcode,
  BookText,
  CheckCircle,
  CircleCheckBig,
  Cog,
  HashIcon,
  MoreVerticalIcon,
  Percent,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface IProps {
  taxes: TTax[];
  onEditClick: (tax: TTax) => void;
  onStatusChange: (id: string, status: boolean) => void;
  onDeleteClick: (id: string) => void;
  onPermanentDelete: (id: string) => void;
}

export default function TaxTable({
  taxes,
  onEditClick,
  onStatusChange,
  onDeleteClick,
  onPermanentDelete
}: IProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { lang } = useStore();

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
                <BookText className="w-4" />
                {t("name")}
              </div>
            </TableHead>
            <TableHead>
              <div className="text-[#DC3173] flex gap-2 items-center">
                <Barcode className="w-4" />
                {t("tax_code")}
              </div>
            </TableHead>
            <TableHead>
              <div className="text-[#DC3173] flex gap-2 items-center">
                <Percent className="w-4" />
                {t("rate")}
              </div>
            </TableHead>
            <TableHead>
              <div className="text-[#DC3173] flex gap-2 items-center">
                <HashIcon className="w-4" />
              {t("country_id")}
              </div>
            </TableHead>
            <TableHead>
              <div className="text-[#DC3173] flex gap-2 items-center">
                <CircleCheckBig className="w-4" />
                {t("active")}
              </div>
            </TableHead>
            <TableHead className="text-right text-[#DC3173] flex gap-2 items-center justify-end">
              <Cog className="w-4" />
              {t("actions")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {taxes?.length === 0 && (
            <TableRow>
              <TableCell
                className="text-[#DC3173] text-lg text-center"
                colSpan={6}
              >
                {t("no_tax_found")}
              </TableCell>
            </TableRow>
          )}
          {taxes?.map((tax) => (
            <TableRow key={tax._id}>
              <TableCell>{tax?.taxName?.[lang]}</TableCell>
              <TableCell>{tax?.taxCode}</TableCell>
              <TableCell>{tax?.taxRate}</TableCell>
              <TableCell>{tax?.countryID}</TableCell>
              <TableCell>
                {tax?.isActive ? (
                  <div className="flex gap-1 items-center text-green-500">
                    <CheckCircle size={16} /> {t("yes")}
                  </div>
                ) : (
                  <div className="flex gap-1 items-center text-destructive">
                    <XCircle size={16} />
                    {t("no")}
                  </div>
                )}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <MoreVerticalIcon className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      className=""
                      onClick={() => router.push(`/admin/all-taxes/${tax?._id}`)}
                    >
                      {t("view")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-[#DC3173]"
                      onClick={() => onEditClick(tax)}
                    >
                      {t("edit")}
                    </DropdownMenuItem>
                    {tax.isActive && (
                      <DropdownMenuItem
                        className="text-yellow-600"
                        onClick={() => onStatusChange(tax?._id, false)}
                      >
                        {t("deactivate")}
                      </DropdownMenuItem>
                    )}
                    {!tax.isActive && (
                      <>
                        <DropdownMenuItem
                          className="text-green-600"
                          onClick={() => onStatusChange(tax?._id, true)}
                        >
                          {t("activate")}
                        </DropdownMenuItem>
                        {tax?.isDeleted === false ? <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => onDeleteClick(tax?._id)}
                        >
                          {t("delete")}
                        </DropdownMenuItem> :
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => onPermanentDelete(tax?._id)}
                          >
                            {t("permanent_delete")}
                          </DropdownMenuItem>}
                      </>
                    )}
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
