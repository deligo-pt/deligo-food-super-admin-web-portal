import Vendors from "@/components/Dashboard/Vendors/Vendors";
import { getAllVendorsReq } from "@/services/dashboard/vendor/vendor.service";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function SubmittedVendorsPage({ searchParams }: IProps) {
  const queries = (await searchParams) || {};
  const vendorsResult = await getAllVendorsReq({
    ...queries,
    status: "SUBMITTED",
  });

  return (
    <Vendors
      vendorsResult={vendorsResult}
      title="Pending Approvals"
      subtitle="All submitted requests for vendor approval"
    />
  );
}
