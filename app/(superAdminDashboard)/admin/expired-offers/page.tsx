import ActiveCampaigns from "@/components/Dashboard/Offers/ActiveCampaigns/ActiveCampaigns";
import { getAllOffersReq } from "@/services/dashboard/offer/offer.service";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function ExpiredOffersPage({ searchParams }: IProps) {
  const queries = (await searchParams) || {};
  const offersResult = await getAllOffersReq({
    ...queries,
    validStatus: "EXPIRED",
  });

  return (
    <ActiveCampaigns
      offersResult={offersResult}
      title="expired_offers"
      subtitle="list_of_all_expired_offers"
    />
  );
}
