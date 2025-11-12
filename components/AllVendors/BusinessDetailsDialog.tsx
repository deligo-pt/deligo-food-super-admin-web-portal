import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TVendor } from "@/types/user.type";

export default function BusinessDetailsDialog({ vendor }: { vendor: TVendor }) {
  console.log(JSON.stringify(vendor.companyDetails));

  return (
    <Dialog>
      <DialogTrigger>Click to see</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-medium leading-none">
            Business Details & Location
          </DialogTitle>
        </DialogHeader>
        <div>
          <div className="grid gap-2">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right">
                Company Name
              </label>
              <p className="font-medium">
                {vendor?.companyDetails?.companyName}
              </p>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right">
                Company License Number
              </label>
              <p className="font-medium">
                {vendor?.companyDetails?.companyLicenseNumber}
              </p>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right">
                {" "}
                Address
              </label>
              <p className="font-medium">
                {vendor?.companyLocation?.streetAddress},{" "}
                {vendor?.companyLocation?.streetNumber},{" "}
                {vendor?.companyLocation?.city},{" "}
                {vendor?.companyLocation?.postalCode}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
