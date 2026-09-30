import AddSponsorship from "@/components/Dashboard/Sponsorships/AddSponsorship";
import { getAllZones } from "@/services/dashboard/zone/zone.service";
import { queryStringFormatter } from "@/utils/formatter";

export default async function AddSponsorshipPage() {
  const query = {
    isDeleted: "false",
    limit: "100",
    isOperational: "true",
  };
  const queryString = queryStringFormatter(query);
  const zoneResults = await getAllZones(queryString);

  return <AddSponsorship zones={zoneResults?.data} />;
}
