import Vendors from "@/components/Dashboard/Vendors/Vendors";
import { getAllVendorsReq } from "@/services/dashboard/vendor/vendor.service";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function ActiveVendorsPage({ searchParams }: IProps) {
  const queries = (await searchParams) || {};
  const vendorsResult = await getAllVendorsReq({
    ...queries,
    status: "APPROVED",
  });

  return (
    <Vendors
      vendorsResult={vendorsResult}
      title="Active Vendors"
      subtitle="All approved vendors in the system"
    />
  );
}
