"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { TSponsorship } from "@/types/sponsorship.type";
import { format } from "date-fns";
import Image from "next/image";

interface IProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sponsorship: TSponsorship;
}

export default function ViewSponsorshipModal({
  open,
  onOpenChange,
  sponsorship,
}: IProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{sponsorship.sponsorName}</DialogTitle>
        </DialogHeader>
        <div>
          <div>
            <Image
              className="w-full h-32 object-cover"
              src={sponsorship.bannerImage}
              alt="Banner"
              width={500}
              height={500}
            />
          </div>
          <div>
            <p className="font-medium text-sm text-gray-800">Type</p>
            <p>{sponsorship.sponsorType}</p>
          </div>
          <div>
            <p className="font-medium text-sm text-gray-800">Type</p>
            <p
              className={cn(
                sponsorship.isActive ? "text-[#DC3173]" : "text-yellow-500",
              )}
            >
              {sponsorship.isActive ? "Active" : "Inactive"}
            </p>
          </div>
          <div>
            <p className="font-medium text-sm text-gray-800">Start Date</p>
            <p>{format(sponsorship.startDate, "do MMMM yyyy")}</p>
          </div>
          <div>
            <p className="font-medium text-sm text-gray-800">End Date</p>
            <p>{format(sponsorship.endDate, "do MMMM yyyy")}</p>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
