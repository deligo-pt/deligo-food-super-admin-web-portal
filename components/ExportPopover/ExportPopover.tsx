"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTranslation } from "@/hooks/use-translation";
import { DownloadIcon, FileSpreadsheetIcon, FileTextIcon } from "lucide-react";

interface IProps {
  onPDFClick?: () => void;
  onCSVClick?: () => void;
}

export default function ExportPopover({ onPDFClick, onCSVClick }: IProps) {
  const {t} = useTranslation();

  return (
    <Popover>
      <PopoverTrigger className="bg-white text-[#DC3173] hover:bg-slate-100 hover:text-[#DC3173]/90 px-4 py-2 rounded-md font-medium flex items-center gap-2 cursor-pointer print:hidden">
        <DownloadIcon className="h-5 w-5" />
        {t("export")}
      </PopoverTrigger>
      <PopoverContent className="w-fit p-2">
        {onPDFClick && (
          <div>
            <Button
              variant="ghost"
              className="flex gap-2 text-[#DC3173]"
              onClick={onPDFClick}
            >
              <FileTextIcon className="h-4 w-4" />
              {t("export_as_pdf")}
            </Button>
          </div>
        )}
        {onCSVClick && (
          <div>
            <Button
              variant="ghost"
              className="flex gap-2 text-[#DC3173]"
              onClick={onCSVClick}
            >
              <FileSpreadsheetIcon className="h-4 w-4" />
              {t("export_as_csv")}
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
