"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { DownloadIcon } from "lucide-react";

interface IProps {
  onPDFClick?: () => void;
  onCSVClick?: () => void;
}

export default function ExportDropdown({ onPDFClick, onCSVClick }: IProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="bg-white text-[#DC3173] hover:bg-slate-100 hover:text-[#DC3173]/90 px-4 py-2 rounded-md font-medium flex items-center gap-2 cursor-pointer print:hidden">
        <DownloadIcon className="h-5 w-5" />
        Export
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {onPDFClick && (
          <DropdownMenuItem onClick={onPDFClick}>
            Export as PDF
          </DropdownMenuItem>
        )}
        {onCSVClick && (
          <DropdownMenuItem onClick={onCSVClick}>
            Export as CSV
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
