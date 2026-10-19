import AddSponsorship from "@/components/Dashboard/Sponsorships/AddSponsorship";
import { getAllVendors } from "@/services/dashboard/vendor/vendor.service";
import { getAllZones } from "@/services/dashboard/zone/zone.service";
import { TMeta } from "@/types";
import { TVendor } from "@/types/user.type";
import { queryStringFormatter } from "@/utils/formatter";

interface IProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const AddSponsorshipPage = async ({ searchParams }: IProps) => {
  const searchParamsObj = await searchParams;
  const queryString = queryStringFormatter({
    ...searchParamsObj,
    fields: 'businessDetails.businessName',
    status: "APPROVED",
    limit: "20",
    page: "1",
  });

  const vendorResults = await getAllVendors(queryString);

  const query = {
    isDeleted: "false",
    limit: "100",
    isOperational: "true",
  };
  const zoneQueryString = queryStringFormatter(query);
  const zoneResults = await getAllZones(zoneQueryString);


  return <AddSponsorship zones={zoneResults?.data} vendorResults={vendorResults as { data: TVendor[]; meta: TMeta }} />;
}

export default AddSponsorshipPage;