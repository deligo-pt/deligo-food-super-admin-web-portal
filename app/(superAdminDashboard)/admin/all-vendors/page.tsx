import AllVendorsTitle from "@/components/AllVendors/AllVendorsTitle";
import VendorTable from "@/components/AllVendors/VendorTable";

export default function AllVendorsPage() {
  return (
    <div className="p-4 md:p-6 space-y-6 max-w-full overh">
      {/* Page Title */}
      <AllVendorsTitle />

      {/* Vendor Table */}
      <VendorTable />
    </div>
  );
}
