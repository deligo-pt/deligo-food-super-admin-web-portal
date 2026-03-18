import Vendors from "@/components/Dashboard/Vendors/Vendors";
import { getAllVendorsReq } from "@/services/dashboard/vendor/vendor.service";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function SuspendedVendorsPage({ searchParams }: IProps) {
  const queries = (await searchParams) || {};
  const vendorsResult = await getAllVendorsReq({
    ...queries,
    status: "BLOCKED",
  });

  return (
    <Vendors
      vendorsResult={vendorsResult}
      title="Suspended Vendors"
      subtitle="All blocked vendors from the system"
    />
  );
}
