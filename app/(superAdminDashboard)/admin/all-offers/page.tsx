import ActiveCampaigns from "@/components/Dashboard/Offers/ActiveCampaigns/ActiveCampaigns";
import { getAllOffersReq } from "@/services/dashboard/offer/offer.service";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function AllOffersPage({ searchParams }: IProps) {
  const queries = (await searchParams) || {};
  const offersResult = await getAllOffersReq(queries);

  return (
    <ActiveCampaigns
      offersResult={offersResult}
      showFilters={true}
      title="all_offers"
      subtitle="manage_all_offers_here"
    />
  );
}
