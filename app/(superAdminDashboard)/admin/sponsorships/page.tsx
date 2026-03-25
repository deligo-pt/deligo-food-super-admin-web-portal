import Sponsorships from "@/components/Dashboard/Sponsorships/Sponsorships";
import { getAllSponsorshipsReq } from "@/services/dashboard/sponsorship/sponsorship.service";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function SponsorshipPage({ searchParams }: IProps) {
  const queries = (await searchParams) || {};
  const sponsorshipsResult = await getAllSponsorshipsReq(queries);

  return (
    <Sponsorships
      sponsorshipsResult={sponsorshipsResult}
      title="All Sponsorships"
      subtitle=" Manage all sponsorships here"
    />
  );
}
