import { SponsorshipDetails } from "@/components/Dashboard/Sponsorships/SponsorshipDetails";
import { getSingleSponsorshipReq } from "@/services/dashboard/sponsorship/sponsorship.service";
import { TSponsorship } from "@/types/sponsorship.type";

export default async function SponsorshipDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sponsorshipData: TSponsorship = await getSingleSponsorshipReq(id);

  return <SponsorshipDetails sponsorship={sponsorshipData} />;
}
