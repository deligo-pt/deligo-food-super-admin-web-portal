import Vendors from "@/components/Dashboard/Vendors/Vendors";
import { getAllVendorsReq } from "@/services/dashboard/vendor/vendor.service";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function AllVendorsPage({ searchParams }: IProps) {
  const queries = (await searchParams) || {};
  const vendorsResult = await getAllVendorsReq(queries);

  return (
    <Vendors
      vendorsResult={vendorsResult}
      showFilters={true}
      title="All Vendors"
      subtitle="Manage all registered vendors"
    />
  );
}
