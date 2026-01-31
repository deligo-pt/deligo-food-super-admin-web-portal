import { SponsorshipDetails } from "@/components/Dashboard/Sponsorships/SponsorshipDetails";
import { serverRequest } from "@/lib/serverFetch";
import { TResponse } from "@/types";
import { TSponsorship } from "@/types/sponsorship.type";

export default async function SponsorshipDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let sponsorshipData: TSponsorship = {} as TSponsorship;

  try {
    const result = (await serverRequest.get(
      `/sponsorships/${id}`,
    )) as TResponse<TSponsorship>;

    if (result?.success) {
      sponsorshipData = result.data;
    }
  } catch (err) {
    console.log("Server fetch error:", err);
  }

  return <SponsorshipDetails sponsorship={sponsorshipData} />;
}
